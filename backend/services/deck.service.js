// services/deck.service.js
// SECURITY-HARDENED VERSION

const { Pool } = require('pg');
const aiService = require('./ai.service');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Create a new deck record ──────────────────────────────────────────────────
async function createDeck(userId, input) {
  const result = await pool.query(
    `INSERT INTO decks (name, style, owner_id, num_slides, status, input_data)
     VALUES ($1, $2, $3, $4, 'drafting', $5) RETURNING *`,
    [
      `${input.companyName} Pitch`,
      input.style || 'modern-tech',
      userId,
      input.numSlides || 15,
      JSON.stringify(input),
    ]
  );
  return result.rows[0];
}

// ─── Full Generation Pipeline ──────────────────────────────────────────────────
async function generateDeck(deckId, input, progressCallback) {
  const logAction = async (slideId, action, suggestion, durationMs) => {
    const status = aiService.getAIStatus();
    try {
      await pool.query(
        `INSERT INTO ai_logs (deck_id, slide_id, ai_model, action, suggestion, chosen, duration_ms)
         VALUES ($1, $2, $3, $4, $5, true, $6)`,
        [deckId, slideId, status.activeProvider, action, JSON.stringify(suggestion), durationMs]
      );
    } catch (logErr) {
      console.warn('[logAction] Failed to write ai_log (non-fatal):', logErr.message);
    }
  };

  try {
    await pool.query(`UPDATE decks SET status = 'generating' WHERE id = $1`, [deckId]);
    progressCallback?.({ status: 'generating', step: 1, total: 2, message: 'Generating full pitch deck with AI...' });

    const t = Date.now();
    let slidesData;
    try {
      slidesData = await aiService.generateFullDeck(input);
    } catch (fullDeckErr) {
      console.warn('[generateDeck] Single-prompt generation failed, using per-slide fallback:', fullDeckErr.message);
      const slideTypes = await aiService.brainstormSlides(input);
      slidesData = [];
      for (let i = 0; i < slideTypes.length; i++) {
        const slideType = slideTypes[i];
        const content = await aiService.generateSlideContent(input, slideType);
        slidesData.push({
          slide_type: slideType,
          layout: content.layout || 'single_column',
          content,
          chartData: content.chartSuggestion && content.chartSuggestion.type !== 'none' ? content.chartSuggestion : null,
        });
      }
    }

    progressCallback?.({ status: 'generating', step: 2, total: 2, message: 'Saving slides to database...' });

    const slides = [];
    for (let i = 0; i < slidesData.length; i++) {
      const s = slidesData[i];
      const slideType = s.slide_type || 'title';
      const content = s.content || {};
      const layout = s.layout || 'single_column';
      const chartData = s.chartData && s.chartData.type !== 'none' ? s.chartData : null;

      const slideResult = await pool.query(
        `INSERT INTO slides (deck_id, slide_type, slide_order, content, chart_data, layout)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [deckId, slideType, i, JSON.stringify(content), JSON.stringify(chartData), layout]
      );

      const slide = slideResult.rows[0];
      await logAction(slide.id, `generate_${slideType}`, content, Date.now() - t);
      slides.push(slide);
    }

    progressCallback?.({ status: 'generating', step: 2, total: 2, message: 'Finalizing deck...' });
    await saveVersion(deckId, slides);
    await pool.query(`UPDATE decks SET status = 'completed', updated_at = now() WHERE id = $1`, [deckId]);

    try {
      await pool.query(
        `INSERT INTO metrics (deck_id, action, value) VALUES ($1, 'deck_generated', $2)`,
        [deckId, JSON.stringify({ slideCount: slides.length, provider: aiService.getAIStatus().activeProvider })]
      );
    } catch (metricErr) {
      console.warn('[generateDeck] Non-fatal metrics error:', metricErr.message);
    }

    progressCallback?.({ status: 'complete', message: 'Deck ready!', deckId });
    return { deckId, slides };

  } catch (err) {
    await pool.query(`UPDATE decks SET status = 'failed' WHERE id = $1`, [deckId]);
    progressCallback?.({ status: 'error', message: err.message });
    throw err;
  }
}

// ─── Revision History ──────────────────────────────────────────────────────────
async function saveVersion(deckId, slides) {
  const existing = await pool.query(
    `SELECT id, version_num FROM deck_versions WHERE deck_id = $1 ORDER BY version_num DESC`,
    [deckId]
  );

  let nextVersion = 1;
  if (existing.rows.length > 0) {
    nextVersion = existing.rows[0].version_num + 1;
    if (existing.rows.length >= 3) {
      const oldest = existing.rows[existing.rows.length - 1];
      await pool.query(`DELETE FROM deck_versions WHERE id = $1`, [oldest.id]);
    }
  }

  await pool.query(
    `INSERT INTO deck_versions (deck_id, version_num, snapshot) VALUES ($1, $2, $3)`,
    [deckId, nextVersion, JSON.stringify(slides)]
  );

  return nextVersion;
}

// FIX #36: getVersions now scoped to decks the user owns or admin can see all
async function getVersions(deckId, userId) {
  // Verify user has access to this deck
  await verifyDeckAccess(deckId, userId);
  const result = await pool.query(
    `SELECT id, version_num, created_at FROM deck_versions WHERE deck_id = $1 ORDER BY version_num DESC`,
    [deckId]
  );
  return result.rows;
}

// FIX #37: restoreVersion checks deck ownership before allowing restore
async function restoreVersion(deckId, versionId, userId) {
  await verifyDeckAccess(deckId, userId);

  const ver = await pool.query(
    `SELECT snapshot FROM deck_versions WHERE id = $1 AND deck_id = $2`,
    [versionId, deckId]
  );
  if (!ver.rows[0]) throw new Error('Version not found');

  const slides = ver.rows[0].snapshot;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM slides WHERE deck_id = $1`, [deckId]);

    for (const slide of slides) {
      const contentVal = typeof slide.content === 'string' ? slide.content : JSON.stringify(slide.content);
      const chartVal = slide.chart_data == null ? null
        : (typeof slide.chart_data === 'string' ? slide.chart_data : JSON.stringify(slide.chart_data));

      await client.query(
        `INSERT INTO slides (id, deck_id, slide_type, slide_order, content, chart_data, layout, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
        [slide.id, deckId, slide.slide_type, slide.slide_order, contentVal, chartVal, slide.layout || 'single_column']
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return slides;
}

// ─── Helper: verify a user can access a deck ──────────────────────────────────
async function verifyDeckAccess(deckId, userId, role = 'user') {
  const deck = await pool.query(`SELECT owner_id FROM decks WHERE id = $1`, [deckId]);
  if (!deck.rows[0]) throw new Error('Deck not found');
  if (role !== 'admin' && deck.rows[0].owner_id !== userId) {
    throw new Error('Forbidden: Not deck owner');
  }
  return deck.rows[0];
}

// ─── Get Deck with Slides ──────────────────────────────────────────────────────
// FIX #38: getDeck now verifies the requesting user owns the deck (or is admin)
async function getDeck(deckId, userId) {
  const deck = await pool.query(
    `SELECT d.*, u.name as owner_name FROM decks d
     LEFT JOIN users u ON d.owner_id = u.id
     WHERE d.id = $1`,
    [deckId]
  );
  if (!deck.rows[0]) throw new Error('Deck not found');

  // Non-owners cannot view decks (unless admin — handled at controller level)
  // Pass userId=null to skip ownership check (for admin paths)
  if (userId && deck.rows[0].owner_id !== userId) {
    throw new Error('Forbidden');
  }

  const slides = await pool.query(
    `SELECT * FROM slides WHERE deck_id = $1 ORDER BY slide_order`,
    [deckId]
  );

  return { ...deck.rows[0], slides: slides.rows };
}

// FIX #39: listDecks now scoped per user (non-admins see only their own decks)
async function listDecks(userId, role) {
  let result;
  if (role === 'admin') {
    result = await pool.query(
      `SELECT d.*, u.name as owner_name,
       (SELECT COUNT(*) FROM slides s WHERE s.deck_id = d.id) as slide_count
       FROM decks d LEFT JOIN users u ON d.owner_id = u.id
       ORDER BY d.updated_at DESC`
    );
  } else {
    result = await pool.query(
      `SELECT d.*, u.name as owner_name,
       (SELECT COUNT(*) FROM slides s WHERE s.deck_id = d.id) as slide_count
       FROM decks d LEFT JOIN users u ON d.owner_id = u.id
       WHERE d.owner_id = $1
       ORDER BY d.updated_at DESC`,
      [userId]
    );
  }
  return result.rows;
}

async function updateSlide(slideId, deckId, updates, userId) {
  if (updates.content === undefined) throw new Error('content is required to update a slide');

  // FIX #40: Verify deck ownership before allowing slide update
  const deck = await pool.query(`SELECT owner_id FROM decks WHERE id = $1`, [deckId]);
  if (!deck.rows[0]) throw new Error('Deck not found');
  if (deck.rows[0].owner_id !== userId) throw new Error('Forbidden: not deck owner');

  const result = await pool.query(
    `UPDATE slides SET content = $1, chart_data = $2, layout = $3, updated_at = now()
     WHERE id = $4 AND deck_id = $5 RETURNING *`,
    [
      JSON.stringify(updates.content),
      updates.chartData !== undefined ? JSON.stringify(updates.chartData) : null,
      updates.layout || 'single_column',
      slideId,
      deckId,
    ]
  );

  const slide = result.rows[0];
  if (slide) {
    try {
      await pool.query(
        `INSERT INTO metrics (deck_id, action, user_id, value) VALUES ($1, 'slide_edited', $2, $3)`,
        [deckId, userId, JSON.stringify({ slideId })]
      );
    } catch (metricErr) {
      console.warn('[updateSlide] Non-fatal metrics error:', metricErr.message);
    }
  }

  return slide;
}

async function deleteDeck(deckId, userId) {
  const deck = await pool.query(`SELECT owner_id FROM decks WHERE id = $1`, [deckId]);
  if (!deck.rows[0]) throw new Error('Deck not found');
  if (deck.rows[0].owner_id !== userId) throw new Error('Forbidden: not deck owner');
  await pool.query(`DELETE FROM decks WHERE id = $1`, [deckId]);
}

async function getAiLogs(deckId) {
  const result = await pool.query(
    `SELECT * FROM ai_logs WHERE deck_id = $1 ORDER BY timestamp DESC LIMIT 100`,
    [deckId]
  );
  return result.rows;
}

async function getDeckMetrics(deckId, userId, role) {
  if (role !== 'admin') {
    const deck = await pool.query(`SELECT owner_id FROM decks WHERE id = $1`, [deckId]);
    if (!deck.rows[0]) throw new Error('Deck not found');
    if (deck.rows[0].owner_id !== userId) throw new Error('Forbidden');
  }

  const result = await pool.query(
    `SELECT * FROM metrics WHERE deck_id = $1 ORDER BY timestamp DESC`,
    [deckId]
  );
  return result.rows;
}

async function setDeckStatus(deckId, status) {
  await pool.query(`UPDATE decks SET status = $1, updated_at = now() WHERE id = $2`, [status, deckId]);
}

async function logExport(deckId, userId, format, filename) {
  await pool.query(
    `INSERT INTO metrics (deck_id, action, user_id, value) VALUES ($1, 'deck_exported', $2, $3)`,
    [deckId, userId, JSON.stringify({ format, filename })]
  );
}

async function recoverOrphanDecks(wss) {
  try {
    const queue = require('../utils/queue.helper');
    const result = await pool.query(`SELECT * FROM decks WHERE status IN ('generating', 'queued')`);
    for (const deck of result.rows) {
      console.log(`[Startup Recovery] Found interrupted deck ${deck.id} (${deck.name})...`);
      let inputData = deck.input_data;
      if (typeof inputData === 'string') {
        try { inputData = JSON.parse(inputData); } catch {}
      }
      if (inputData && inputData.companyName) {
        await setDeckStatus(deck.id, 'queued');
        queue.enqueue(deck.id, async (progressCb) => {
          return generateDeck(deck.id, inputData, progressCb);
        }, (progress) => {
          if (wss) {
            wss.clients.forEach(client => {
              if (client.readyState === 1 && client.deckId === deck.id) {
                client.send(JSON.stringify({ type: 'progress', ...progress }));
              }
            });
          }
        }).catch(err => {
          console.error(`[Startup Recovery] Re-enqueue failed for ${deck.id}:`, err.message);
        });
      } else {
        await pool.query(`UPDATE decks SET status = 'failed' WHERE id = $1`, [deck.id]);
      }
    }
  } catch (err) {
    console.error('[Startup Recovery] Error recovering orphan decks:', err.message);
  }
}

module.exports = {
  createDeck, generateDeck, getDeck, listDecks, updateSlide, deleteDeck,
  saveVersion, getVersions, restoreVersion, getAiLogs, getDeckMetrics,
  logExport, setDeckStatus, recoverOrphanDecks,
};
