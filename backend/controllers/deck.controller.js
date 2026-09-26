// controllers/deck.controller.js
// SECURITY-HARDENED VERSION

const deckService = require('../services/deck.service');
const queue = require('../utils/queue.helper');
require('dotenv').config();

// FIX #26: Validate and sanitize UUID format to prevent injection via route params
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(str) {
  return UUID_REGEX.test(str);
}

// ─── Create + Start Generation ─────────────────────────────────────────────────
async function createDeck(req, res) {
  try {
    const input = req.body;

    const required = ['companyName', 'industry', 'productDescription', 'targetMarket', 'fundingGoal', 'keyAchievements'];
    for (const field of required) {
      if (!input[field]) return res.status(400).json({ error: `${field} is required` });
    }

    // FIX #27: Enforce string length limits on all text inputs to prevent oversized payloads
    const fieldLimits = {
      companyName: 200,
      industry: 200,
      productDescription: 2000,
      targetMarket: 1000,
      fundingGoal: 200,
      keyAchievements: 2000,
      teamMembers: 2000,
    };
    for (const [field, maxLen] of Object.entries(fieldLimits)) {
      if (input[field] && typeof input[field] === 'string' && input[field].length > maxLen) {
        return res.status(400).json({ error: `${field} exceeds maximum length of ${maxLen} characters` });
      }
    }

    input.numSlides = Math.min(Math.max(parseInt(input.numSlides) || 15, 5), 25);

    // FIX #28: Whitelist allowed style values
    const allowedStyles = ['modern-tech', 'corporate', 'creative'];
    if (input.style && !allowedStyles.includes(input.style)) {
      input.style = 'modern-tech';
    }

    const deck = await deckService.createDeck(req.user.userId, input);
    await deckService.setDeckStatus(deck.id, 'queued');

    queue.enqueue(deck.id, async (progressCb) => {
      return deckService.generateDeck(deck.id, input, progressCb);
    }, (progress) => {
      if (req.app.locals.wss) {
        req.app.locals.wss.clients.forEach(client => {
          if (client.readyState === 1 && client.deckId === deck.id) {
            client.send(JSON.stringify({ type: 'progress', ...progress }));
          }
        });
      }
    }).catch(err => {
      console.error(`[Queue] Deck ${deck.id} generation failed:`, err.message);
    });

    res.status(201).json({
      deckId: deck.id,
      status: 'queued',
      message: 'Deck generation started',
      queueStatus: queue.getStatus(),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create deck' }); // FIX #29: Don't expose err.message
  }
}

async function getDeck(req, res) {
  try {
    // FIX #30: Validate UUID route params before passing to DB
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const deck = await deckService.getDeck(req.params.deckId, req.user.userId);
    res.json(deck);
  } catch (err) {
    res.status(404).json({ error: 'Deck not found' });
  }
}

async function listDecks(req, res) {
  try {
    // FIX #31: Scope deck listing to current user (was returning ALL decks to any user)
    const decks = await deckService.listDecks(req.user.userId, req.user.role);
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list decks' });
  }
}

async function updateSlide(req, res) {
  try {
    if (!isValidUUID(req.params.deckId) || !isValidUUID(req.params.slideId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const slide = await deckService.updateSlide(
      req.params.slideId,
      req.params.deckId,
      req.body,
      req.user.userId
    );
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    const status = err.message.includes('required') ? 400 : err.message.includes('Forbidden') ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function addSlide(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const slide = await deckService.addSlide(req.params.deckId, req.body, req.user.userId);
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add slide' });
  }
}

async function duplicateSlide(req, res) {
  try {
    if (!isValidUUID(req.params.deckId) || !isValidUUID(req.params.slideId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const slide = await deckService.duplicateSlide(req.params.slideId, req.params.deckId, req.user.userId);
    res.status(201).json(slide);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to duplicate slide' });
  }
}

async function updateDeckTheme(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const deck = await deckService.updateDeckTheme(req.params.deckId, req.body, req.user.userId);
    res.json(deck);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update deck theme' });
  }
}

async function deleteSlide(req, res) {
  try {
    if (!isValidUUID(req.params.deckId) || !isValidUUID(req.params.slideId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const result = await deckService.deleteSlide(req.params.slideId, req.params.deckId, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete slide' });
  }
}

async function deleteDeck(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    await deckService.deleteDeck(req.params.deckId, req.user.userId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    const status = err.message.startsWith('Forbidden') ? 403 : err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function getVersions(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const versions = await deckService.getVersions(req.params.deckId, req.user.userId);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get versions' });
  }
}

async function restoreVersion(req, res) {
  try {
    if (!isValidUUID(req.params.deckId) || !isValidUUID(req.params.versionId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const slides = await deckService.restoreVersion(req.params.deckId, req.params.versionId, req.user.userId);
    res.json({ message: 'Restored', slides });
  } catch (err) {
    res.status(500).json({ error: 'Restore failed' });
  }
}

async function getQueueStatus(req, res) {
  res.json(queue.getStatus());
}

async function getAiLogs(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const logs = await deckService.getAiLogs(req.params.deckId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
}

async function getDeckMetrics(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const metrics = await deckService.getDeckMetrics(req.params.deckId, req.user.userId, req.user.role);
    res.json(metrics);
  } catch (err) {
    const status = err.message === 'Forbidden' ? 403 : err.message === 'Deck not found' ? 404 : 500;
    res.status(status).json({ error: err.message || 'Failed to get metrics' });
  }
}

async function retryDeck(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const deck = await deckService.getDeck(req.params.deckId, req.user.userId);
    let input = deck.input_data;
    if (typeof input === 'string') {
      try { input = JSON.parse(input); } catch {}
    }
    if (!input || !input.companyName) {
      return res.status(400).json({ error: 'No input data found to retry generation' });
    }
    await deckService.setDeckStatus(deck.id, 'queued');

    queue.enqueue(deck.id, async (progressCb) => {
      return deckService.generateDeck(deck.id, input, progressCb);
    }, (progress) => {
      if (req.app.locals.wss) {
        req.app.locals.wss.clients.forEach(client => {
          if (client.readyState === 1 && client.deckId === deck.id) {
            client.send(JSON.stringify({ type: 'progress', ...progress }));
          }
        });
      }
    }).catch(err => {
      console.error(`[Queue Retry] Deck ${deck.id} generation failed:`, err.message);
    });

    res.json({ message: 'Generation restarted', deckId: deck.id, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retry deck' });
  }
}

async function reorderSlides(req, res) {
  try {
    if (!isValidUUID(req.params.deckId)) return res.status(400).json({ error: 'Invalid deck ID' });
    const { orderedSlideIds } = req.body;
    if (!Array.isArray(orderedSlideIds)) return res.status(400).json({ error: 'orderedSlideIds array required' });
    const slides = await deckService.reorderSlides(req.params.deckId, orderedSlideIds, req.user.userId);
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to reorder slides' });
  }
}

module.exports = {
  createDeck, getDeck, listDecks, updateSlide, addSlide, duplicateSlide, reorderSlides, deleteSlide, deleteDeck,
  updateDeckTheme, getVersions, restoreVersion, getQueueStatus, getAiLogs, getDeckMetrics, retryDeck,
};
