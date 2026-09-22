// services/export.service.js
// SECURITY-HARDENED VERSION

const PptxGenJS = require('pptxgenjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const STORAGE = path.resolve(process.env.STORAGE_PATH || '../storage');
const DECKS_DIR = path.join(STORAGE, 'decks');

if (!fs.existsSync(DECKS_DIR)) fs.mkdirSync(DECKS_DIR, { recursive: true, mode: 0o750 });

// FIX #41: Resolve and validate output path stays within DECKS_DIR (path traversal prevention)
function safeOutputPath(filename, ext) {
  const safeName = filename.replace(/[^a-z0-9_\-]/gi, '_').slice(0, 100);
  const resolved = path.resolve(DECKS_DIR, `${safeName}.${ext}`);
  if (!resolved.startsWith(path.resolve(DECKS_DIR))) {
    throw new Error('Invalid export path');
  }
  return resolved;
}

const STYLES = {
  'modern-tech': { bg: '0f172a', title: '6366f1', text: 'e2e8f0', accent: '8b5cf6', font: 'Calibri' },
  'corporate':   { bg: '0c1a2e', title: '0ea5e9', text: 'e2e8f0', accent: '0284c7', font: 'Calibri' },
  'creative':    { bg: '1a0a0f', title: 'f43f5e', text: 'f8fafc', accent: 'fb7185', font: 'Calibri' },
};

// ─── Export to PPTX ────────────────────────────────────────────────────────────
async function exportToPptx(deck, slides, filename) {
  const pptx = new PptxGenJS();
  const style = STYLES[deck.style] || STYLES['modern-tech'];

  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = deck.name;
  pptx.author = 'Deao Studios';

  for (let slideIdx = 0; slideIdx < slides.length; slideIdx++) {
    const slide = slides[slideIdx];
    const s = pptx.addSlide();
    const content = (() => {
      try { return typeof slide.content === 'string' ? JSON.parse(slide.content) : slide.content; }
      catch { return {}; }
    })();
    const chartData = (() => {
      try { return typeof slide.chart_data === 'string' ? JSON.parse(slide.chart_data) : slide.chart_data; }
      catch { return null; }
    })();

    s.background = { color: style.bg };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: 5.63, fill: { color: style.accent } });

    if (content?.headline) {
      s.addText(content.headline, {
        x: 0.4, y: 0.3, w: 12, h: 1,
        fontSize: slide.slide_type === 'title' ? 44 : 28,
        bold: true, color: style.title, fontFace: style.font, breakLine: false,
      });
    }

    if (content?.subheadline) {
      s.addText(content.subheadline, {
        x: 0.4, y: slide.slide_type === 'title' ? 1.4 : 1.15, w: 12, h: 0.6,
        fontSize: 16, color: 'a0aec0', fontFace: style.font,
      });
    }

    const startY = slide.slide_type === 'title' ? 2.3 : 1.9;
    if (content?.bullets?.length > 0) {
      const bulletText = content.bullets.map(b => ({ text: `• ${b}`, options: { breakLine: true } }));
      s.addText(bulletText, {
        x: 0.4, y: startY, w: chartData ? 6.5 : 12, h: 3,
        fontSize: 14, color: style.text, fontFace: style.font, valign: 'top',
      });
    } else if (content?.body) {
      s.addText(content.body, {
        x: 0.4, y: startY, w: chartData ? 6.5 : 12, h: 3,
        fontSize: 14, color: style.text, fontFace: style.font, wrap: true, valign: 'top',
      });
    }

    if (chartData && chartData.type !== 'none') {
      const chartX = 7.2, chartY = startY, chartW = 5.2, chartH = 3;
      s.addShape(pptx.ShapeType.rect, {
        x: chartX, y: chartY, w: chartW, h: chartH,
        fill: { color: '1e293b' }, line: { color: style.accent, width: 1 },
      });
      s.addText(`📊 ${chartData.title || 'Chart'}\n${(chartData.labels || []).slice(0, 4).join(' · ')}`, {
        x: chartX, y: chartY, w: chartW, h: chartH,
        fontSize: 11, color: '64748b', align: 'center', valign: 'middle', fontFace: style.font,
      });
    }

    s.addText(`${slideIdx + 1} / ${slides.length}`, {
      x: 11.5, y: 5.2, w: 1.3, h: 0.3, fontSize: 9, color: '475569', align: 'right',
    });

    if (content?.speakerNotes) {
      s.addNotes(content.speakerNotes);
    }
  }

  const outputPath = safeOutputPath(filename, 'pptx'); // FIX #41 applied
  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}

