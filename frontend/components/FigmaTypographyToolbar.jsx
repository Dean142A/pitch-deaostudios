// frontend/components/FigmaTypographyToolbar.jsx
// Figma-Style Typography & Visual Styling Studio Inspector
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
  isSidebar = false,
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

  // Accordion Section States for Sidebar Inspector Mode
  const [openSection, setOpenSection] = useState('text'); // 'text' | 'colors' | 'borders' | 'global'
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
      alert('[Saved] Global Deck Theme saved to database!');
    } catch (err) {
      alert(`Failed to save global theme: ${err.message}`);
    } finally {
      setSavingGlobal(false);
    }
  }

  const containerStyle = isSidebar ? {
    width: 280, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
    flexShrink: 0, zIndex: 40,
  } : {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 16, marginBottom: 16, width: '100%', maxWidth: 960,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 14,
  };

  return (
    <div style={containerStyle}>
      {/* Studio Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Inspector & Text Properties
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 16, padding: '0 6px',
            }}
            title="Close Inspector"
          >
            x
          </button>
        )}
      </div>

      {/* Accordion 1: Text Properties */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        <button
          onClick={() => setOpenSection(openSection === 'text' ? null : 'text')}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--bg-sidebar)',
            border: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}
        >
          <span>Text Properties</span>
          <span>{openSection === 'text' ? '▼' : '▶'}</span>
        </button>

        {openSection === 'text' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, background: 'var(--bg-card)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Heading Font (Google)</label>
              <select className="input" value={headingFont} onChange={e => setHeadingFont(e.target.value)} style={{ padding: '6px 8px', fontSize: 12 }}>
                {GOOGLE_FONTS.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Body Font</label>
              <select className="input" value={bodyFont} onChange={e => setBodyFont(e.target.value)} style={{ padding: '6px 8px', fontSize: 12 }}>
                {GOOGLE_FONTS.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Weight</label>
                <select className="input" value={fontWeight} onChange={e => setFontWeight(e.target.value)} style={{ padding: '6px 8px', fontSize: 11 }}>
                  {Object.entries(WEIGHT_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Case</label>
                <select className="input" value={textTransform} onChange={e => setTextTransform(e.target.value)} style={{ padding: '6px 8px', fontSize: 11 }}>
                  <option value="none">As Typed</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="capitalize">Capitalize</option>
                  <option value="lowercase">lowercase</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Ltr Spacing</label>
                <input
                  className="input"
                  value={letterSpacing}
                  onChange={e => setLetterSpacing(e.target.value)}
                  placeholder="-0.02em"
                  style={{ padding: '6px 8px', fontSize: 11 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Line Height</label>
                <input
                  className="input"
                  value={lineHeight}
                  onChange={e => setLineHeight(e.target.value)}
                  placeholder="1.2"
                  style={{ padding: '6px 8px', fontSize: 11 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Color Picker & Palette */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        <button
          onClick={() => setOpenSection(openSection === 'colors' ? null : 'colors')}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--bg-sidebar)',
            border: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}
        >
          <span>Color Picker & Palette</span>
          <span>{openSection === 'colors' ? '▼' : '▶'}</span>
        </button>

        {openSection === 'colors' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, background: 'var(--bg-card)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Title Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                <input className="input" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 11, width: 100 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Body Text Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                <input className="input" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 11, width: 100 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                <input className="input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 11, width: 100 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Canvas Background</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
                <input className="input" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 11, width: 100 }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 6 }}>PALETTE SWATCHES</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {COLOR_PRESETS.map(hex => (
                  <div
                    key={hex}
                    onClick={() => setAccentColor(hex)}
                    title={`Set accent color: ${hex}`}
                    style={{
                      width: 20, height: 20, borderRadius: 4, background: hex,
                      border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Borders & Effects */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        <button
          onClick={() => setOpenSection(openSection === 'borders' ? null : 'borders')}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--bg-sidebar)',
            border: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}
        >
          <span>Borders & Effects</span>
          <span>{openSection === 'borders' ? '▼' : '▶'}</span>
        </button>

        {openSection === 'borders' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, background: 'var(--bg-card)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Border State</label>
              <button
                onClick={() => setBorderEnabled(!borderEnabled)}
                style={{
                  width: '100%', padding: '6px 10px', fontSize: 11, fontWeight: 700,
                  background: borderEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color: borderEnabled ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
                }}
              >
                {borderEnabled ? 'Border Enabled' : 'Border Disabled'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Width</label>
                <input
                  className="input"
                  value={borderWidth}
                  onChange={e => setBorderWidth(e.target.value)}
                  placeholder="1px"
                  style={{ padding: '6px 8px', fontSize: 11 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Style</label>
                <select className="input" value={borderStyle} onChange={e => setBorderStyle(e.target.value)} style={{ padding: '6px 8px', fontSize: 11 }}>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Radius</label>
              <input
                className="input"
                value={borderRadius}
                onChange={e => setBorderRadius(e.target.value)}
                placeholder="14px"
                style={{ padding: '6px 8px', fontSize: 11 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Accordion 4: Global Deck System */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        <button
          onClick={() => setOpenSection(openSection === 'global' ? null : 'global')}
          style={{
            width: '100%', padding: '10px 12px', background: 'var(--bg-sidebar)',
            border: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          }}
        >
          <span>Global Deck Theme</span>
          <span>{openSection === 'global' ? '▼' : '▶'}</span>
        </button>

        {openSection === 'global' && (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, background: 'var(--bg-card)' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
              Save current typography, color palette, and borders as the global theme for all slides in this deck.
            </p>
            <button
              className="btn-primary"
              onClick={handleSaveGlobal}
              disabled={savingGlobal}
              style={{ width: '100%', padding: '8px 12px', fontSize: 11, fontWeight: 700 }}
            >
              {savingGlobal ? 'Saving Theme...' : 'Save Theme to All Slides'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
