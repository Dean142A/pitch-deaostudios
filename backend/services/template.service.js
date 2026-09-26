// backend/services/template.service.js
const { Pool } = require('pg');
const { PRESET_TEMPLATES } = require('../data/presetTemplates');
const aiService = require('./ai.service');
const { saveVersion } = require('./deck.service');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function listTemplates() {
  return PRESET_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    badge: t.badge,
    description: t.description,
    style: t.style,
    backgroundPreset: t.backgroundPreset,
    numSlides: t.numSlides,
    tags: t.tags,
    slidePreviewCount: t.slides.length,
  }));
}

function getTemplateById(templateId) {
  const template = PRESET_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;
  return template;
}

async function useTemplate(userId, templateId, customInput = {}) {
  const template = PRESET_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const companyName = (customInput.companyName || '').trim() || template.name;
  const deckName = `${companyName} Pitch`;
  const style = customInput.style || template.style;
  const backgroundPreset = customInput.backgroundPreset || template.backgroundPreset;

  const inputData = {
    ...customInput,
    templateId: template.id,
    backgroundPreset,
    isFromTemplate: true,
  };

  // Create Deck in database
  const deckResult = await pool.query(
    `INSERT INTO decks (name, style, owner_id, num_slides, status, input_data)
     VALUES ($1, $2, $3, $4, 'completed', $5) RETURNING *`,
    [deckName, style, userId, template.slides.length, JSON.stringify(inputData)]
  );

  const deck = deckResult.rows[0];

  // Process slides (smart replacement if user provided company name / info)
  const preparedSlides = template.slides.map((slide, index) => {
    let content = JSON.parse(JSON.stringify(slide.content));
    let chartData = slide.chart_data ? JSON.parse(JSON.stringify(slide.chart_data)) : null;

    // Perform text customization if user provided custom company info
    if (customInput.companyName) {
      const origTitle = template.slides[0]?.content?.title || '';
      if (origTitle && content.title && content.title.includes(origTitle)) {
        content.title = content.title.replace(new RegExp(origTitle, 'g'), customInput.companyName);
      } else if (index === 0) {
        content.title = customInput.companyName;
      }

      if (customInput.productDescription && index === 2) {
        content.subtitle = customInput.productDescription;
      }
    }

    return {
      slide_type: slide.slide_type,
      slide_order: index,
      layout: slide.layout || 'single_column',
      content,
      chartData,
    };
  });

  // Insert slides into database
  const insertedSlides = [];
  for (const s of preparedSlides) {
    const slideResult = await pool.query(
      `INSERT INTO slides (deck_id, slide_type, slide_order, content, chart_data, layout)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [deck.id, s.slide_type, s.slide_order, JSON.stringify(s.content), JSON.stringify(s.chartData), s.layout]
    );
    insertedSlides.push(slideResult.rows[0]);
  }

  // Save version snapshot
  try {
    await saveVersion(deck.id, insertedSlides);
  } catch (err) {
    console.warn('[useTemplate] Failed to save initial version snapshot:', err.message);
  }

  // Record metrics
  try {
    await pool.query(
      `INSERT INTO metrics (deck_id, action, value) VALUES ($1, 'template_used', $2)`,
      [deck.id, JSON.stringify({ templateId: template.id, slideCount: insertedSlides.length })]
    );
  } catch (mErr) {
    console.warn('[useTemplate] Metric recording error:', mErr.message);
  }

  return {
    deckId: deck.id,
    status: 'completed',
    slidesCount: insertedSlides.length,
    message: 'Deck created instantly from template!',
  };
}

module.exports = {
  listTemplates,
  getTemplateById,
  useTemplate,
};