// ─── Export to PDF ─────────────────────────────────────────────────────────────
async function exportToPdf(deck, slides, filename) {
  return new Promise((resolve, reject) => {
    const style = STYLES[deck.style] || STYLES['modern-tech'];
    const outputPath = safeOutputPath(filename, 'pdf'); // FIX #41 applied

    const doc = new PDFDocument({
      size: [1280, 720],
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
      autoFirstPage: false,
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    for (let slideIdx = 0; slideIdx < slides.length; slideIdx++) {
      const slide = slides[slideIdx];
      doc.addPage();
      const content = (() => {
        try { return typeof slide.content === 'string' ? JSON.parse(slide.content) : slide.content; }
        catch { return {}; }
      })();

      doc.rect(0, 0, 1280, 720).fill(`#${style.bg}`);
      doc.rect(0, 0, 10, 720).fill(`#${style.accent}`);

      if (content?.headline) {
        doc.font('Helvetica-Bold').fontSize(slide.slide_type === 'title' ? 48 : 32)
           .fillColor(`#${style.title}`).text(content.headline, 40, 60, { width: 1200 });
      }

      if (content?.subheadline) {
        doc.font('Helvetica').fontSize(18).fillColor('#94a3b8')
           .text(content.subheadline, 40, slide.slide_type === 'title' ? 140 : 120, { width: 1200 });
      }

      const bodyY = slide.slide_type === 'title' ? 260 : 200;
      const maxBullets = Math.floor((680 - bodyY) / 40);
      if (content?.bullets?.length > 0) {
        doc.font('Helvetica').fontSize(16).fillColor(`#${style.text}`);
        content.bullets.slice(0, maxBullets).forEach((bullet, i) => {
          doc.text(`• ${bullet}`, 40, bodyY + i * 40, { width: 800 });
        });
      } else if (content?.body) {
        doc.font('Helvetica').fontSize(15).fillColor(`#${style.text}`)
           .text(content.body, 40, bodyY, { width: 1160, height: 680 - bodyY });
      }

      doc.font('Helvetica').fontSize(10).fillColor('#475569')
         .text(`${slideIdx + 1} / ${slides.length}`, 1160, 690);
    }

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ─── Generate export filename ──────────────────────────────────────────────────
function buildFilename(deck, customName) {
  // FIX #42: Stronger sanitization of custom filename (strip more special chars)
  if (customName) return String(customName).replace(/[^a-z0-9_\-]/gi, '_').slice(0, 100);
  const year = new Date().getFullYear();
  const company = deck.name.split(' ')[0].replace(/[^a-z0-9]/gi, '');
  return `${company}_Pitch_${year}`;
}

// ─── Cleanup old files ─────────────────────────────────────────────────────────
function cleanupOldFiles(daysOld = 7) {
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  if (!fs.existsSync(DECKS_DIR)) return;

  fs.readdirSync(DECKS_DIR).forEach(file => {
    // FIX #43: Validate the file is within DECKS_DIR before deleting
    const fp = path.join(DECKS_DIR, file);
    if (!fp.startsWith(path.resolve(DECKS_DIR))) return; // skip if traversal attempt
    try {
      const stat = fs.statSync(fp);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(fp);
        console.log(`Cleaned up: ${file}`);
      }
    } catch {}
  });
}

module.exports = { exportToPptx, exportToPdf, buildFilename, cleanupOldFiles };
