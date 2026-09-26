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

const BACKGROUND_EXPORT_MAP = {
  'dark-obsidian':  { bg: '090d16', title: '818cf8', text: 'f3f4f6', accent: '818cf8' },
  'minimal-grid':   { bg: '0f172a', title: '38bdf8', text: 'f8fafc', accent: '38bdf8' },
  'aurora-mesh':    { bg: '0a0e1a', title: 'a5b4fc', text: 'f1f5f9', accent: '6366f1' },
  'slate-clean':    { bg: 'ffffff', title: '1e3a8a', text: '0f172a', accent: '2563eb' },
  'blueprint-dot':  { bg: '0b192c', title: '60a5fa', text: 'f1f5f9', accent: '60a5fa' },
  'sunset-glass':   { bg: '190614', title: 'fb7185', text: 'fff1f2', accent: 'fb7185' },
  'studio-dark':    { bg: '121212', title: '34d399', text: 'e5e5e5', accent: '10b981' },
  'cyber-glow':     { bg: '022c22', title: '34d399', text: 'ecfdf5', accent: '34d399' },
};

function getDeckExportStyle(deck) {
  const inputData = typeof deck.input_data === 'string' ? JSON.parse(deck.input_data) : (deck.input_data || {});
  const bgPreset = inputData.backgroundPreset;
  if (bgPreset && BACKGROUND_EXPORT_MAP[bgPreset]) {
    return { ...STYLES[deck.style], ...BACKGROUND_EXPORT_MAP[bgPreset] };
  }
  return STYLES[deck.style] || STYLES['modern-tech'];
}

