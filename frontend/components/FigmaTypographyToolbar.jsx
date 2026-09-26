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
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'colors' | 'global'
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
    };
    onChangeTheme(updated);
  }, [headingFont, bodyFont, fontWeight, letterSpacing, lineHeight, textTransform, titleColor, textColor, accentColor, bgColor]);

  async function handleSaveGlobal() {
    setSavingGlobal(true);
    try {
      const themeObj = {
        headingFont, bodyFont, fontWeight, letterSpacing,
        lineHeight, textTransform, titleColor, textColor, accentColor, bgColor,
      };
      await onSaveGlobalTheme(themeObj);
      alert('✓ Global Fonts & Colors saved to deck successfully!');
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
          <span style={{ fontSize: 16 }}>🎨</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Visual Typography Studio</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['text', 'colors', 'global'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
                border: activeTab === tab ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s ease',
              }}
            >
              {tab === 'text' ? '🔤 Typography' : tab === 'colors' ? '🎨 Palette' : '🌐 Global Settings'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Typography Controls */}
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

          {/* Letter Spacing */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Letter Spacing</label>
            <select className="input" value={letterSpacing} onChange={e => setLetterSpacing(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              <option value="-0.05em">Tightest (-0.05em)</option>
              <option value="-0.02em">Tight (-0.02em)</option>
              <option value="normal">Normal (0.00em)</option>
              <option value="0.05em">Wide (0.05em)</option>
              <option value="0.1em">Widest (0.10em)</option>
              <option value="0.2em">Caps Wide (0.20em)</option>
            </select>
          </div>

          {/* Line Height */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Line Height</label>
            <select className="input" value={lineHeight} onChange={e => setLineHeight(e.target.value)} style={{ padding: '6px 10px', fontSize: 12 }}>
              <option value="1.0">Single (1.0)</option>
              <option value="1.2">Compact (1.2)</option>
              <option value="1.4">Comfortable (1.4)</option>
              <option value="1.6">Relaxed (1.6)</option>
              <option value="1.8">Spacious (1.8)</option>
            </select>
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
          {/* Title Color */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Title Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={titleColor} onChange={e => setTitleColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Body Text Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Accent Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: 'var(--text-subtle)' }}>Canvas Background</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }} />
              <input className="input" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ padding: '4px 8px', fontSize: 12, width: 100 }} />
            </div>
          </div>

          {/* Swatches Bar */}
          <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', marginBottom: 6 }}>QUICK COLOR PALETTE SWATCHES</div>
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

      {/* TAB 3: Global Deck Theme Storage */}
      {activeTab === 'global' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, background: 'var(--bg-sidebar)', borderRadius: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
              Save as Global Deck Theme
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Applies these font families, weights, spacing, and color palette across all slides in this deck.
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSaveGlobal}
            disabled={savingGlobal}
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
          >
            {savingGlobal ? 'Saving Global Theme...' : '🌐 Save Global Theme to All Slides'}
          </button>
        </div>
      )}
    </div>
  );
}
