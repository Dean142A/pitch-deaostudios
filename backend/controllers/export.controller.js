// controllers/export.controller.js

const exportService = require('../services/export.service');
const deckService = require('../services/deck.service');
const fs = require('fs');
require('dotenv').config();

async function exportDeck(req, res) {
  try {
    const { deckId } = req.params;
    const { format = 'pptx', name } = req.query;

    if (!['pptx', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use "pptx" or "pdf".' });
    }

    const deck = await deckService.getDeck(deckId, req.user.userId);
    if (!deck || !deck.slides) return res.status(404).json({ error: 'Deck not found' });
    if (deck.status !== 'completed') return res.status(400).json({ error: 'Deck not ready yet' });
    if (deck.slides.length === 0) return res.status(400).json({ error: 'No slides to export' });

    const rawFilename = exportService.buildFilename(deck, name);
    const filename = rawFilename.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100);

    let filePath;
    if (format === 'pdf') {
      filePath = await exportService.exportToPdf(deck, deck.slides, filename);
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      filePath = await exportService.exportToPptx(deck, deck.slides, filename);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${format}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const fileStream = fs.createReadStream(filePath);

    // Guard: if the file is unreadable (deleted between write and read), send 500 cleanly
    fileStream.on('error', (streamErr) => {
      console.error('Export stream error:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Export file could not be read' });
      } else {
        res.destroy();
      }
    });

    fileStream.pipe(res);

    // Delete temp file after stream ends — guard with flag so finish+close don't double-delete
    let cleaned = false;
    const cleanup = () => { if (!cleaned) { cleaned = true; fs.unlink(filePath, () => {}); } };
    res.on('finish', cleanup);
    res.on('close', cleanup);

    // Log metric via deckService (no separate pool needed here)
    deckService.logExport(deckId, req.user.userId, format, filename)
      .catch(err => console.error('Metric log error:', err));

  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { exportDeck };