// ─── Export to PPTX ────────────────────────────────────────────────────────────
async function exportToPptx(deck, slides, filename) {
  const pptx = new PptxGenJS();
  const style = getDeckExportStyle(deck);

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

    const slideTitle = content?.title || content?.headline || content?.name || '';
    const slideSubtitle = content?.subtitle || content?.subheadline || content?.description || '';

    s.background = { color: style.bg };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.15, h: 5.63, fill: { color: style.accent } });

    if (slideTitle) {
      s.addText(slideTitle, {
        x: 0.4, y: 0.3, w: 12, h: 1,
        fontSize: slide.slide_type === 'title' ? 40 : 26,
        bold: true, color: style.title, fontFace: style.font, breakLine: false,
      });
    }

    if (slideSubtitle) {
      s.addText(slideSubtitle, {
        x: 0.4, y: slide.slide_type === 'title' ? 1.4 : 1.15, w: 12, h: 0.6,
        fontSize: 15, color: 'a0aec0', fontFace: style.font,
      });
    }

    const startY = slide.slide_type === 'title' ? 2.3 : 1.9;
    if (content?.bullets?.length > 0) {
      const bulletText = content.bullets.map(b => ({ text: `• ${b}`, options: { breakLine: true } }));
      s.addText(bulletText, {
        x: 0.4, y: startY, w: chartData ? 6.5 : 12, h: 2.8,
        fontSize: 13, color: style.text, fontFace: style.font, valign: 'top',
      });
    } else if (content?.members?.length > 0) {
      const memberText = content.members.map(m => ({ text: `${m.name} (${m.role}): ${m.bio}`, options: { breakLine: true } }));
      s.addText(memberText, {
        x: 0.4, y: startY, w: 12, h: 2.8,
        fontSize: 13, color: style.text, fontFace: style.font, valign: 'top',
      });
    } else if (content?.body) {
      s.addText(content.body, {
        x: 0.4, y: startY, w: chartData ? 6.5 : 12, h: 2.8,
        fontSize: 13, color: style.text, fontFace: style.font, wrap: true, valign: 'top',
      });
    }

    if (content?.callout) {
      s.addShape(pptx.ShapeType.rect, {
        x: 0.4, y: 4.8, w: 11.5, h: 0.5,
        fill: { color: '1e293b' }, line: { color: style.accent, width: 1 },
      });
      s.addText(`💡 ${content.callout}`, {
        x: 0.5, y: 4.8, w: 11.3, h: 0.5,
        fontSize: 11, color: style.accent, fontFace: style.font, valign: 'middle',
      });
    }

    if (chartData && chartData.type !== 'none') {
      const chartX = 7.2, chartY = startY, chartW = 5.2, chartH = 2.8;
      s.addShape(pptx.ShapeType.rect, {
        x: chartX, y: chartY, w: chartW, h: chartH,
        fill: { color: '1e293b' }, line: { color: style.accent, width: 1 },
      });
      s.addText(`📊 ${chartData.title || 'Chart'}\n${(chartData.labels || []).join(' · ')}`, {
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
    const style = getDeckExportStyle(deck);
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
      const chartData = (() => {
        try { return typeof slide.chart_data === 'string' ? JSON.parse(slide.chart_data) : slide.chart_data; }
        catch { return null; }
      })();

      const slideTitle = content?.title || content?.headline || content?.name || '';
      const slideSubtitle = content?.subtitle || content?.subheadline || content?.description || '';

      doc.rect(0, 0, 1280, 720).fill(`#${style.bg}`);
      doc.rect(0, 0, 12, 720).fill(`#${style.accent}`);

      if (slideTitle) {
        doc.font('Helvetica-Bold').fontSize(slide.slide_type === 'title' ? 40 : 28)
           .fillColor(`#${style.title}`).text(slideTitle, 50, 50, { width: 1180 });
      }

      if (slideSubtitle) {
        doc.font('Helvetica').fontSize(16).fillColor('#94a3b8')
           .text(slideSubtitle, 50, slide.slide_type === 'title' ? 120 : 100, { width: 1180 });
      }

      const bodyY = slide.slide_type === 'title' ? 220 : 170;
      if (content?.bullets?.length > 0) {
        doc.font('Helvetica').fontSize(15).fillColor(`#${style.text}`);
        content.bullets.forEach((bullet, i) => {
          if (bodyY + i * 36 < 580) {
            doc.text(`• ${bullet}`, 50, bodyY + i * 36, { width: chartData ? 650 : 1150 });
          }
        });
      } else if (content?.members?.length > 0) {
        doc.font('Helvetica').fontSize(14).fillColor(`#${style.text}`);
        content.members.forEach((m, i) => {
          if (bodyY + i * 45 < 580) {
            doc.font('Helvetica-Bold').text(`${m.name} — ${m.role}`, 50, bodyY + i * 45);
            doc.font('Helvetica').fontSize(12).fillColor('#94a3b8').text(m.bio, 50, bodyY + i * 45 + 18);
          }
        });
      } else if (content?.body) {
        doc.font('Helvetica').fontSize(14).fillColor(`#${style.text}`)
           .text(content.body, 50, bodyY, { width: chartData ? 650 : 1150 });
      }

      if (content?.callout) {
        doc.rect(50, 600, 1180, 45).fill('#1e293b');
        doc.font('Helvetica-Bold').fontSize(13).fillColor(`#${style.accent}`)
           .text(`💡 ${content.callout}`, 65, 615, { width: 1150 });
      }

      if (chartData && chartData.type !== 'none') {
        doc.rect(740, 170, 490, 380).fill('#1e293b');
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff')
           .text(`📊 ${chartData.title || 'Chart Data'}`, 760, 190);
        
        if (chartData.labels && chartData.datasets?.[0]?.data) {
          chartData.labels.forEach((label, li) => {
            const val = chartData.datasets[0].data[li];
            doc.font('Helvetica').fontSize(13).fillColor('#94a3b8')
               .text(`${label}:`, 760, 240 + li * 30);
            doc.font('Helvetica-Bold').fontSize(13).fillColor('#38bdf8')
               .text(`${val}`, 960, 240 + li * 30);
          });
        }
      }

      doc.font('Helvetica').fontSize(10).fillColor('#475569')
         .text(`${slideIdx + 1} / ${slides.length}`, 1180, 680);
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
