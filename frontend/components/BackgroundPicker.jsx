// components/BackgroundPicker.jsx - Pre-saved Slide Background Selector Modal/Dropdown
import { BACKGROUND_PRESETS } from '../utils/backgrounds';

export default function BackgroundPicker({ selectedId, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 24, width: '100%', maxWidth: 720,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🎨 Pre-Saved Slide Backgrounds</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Choose a curated backdrop preset for your pitch deck slides
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 22, cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14, maxHeight: 440, overflowY: 'auto', paddingRight: 4, margin: '16px 0',
        }}>
          {BACKGROUND_PRESETS.map(preset => {
            const isSelected = selectedId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => { onSelect(preset.id); onClose(); }}
                style={{
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  background: 'var(--bg-sidebar)', transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 16px var(--accent-glow)' : 'none',
                }}
              >
                {/* Visual Thumbnail */}
                <div style={{
                  height: 90,
                  background: preset.style.background,
                  backgroundImage: preset.style.backgroundImage,
                  backgroundSize: preset.style.backgroundSize || 'cover',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  alignItems: 'center', padding: 12, position: 'relative',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: preset.style.color,
                    background: preset.style.cardBg, padding: '4px 8px', borderRadius: 4,
                    border: `1px solid ${preset.style.border}`, textAlign: 'center',
                  }}>
                    {preset.name}
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'var(--accent)', color: 'white',
                      borderRadius: '50%', width: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                    }}>✓</div>
                  )}
                </div>

                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{preset.name}</span>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-hover)', color: 'var(--text-subtle)' }}>
                      {preset.category}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>
                    {preset.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
