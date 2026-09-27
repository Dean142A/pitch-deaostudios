// frontend/components/TemplatePreviewModal.jsx - Linear Obsidian Interactive Preview Modal
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getBackgroundPreset } from '../utils/backgrounds';

const ChartComponent = dynamic(() => import('./ChartComponent'), { ssr: false });

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
      background: 'rgba(5, 7, 12, 0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 1040, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '16px 24px', background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                {template.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                <span className="badge badge-completed">{template.category}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {template.numSlides} Slides • Theme: <strong>{template.style}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)',
              fontSize: 14, cursor: 'pointer', padding: '4px 10px', borderRadius: 'var(--radius-pill)', transition: 'all 0.15s ease',
            }}
          >
            Close
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Thumbnail List */}
          <div style={{
            background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)',
            padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.05em', marginBottom: 4 }}>
              Slide Directory ({slides.length})
            </div>
            {slides.map((s, idx) => {
              const active = idx === activeSlideIndex;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                    background: active ? 'var(--brand)' : 'transparent',
                    border: active ? 'none' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: active ? '#ffffff' : 'var(--text-subtle)',
                    width: 18, textAlign: 'center',
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 600 : 500,
                      color: active ? '#ffffff' : 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.content?.title || s.slide_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Live Slide Canvas Preview */}
          <div style={{
            padding: 24, display: 'flex', flexDirection: 'column',
            overflowY: 'auto', background: 'var(--bg)', position: 'relative',
          }}>
            {/* Live Canvas Box */}
            <div style={{
              flex: 1, minHeight: 380, borderRadius: 'var(--radius-lg)', padding: 32,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              color: 'var(--text)', transition: 'all 0.3s ease',
            }}>
              <div>
                {/* Slide Type Tag */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 18,
                  color: 'var(--text-muted)',
                }}>
                  <span>Slide {activeSlideIndex + 1}</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{currentSlide.slide_type.replace('_', ' ')}</span>
                </div>

                {/* Title & Subtitle */}
                <h2 style={{
                  margin: '0 0 10px', fontSize: 24, fontWeight: 700,
                  lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text)',
                }}>
                  {currentSlide.content?.title}
                </h2>
                {currentSlide.content?.subtitle && (
                  <p style={{
                    margin: '0 0 20px', fontSize: 14, color: 'var(--text-muted)',
                    maxWidth: '90%', lineHeight: 1.5,
                  }}>
                    {currentSlide.content.subtitle}
                  </p>
                )}

                {/* Bullets List */}
                {currentSlide.content?.bullets && (
                  <ul style={{ margin: '0 0 20px', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {currentSlide.content.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Team Members Grid */}
                {currentSlide.content?.members && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, margin: '16px 0' }}>
                    {currentSlide.content.members.map((m, mIdx) => (
                      <div key={mIdx} style={{
                        background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)', padding: 12,
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--brand)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>{m.role}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.bio}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chart Visualization */}
                {currentSlide.chart_data && (
                  <div style={{
                    background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: 16, marginTop: 16, height: 200,
                  }}>
                    <ChartComponent chartData={currentSlide.chart_data} />
                  </div>
                )}
              </div>

              {/* Callout Box at Bottom of Slide */}
              {currentSlide.content?.callout && (
                <div style={{
                  marginTop: 20, background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text)',
                }}>
                  Key Takeaway: {currentSlide.content.callout}
                </div>
              )}
            </div>

            {/* Slide Carousel Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
              >
                Previous Slide
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                Slide {activeSlideIndex + 1} of {slides.length}
              </span>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 'var(--radius-pill)' }}
              >
                Next Slide
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          padding: '16px 24px', background: 'var(--bg-sidebar)', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 440 }}>
            {isCustomizing ? (
              <input
                className="input"
                placeholder="Enter company name..."
                value={companyNameInput}
                onChange={e => setCompanyNameInput(e.target.value)}
                style={{ fontSize: 13 }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsCustomizing(true)}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline',
                }}
              >
                Personalize Company Name
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-secondary" onClick={onClose} disabled={using} style={{ borderRadius: 'var(--radius-pill)' }}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirmUse}
              disabled={using}
              style={{ padding: '8px 20px', fontWeight: 600, borderRadius: 'var(--radius-pill)' }}
            >
              {using ? 'Creating Deck...' : 'Use Template & Edit Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
