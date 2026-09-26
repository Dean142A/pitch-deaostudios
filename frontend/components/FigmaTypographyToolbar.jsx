// frontend/components/FigmaTypographyToolbar.jsx
// Figma-Style Typography & Visual Styling Toolbar for Deao Studios Pitch Generator
import { useState, useEffect } from 'react';

const GOOGLE_FONTS = [
  { name: 'Syne', weights: ['400', '600', '700', '800'] },
  { name: 'Inter', weights: ['300', '400', '500', '600', '700', '800', '900'] },
  { name: 'Outfit', weights: ['300', '400', '500', '600', '700', '800'] },
  { name: 'DM Sans', weights: ['400', '500', '700'] },
  { name: 'Space Grotesk', weights: ['400', '600', '700'] },
  { name: 'Poppins', weights: ['300', '400', '500', '600', '700', '800'] },
  { name: 'Playfair Display', weights: ['400', '600', '700', '800', '900'] },
  { name: 'Plus Jakarta Sans', weights: ['400', '500', '600', '700', '800'] },
  { name: 'Roboto', weights: ['300', '400', '500', '700', '900'] },
  { name: 'Montserrat', weights: ['300', '400', '600', '700', '800', '900'] },
  { name: 'Cinzel', weights: ['400', '600', '700', '800'] },
];

const WEIGHT_LABELS = {
  '300': 'Light 300',
  '400': 'Regular 400',
  '500': 'Medium 500',
  '600': 'SemiBold 600',
  '700': 'Bold 700',
  '800': 'ExtraBold 800',
  '900': 'Black 900',
};

const COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#0ea5e9', '#38bdf8', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#10b981',
  '#34d399', '#eab308', '#64748b', '#0f172a', '#000000',
];

