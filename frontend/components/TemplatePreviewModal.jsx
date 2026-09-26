// frontend/components/TemplatePreviewModal.jsx
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getBackgroundPreset } from '../utils/backgrounds';

const ChartComponent = dynamic(() => import('./ChartComponent'), { ssr: false });

const SLIDE_TYPE_ICONS = {
  title: '🎯', problem: '⚡', solution: '✨', market_size: '📊',
  business_model: '💰', traction: '📈', competitive_landscape: '🏆',
  go_to_market: '🚀', team: '👥', financials: '💵', funding_ask: '🎪',
  roadmap: '🗺️', closing: '🎬', product_demo: '🔬', testimonials: '💬',
  risk_mitigation: '🛡️',
};

export default function TemplatePreviewModal({ template, onClose, onUseTemplate }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [using, setUsing] = useState(false);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [template]);

  if (!template) return null;

  const slides = template.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const bgPreset = getBackgroundPreset(template.backgroundPreset || 'dark-obsidian');

  async function handleConfirmUse() {
    setUsing(true);
    try {
      await onUseTemplate(template.id, {
        companyName: companyNameInput.trim() || undefined,
      });
    } catch (err) {
      alert(`Error using template: ${err.message}`);
      setUsing(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, width: '100%', maxWidth: 1000, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '16px 24px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🎨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                {template.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="badge badge-completed">{template.category}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {template.numSlides} Slides • Style: <strong style={{ color: 'var(--accent)' }}>{template.style}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              fontSize: 22, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Thumbnail List */}
          <div style={{
            background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
            padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              Slide Directory ({slides.length})
            </div>
            {slides.map((s, idx) => {
              const icon = SLIDE_TYPE_ICONS[s.slide_type] || '📄';
              const active = idx === activeSlideIndex;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    border: active ? '1px solid var(--accent)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? 'var(--accent)' : 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {idx + 1}. {s.content?.title || s.slide_type.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {s.slide_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Live Slide Canvas Preview */}
          <div style={{
            padding: 24, display: 'flex', flexDirection: 'column',
            overflowY: 'auto', background: 'var(--bg-main)', position: 'relative',
          }}>
            {/* Live Canvas Box */}
            <div style={{
              flex: 1, minHeight: 380, borderRadius: 12, padding: 32,
              background: bgPreset.style.background,
              backgroundImage: bgPreset.style.backgroundImage,
              backgroundSize: bgPreset.style.backgroundSize || 'cover',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              color: '#e2e8f0', transition: 'all 0.3s ease',
            }}>
              <div>
                {/* Slide Type Tag */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16,
                  backdropFilter: 'blur(4px)',
                }}>
                  <span>{SLIDE_TYPE_ICONS[currentSlide.slide_type] || '📄'}</span>
                  <span>{currentSlide.slide_type.replace('_', ' ')}</span>
                </div>

                {/* Title & Subtitle */}
                <h2 style={{
                  margin: '0 0 10px', fontSize: 26, fontWeight: 800,
                  lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff',
                }}>
                  {currentSlide.content?.title}
                </h2>
                {currentSlide.content?.subtitle && (
                  <p style={{
                    margin: '0 0 20px', fontSize: 14, color: 'rgba(255,255,255,0.8)',
                    maxWidth: '90%', lineHeight: 1.5,
                  }}>
                    {currentSlide.content.subtitle}
                  </p>
                )}

                {/* Bullets List */}
                {currentSlide.content?.bullets && (
                  <ul style={{ margin: '0 0 20px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentSlide.content.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Team Members Grid */}
                {currentSlide.content?.members && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '16px 0' }}>
                    {currentSlide.content.members.map((m, mIdx) => (
                      <div key={mIdx} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 8, padding: 12,
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>{m.role}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{m.bio}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chart Visualization */}
                {currentSlide.chart_data && (
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, padding: 16, marginTop: 16, height: 200,
                  }}>
                    <ChartComponent chartData={currentSlide.chart_data} />
                  </div>
                )}
              </div>

              {/* Callout Box at Bottom of Slide */}
              {currentSlide.content?.callout && (
                <div style={{
                  marginTop: 20, background: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 12, fontWeight: 600, color: '#38bdf8',
                }}>
                  💡 {currentSlide.content.callout}
                </div>
              )}
            </div>

            {/* Slide Carousel Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                ← Previous Slide
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Slide {activeSlideIndex + 1} of {slides.length}
              </span>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Next Slide →
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer / Action Bar */}
        <div style={{
          padding: '16px 24px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 450 }}>
            {isCustomizing ? (
              <input
                className="input"
                placeholder="Enter company name (e.g. Acme Tech)..."
                value={companyNameInput}
                onChange={e => setCompanyNameInput(e.target.value)}
                style={{ fontSize: 13 }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsCustomizing(true)}
                style={{
                  background: 'transparent', border: '1px border var(--border)',
                  color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                }}
              >
                ✏️ Optional: Personalize Company Name
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-secondary" onClick={onClose} disabled={using}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmUse}
              disabled={using}
              style={{ padding: '8px 20px', fontWeight: 700 }}
            >
              {using ? 'Creating Deck...' : '🚀 Use Template & Edit Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
