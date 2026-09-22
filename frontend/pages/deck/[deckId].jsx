// pages/deck/[deckId].jsx - Deck Editor & Preview

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('../../components/ChartComponent'), { ssr: false });

const SLIDE_TYPE_ICONS = {
  title: '🎯', problem: '⚡', solution: '✨', market_size: '📊',
  business_model: '💰', traction: '📈', competitive_landscape: '🏆',
  go_to_market: '🚀', team: '👥', financials: '💵', funding_ask: '🎪',
  roadmap: '🗺️', closing: '🎬', product_demo: '🔬', testimonials: '💬',
  risk_mitigation: '🛡️',
};

export default function DeckEditor() {
  const router = useRouter();
  const { deckId } = router.query;
  const [deck, setDeck] = useState(null);
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [progress, setProgress] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [exportName, setExportName] = useState('');
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!deckId) return;
    loadDeck();
  }, [deckId]);

  async function loadDeck() {
    try {
      const data = await api.getDeck(deckId);
      setDeck(data);
      setSlides(data.slides || []);
      setExportName(data.name.replace(/\s+/g, '_'));

      if (data.status === 'generating' || data.status === 'queued') {
        startPolling();
        connectWebSocket();
      }
    } catch {
      router.push('/dashboard');
    }
  }

  function startPolling() {
    // Clear any existing interval to prevent duplicates
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const data = await api.getDeck(deckId);
        setDeck(data);
        setSlides(data.slides || []);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setProgress(null);
        }
      } catch (err) {
        console.warn('Polling error:', err);
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 2000);
  }

  function connectWebSocket() {
    // Close any existing connection first
    if (wsRef.current) wsRef.current.close();

    const token = localStorage.getItem('deao_token');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(`${wsUrl}/ws?token=${token}&deckId=${deckId}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'progress') setProgress(msg);
        if (msg.type === 'user_joined') setActiveUsers(u => [...u, { id: msg.userId, name: msg.name }]);
        if (msg.type === 'user_left') setActiveUsers(u => u.filter(x => x.id !== msg.userId));
        if (msg.type === 'slide_edit') {
          setSlides(s => s.map(sl => sl.id === msg.slideId ? { ...sl, content: msg.content } : sl));
        }
      } catch {}
    };

    ws.onerror = (err) => console.warn('WebSocket error:', err);

    wsRef.current = ws;
  }

  useEffect(() => () => { clearInterval(pollRef.current); wsRef.current?.close(); }, []);

  async function loadVersions() {
    try {
      const v = await api.getVersions(deckId);
      setVersions(v);
      setShowVersions(true);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  }

  async function restoreVersion(versionId) {
    if (!confirm('Restore this version? Current slides will be replaced.')) return;
    try {
      await api.restoreVersion(deckId, versionId);
      setSelectedSlide(0);
      await loadDeck();
      setShowVersions(false);
    } catch (err) {
      console.error('Failed to restore version:', err);
      alert('Failed to restore version. Please try again.');
    }
  }

  async function loadLogs() {
    try {
      const l = await api.getLogs(deckId);
      setLogs(l);
      setShowLogs(true);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }

  async function handleExport(format) {
    try {
      const blob = await api.exportDeck(deckId, format, exportName || undefined);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${exportName || 'deck'}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    }
  }

  const currentSlide = slides[selectedSlide];
  const safeParseJSON = (val, fallback = null) => {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };
  const content = safeParseJSON(currentSlide?.content);
  const chartData = safeParseJSON(currentSlide?.chart_data);

  const STYLE_COLORS = { 'modern-tech': '#6366f1', 'corporate': '#0ea5e9', 'creative': '#f43f5e' };
  const accentColor = STYLE_COLORS[deck?.style] || '#6366f1';

  if (!deck) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(13,21,37,0.95)', backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 18, padding: 0,
          }}>←</button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{deck.name}</span>
          <span className={`badge badge-${deck.status}`}>{deck.status}</span>

          {/* Active users */}
          {activeUsers.map(u => (
            <div key={u.id} title={u.name} style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 700,
            }}>
              {u.name[0]}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {deck.status === 'completed' && (
            <>
              <input
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text)', padding: '5px 10px', fontSize: 12,
                  width: 180,
                }}
                placeholder="Filename..."
                value={exportName}
                onChange={e => setExportName(e.target.value)}
              />
              <button className="btn-secondary" onClick={() => handleExport('pdf')}
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                ↓ PDF
              </button>
              <button className="btn-primary" onClick={() => handleExport('pptx')}
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                ↓ PPTX
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={loadVersions} style={{ padding: '6px 12px', fontSize: 12 }}>Versions</button>
          <button className="btn-secondary" onClick={loadLogs} style={{ padding: '6px 12px', fontSize: 12 }}>AI Logs</button>
        </div>
      </div>

      {/* Generating overlay */}
      {(deck.status === 'generating' || deck.status === 'queued') && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(8,12,20,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, backdropFilter: 'blur(8px)',
        }}>
          <div style={{ width: 300, textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 24px',
              border: '3px solid var(--border)', borderTopColor: accentColor,
              borderRadius: '50%',
            }} className="animate-spin" />

            <h2 style={{ marginBottom: 12, fontSize: 22 }}>
              {deck.status === 'queued' ? 'In Queue...' : 'Generating Deck...'}
            </h2>

            {progress && (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                  {progress.message}
                </p>
                {progress.slideProgress && (
                  <div className="progress-bar" style={{ marginBottom: 16 }}>
                    <div className="progress-bar-fill" style={{
                      width: `${(progress.slideProgress.current / progress.slideProgress.total) * 100}%`,
                    }} />
                  </div>
                )}
              </>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              This usually takes 1-2 minutes
            </p>
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Slide Thumbnails */}
        <div style={{
          width: 200, borderRight: '1px solid var(--border)',
          overflowY: 'auto', padding: '12px 10px',
          background: 'var(--bg-card)',
        }}>
          {slides.map((slide, i) => {
            const sc = typeof slide.content === 'string' ? JSON.parse(slide.content || '{}') : (slide.content || {});
            return (
              <div key={slide.id}
                onClick={() => setSelectedSlide(i)}
                className={`slide-thumb${selectedSlide === i ? ' active' : ''}`}
                style={{ marginBottom: 8, padding: '10px 8px', position: 'relative' }}
              >
                <div style={{ fontSize: 16, marginBottom: 4 }}>
                  {SLIDE_TYPE_ICONS[slide.slide_type] || '📄'}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>
                  {slide.slide_type?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sc.headline || '...'}
                </div>
                <div style={{
                  position: 'absolute', top: 4, right: 6,
                  fontSize: 9, color: 'var(--text-muted)',
                }}>{i + 1}</div>
              </div>
            );
          })}
        </div>

        {/* Main Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {currentSlide && content ? (
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              {/* Slide canvas */}
              <div style={{
                maxWidth: 900, width: '100%', margin: '0 auto',
                aspectRatio: '16/9',
                background: '#0f172a',
                borderRadius: 12,
                border: `1px solid var(--border)`,
                padding: '40px 48px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: currentSlide.layout === 'two_column' ? 'row' : 'column',
                gap: 24,
              }}>
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 5,
                  background: accentColor,
                }} />

                {/* Slide number */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 20,
                  fontSize: 11, color: '#475569',
                }}>
                  {selectedSlide + 1} / {slides.length}
                </div>

                {/* Content side */}
                <div style={{ flex: chartData ? '0 0 55%' : 1 }}>
                  {content.headline && (
                    <h2 style={{
                      fontSize: currentSlide.slide_type === 'title' ? 36 : 26,
                      fontFamily: 'Syne', margin: '0 0 10px',
                      color: accentColor,
                      lineHeight: 1.2,
                    }}>
                      {content.headline}
                    </h2>
                  )}
                  {content.subheadline && (
                    <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: 14 }}>
                      {content.subheadline}
                    </p>
                  )}

                  {content.bullets?.length > 0 && (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {content.bullets.map((b, i) => (
                        <li key={i} style={{
                          padding: '6px 0', fontSize: 13, color: '#e2e8f0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}>
                          <span style={{ color: accentColor, marginTop: 1, flexShrink: 0 }}>▸</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  {content.body && !content.bullets?.length && (
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                      {content.body}
                    </p>
                  )}
                </div>

                {/* Chart side */}
                {chartData && chartData.type !== 'none' && (
                  <div style={{ flex: 1, minHeight: 200 }}>
                    <ChartComponent chartData={chartData} style={deck.style} />
                  </div>
                )}
              </div>

              {/* Speaker notes */}
              {content.speakerNotes && (
                <div style={{
                  maxWidth: 900, width: '100%', margin: '14px auto 0',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 16px',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>
                    SPEAKER NOTES
                  </div>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{content.speakerNotes}</p>
                </div>
              )}
            </div>
          ) : deck.status === 'completed' && slides.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No slides generated</p>
            </div>
          ) : deck.status === 'failed' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: 420 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px', color: '#f87171' }}>Generation Failed</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
                  Something went wrong while generating this deck — usually an AI provider error or timeout.
                  Check that your API key is valid in Admin Settings, then create a new deck.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn-secondary" onClick={() => router.push('/admin')}>
                    Admin Settings
                  </button>
                  <button className="btn-primary" onClick={() => router.push('/')}>
                    Create New Deck
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Versions Modal */}
      {showVersions && (
        <Modal title="Revision History" onClose={() => setShowVersions(false)}>
          {versions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No saved versions yet</p>
          ) : versions.map(v => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>Version {v.version_num}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(v.created_at).toLocaleString()}
                </div>
              </div>
              <button className="btn-secondary" onClick={() => restoreVersion(v.id)}
                style={{ padding: '6px 14px', fontSize: 12 }}>
                Restore
              </button>
            </div>
          ))}
        </Modal>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <Modal title="AI Decision Logs" onClose={() => setShowLogs(false)} wide>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {logs.slice(0, 30).map(log => (
              <div key={log.id} style={{
                padding: '10px 0', borderBottom: '1px solid var(--border)',
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    background: 'var(--accent)', color: 'white',
                    borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                  }}>{log.ai_model}</span>
                  <span style={{ color: '#94a3b8' }}>{log.action}</span>
                  {log.duration_ms && <span style={{ color: 'var(--text-muted)' }}>{log.duration_ms}ms</span>}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '24px', width: '100%',
        maxWidth: wide ? 700 : 480,
        margin: '20px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 22, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