export default function FigmaTypographyToolbar({
  currentTheme = {},
  onChangeTheme,
  onSaveGlobalTheme,
  onClose,
}) {
  const [headingFont, setHeadingFont] = useState(currentTheme.headingFont || 'Syne');
  const [bodyFont, setBodyFont] = useState(currentTheme.bodyFont || 'DM Sans');
  const [fontWeight, setFontWeight] = useState(currentTheme.fontWeight || '800');
  const [letterSpacing, setLetterSpacing] = useState(currentTheme.letterSpacing || '-0.02em');
  const [lineHeight, setLineHeight] = useState(currentTheme.lineHeight || '1.2');
  const [textTransform, setTextTransform] = useState(currentTheme.textTransform || 'none');
  const [titleColor, setTitleColor] = useState(currentTheme.titleColor || '#ffffff');
  const [textColor, setTextColor] = useState(currentTheme.textColor || '#e2e8f0');
  const [accentColor, setAccentColor] = useState(currentTheme.accentColor || '#0ea5e9');
  const [bgColor, setBgColor] = useState(currentTheme.bgColor || '#0c1a2e');
  
  // Container & Border Controls
  const [borderEnabled, setBorderEnabled] = useState(currentTheme.borderEnabled !== undefined ? currentTheme.borderEnabled : true);
  const [borderWidth, setBorderWidth] = useState(currentTheme.borderWidth || '1px');
  const [borderStyle, setBorderStyle] = useState(currentTheme.borderStyle || 'solid');
  const [borderColor, setBorderColor] = useState(currentTheme.borderColor || 'rgba(255,255,255,0.15)');
  const [borderRadius, setBorderRadius] = useState(currentTheme.borderRadius || '12px');
  const [containerBg, setContainerBg] = useState(currentTheme.containerBg || 'rgba(255,255,255,0.04)');

  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'colors' | 'borders' | 'global'
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Dynamically inject selected Google Fonts into page head
  useEffect(() => {
    const fontsToLoad = Array.from(new Set([headingFont, bodyFont]));
    fontsToLoad.forEach(font => {
      const linkId = `google-font-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    });

    const updated = {
      headingFont,
      bodyFont,
      fontWeight,
      letterSpacing,
      lineHeight,
      textTransform,
      titleColor,
      textColor,
      accentColor,
      bgColor,
      borderEnabled,
      borderWidth,
      borderStyle,
      borderColor,
      borderRadius,
      containerBg,
    };
    onChangeTheme(updated);
  }, [
    headingFont, bodyFont, fontWeight, letterSpacing, lineHeight,
    textTransform, titleColor, textColor, accentColor, bgColor,
    borderEnabled, borderWidth, borderStyle, borderColor, borderRadius, containerBg,
  ]);

  async function handleSaveGlobal() {
    setSavingGlobal(true);
    try {
      const themeObj = {
        headingFont, bodyFont, fontWeight, letterSpacing,
        lineHeight, textTransform, titleColor, textColor, accentColor, bgColor,
        borderEnabled, borderWidth, borderStyle, borderColor, borderRadius, containerBg,
      };
      await onSaveGlobalTheme(themeObj);
      alert('[Saved] Global Fonts & Colors saved to deck successfully!');
    } catch (err) {
      alert(`Failed to save global theme: ${err.message}`);
    } finally {
      setSavingGlobal(false);
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16, marginBottom: 16, width: '100%', maxWidth: 960,
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Top Bar Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.04em' }}>VISUAL DESIGN & TYPOGRAPHY STUDIO</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { id: 'text', label: 'Typography' },
            { id: 'colors', label: 'Colors & Palette' },
            { id: 'borders', label: 'Borders & Containers' },
            { id: 'global', label: 'Global Theme' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === tab.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 16, padding: '0 6px', marginLeft: 6,
              }}
              title="Close Toolbar"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Typography Controls (Figma Direct Figures) */}
      {activeTab === 'text' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, fontSize: 12 }}>
          {/* Heading Font */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Heading Font (Google)</label>
            <select className="input" value={headingFont} onChange={e => setHeadingFont(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              {GOOGLE_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Body Font */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Body Font</label>
            <select className="input" value={bodyFont} onChange={e => setBodyFont(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              {GOOGLE_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Font Weight */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Font Weight</label>
            <select className="input" value={fontWeight} onChange={e => setFontWeight(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              {Object.entries(WEIGHT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          {/* Editable Letter Spacing (Figma Numeric Figure) */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Letter Spacing (em / px)</label>
            <input
              className="input"
              value={letterSpacing}
              onChange={e => setLetterSpacing(e.target.value)}
              placeholder="e.g. -0.02em, 1px, 0.05em"
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>

          {/* Editable Line Height (Figma Numeric Figure) */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Line Height (figure)</label>
            <input
              className="input"
              value={lineHeight}
              onChange={e => setLineHeight(e.target.value)}
              placeholder="e.g. 1.2, 1.4, 1.6"
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>

          {/* Text Transform */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Case Format</label>
            <select className="input" value={textTransform} onChange={e => setTextTransform(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              <option value="none">As Typed (Standard)</option>
              <option value="uppercase">UPPERCASE (FIGMA CAPS)</option>
              <option value="capitalize">Capitalize Words</option>
              <option value="lowercase">lowercase</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 2: Colors & Palettes */}
      {activeTab === 'colors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Title Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Body Text Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Canvas Background</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 6 }}>COLOR PALETTE SWATCHES</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map(hex => (
                <div
                  key={hex}
                  onClick={() => setAccentColor(hex)}
                  title={`Set accent color: ${hex}`}
                  style={{
                    width: 24, height: 24, borderRadius: 4, background: hex,
                    border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Container Borders & Styling */}
      {activeTab === 'borders' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, fontSize: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Container Border</label>
            <button
              onClick={() => setBorderEnabled(!borderEnabled)}
              style={{
                width: '100%', padding: '6px 10px', fontSize: 12, fontWeight: 700,
                background: borderEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: borderEnabled ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
              }}
            >
              {borderEnabled ? 'Border Enabled' : 'No Border (Disabled)'}
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Border Width</label>
            <input
              className="input"
              value={borderWidth}
              onChange={e => setBorderWidth(e.target.value)}
              placeholder="1px, 2px, 4px"
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Border Style</label>
            <select className="input" value={borderStyle} onChange={e => setBorderStyle(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Border Radius</label>
            <input
              className="input"
              value={borderRadius}
              onChange={e => setBorderRadius(e.target.value)}
              placeholder="0px, 8px, 16px"
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Container Fill Color</label>
            <input
              className="input"
              value={containerBg}
              onChange={e => setContainerBg(e.target.value)}
              placeholder="rgba(255,255,255,0.05) or #1e293b"
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: Global Deck Theme Storage */}
      {activeTab === 'global' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: 'var(--bg-sidebar)', borderRadius: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
              Save as Global Deck Theme
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Applies these font families, weights, spacing, border styles, and color palette across all slides in this deck.
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSaveGlobal}
            disabled={savingGlobal}
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
          >
            {savingGlobal ? 'Saving Global Theme...' : 'Save Global Theme to All Slides'}
          </button>
        </div>
      )}
    </div>
  );
}
