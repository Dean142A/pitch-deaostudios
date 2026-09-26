// frontend/components/TemplatePreviewModal.jsx - Create UI Interactive Preview Modal
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
        background: 'var(--bg-card)', border: '1px solid var(--border-highlight)',
        borderRadius: 20, width: '100%', maxWidth: 1040, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 30px rgba(99,102,241,0.25)',
      }}>
        {/* Modal Top Header */}
        <div style={{
          padding: '18px 28px', background: 'rgba(14, 17, 26, 0.95)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: 16,
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
            }}>
              ✦
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                {template.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span className="badge badge-completed">{template.category}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {template.numSlides} Slides • Theme: <strong style={{ color: '#06b6d4' }}>{template.style}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)',
              fontSize: 16, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, transition: 'all 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Thumbnail List */}
          <div style={{
            background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
            padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 4 }}>
              SLIDE DIRECTORY ({slides.length})
            </div>
            {slides.map((s, idx) => {
              const active = idx === activeSlideIndex;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    border: active ? '1px solid var(--accent)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: 12,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: active ? '#06b6d4' : 'var(--text-subtle)',
                    width: 20, textAlign: 'center',
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      color: active ? '#ffffff' : 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.content?.title || s.slide_type.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                      {s.slide_type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Live Slide Canvas Preview */}
          <div style={{
            padding: 28, display: 'flex', flexDirection: 'column',
            overflowY: 'auto', background: 'var(--bg)', position: 'relative',
          }}>
            {/* Live Canvas Box */}
            <div style={{
              flex: 1, minHeight: 400, borderRadius: 14, padding: 36,
              background: bgPreset.style.background,
              backgroundImage: bgPreset.style.backgroundImage,
              backgroundSize: bgPreset.style.backgroundSize || 'cover',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              color: '#f8fafc', transition: 'all 0.3s ease',
            }}>
              <div>
                {/* Slide Type Tag */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '4px 14px', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
                  backdropFilter: 'blur(6px)', color: '#ffffff',
                }}>
                  <span>SLIDE {activeSlideIndex + 1}</span>
                  <span>•</span>
                  <span>{currentSlide.slide_type.replace('_', ' ')}</span>
                </div>

                {/* Title & Subtitle */}
                <h2 style={{
                  margin: '0 0 12px', fontSize: 28, fontWeight: 900,
                  lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff',
                }}>
                  {currentSlide.content?.title}
                </h2>
                {currentSlide.content?.subtitle && (
                  <p style={{
                    margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.85)',
                    maxWidth: '90%', lineHeight: 1.5,
                  }}>
                    {currentSlide.content.subtitle}
                  </p>
                )}

                {/* Bullets List */}
                {currentSlide.content?.bullets && (
                  <ul style={{ margin: '0 0 20px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentSlide.content.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Team Members Grid */}
                {currentSlide.content?.members && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, margin: '20px 0' }}>
                    {currentSlide.content.members.map((m, mIdx) => (
                      <div key={mIdx} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: 10, padding: 14,
                      }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>{m.role}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{m.bio}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chart Visualization */}
                {currentSlide.chart_data && (
                  <div style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: 18, marginTop: 20, height: 210,
                  }}>
                    <ChartComponent chartData={currentSlide.chart_data} />
                  </div>
                )}
              </div>

              {/* Callout Box at Bottom of Slide */}
              {currentSlide.content?.callout && (
                <div style={{
                  marginTop: 24, background: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: 10,
                  padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#38bdf8',
                }}>
                  KEY TAKEAWAY: {currentSlide.content.callout}
                </div>
              )}
            </div>

            {/* Slide Carousel Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}
                style={{ fontSize: 12, padding: '7px 16px' }}
              >
                ← Previous Slide
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Slide {activeSlideIndex + 1} of {slides.length}
              </span>
              <button
                className="btn-secondary"
                disabled={activeSlideIndex === slides.length - 1}
                onClick={() => setActiveSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                style={{ fontSize: 12, padding: '7px 16px' }}
              >
                Next Slide →
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          padding: '18px 28px', background: 'rgba(14, 17, 26, 0.95)', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 460 }}>
            {isCustomizing ? (
              <input
                className="input"
                placeholder="Enter company name (e.g. Acme Artificial Intelligence)..."
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
                Personalize Company Name
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
              style={{ padding: '10px 22px', fontWeight: 700 }}
            >
              {using ? 'Creating Deck...' : 'Use Template & Edit Now →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

