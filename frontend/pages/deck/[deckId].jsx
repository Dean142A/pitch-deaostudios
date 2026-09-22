// pages/deck/[deckId].jsx - Notion Block Canvas Deck Editor & Live Background Preview
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import NotionLayout from '../../components/NotionLayout';
import BackgroundPicker from '../../components/BackgroundPicker';
import { BACKGROUND_PRESETS, getBackgroundPreset } from '../../utils/backgrounds';
import api from '../../utils/api';

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
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [logs, setLogs] = useState([]);
  const [exportName, setExportName] = useState('');
  const [currentBgId, setCurrentBgId] = useState('dark-obsidian');
  const [exporting, setExporting] = useState(false);

  const wsRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!deckId) return;
    loadDeck();
  }, [deckId]);

  useEffect(() => () => { clearInterval(pollRef.current); wsRef.current?.close(); }, []);

  async function loadDeck() {
    try {
      const data = await api.getDeck(deckId);
      setDeck(data);
      setSlides(data.slides || []);
      setExportName(data.name.replace(/\s+/g, '_'));

      if (data.input_data?.backgroundPreset) {
        setCurrentBgId(data.input_data.backgroundPreset);
      }

      if (data.status === 'generating' || data.status === 'queued') {
        startPolling();
        connectWebSocket();
      }
    } catch (err) {
      console.error('Failed to load deck:', err);
      router.push('/dashboard');
    }
  }

  async function retryGeneration() {
    try {
      setProgress({ status: 'generating', step: 1, total: 4, message: 'Restarting generation...' });
      await api.retryDeck(deckId);
      startPolling();
      connectWebSocket();
    } catch (err) {
      alert(`Failed to restart generation: ${err.message}`);
    }
  }

  function startPolling() {
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

    wsRef.current = ws;
  }

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
      alert(`Failed to restore version: ${err.message}`);
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
    setExporting(true);
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
    } finally {
      setExporting(false);
    }
  }

  const currentSlide = slides[selectedSlide];
  const safeParseJSON = (val, fallback = null) => {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
  };

  const content = safeParseJSON(currentSlide?.content, {});
  const chartData = safeParseJSON(currentSlide?.chart_data, null);
  const bgPreset = getBackgroundPreset(currentBgId);

  if (!deck) return (
    <NotionLayout activeTab="dashboard" title="Loading Canvas...">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    </NotionLayout>
  );

  return (
    <NotionLayout activeTab="dashboard" title={deck.name}>
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Notion Editor Top Action Bar */}
        <div style={{
          height: 52, padding: '0 20px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{deck.name}</span>
            <span className={`badge badge-${deck.status}`}>{deck.status}</span>

            {/* Active User Avatars */}
            {activeUsers.map(u => (
              <div key={u.id} title={u.name} style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>
                {u.name[0]}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Background Preset Trigger */}
            <button
              className="btn-secondary"
              onClick={() => setShowBgPicker(true)}
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              🎨 Background: {bgPreset.name}
            </button>

            {deck.status === 'completed' && (
              <>
                <input
                  className="input"
                  style={{ width: 140, padding: '5px 10px', fontSize: 12 }}
                  placeholder="Filename..."
                  value={exportName}
                  onChange={e => setExportName(e.target.value)}
                />
                <button
                  className="btn-secondary"
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  ↓ PDF
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleExport('pptx')}
                  disabled={exporting}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  ↓ PPTX
                </button>
              </>
            )}

            {/* Regenerate Trigger */}
            <button
              className="btn-secondary"
              onClick={retryGeneration}
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              ⚡ Regenerate
            </button>

            <button className="btn-secondary" onClick={loadVersions} style={{ fontSize: 12, padding: '5px 12px' }}>
              Versions
            </button>
            <button className="btn-secondary" onClick={loadLogs} style={{ fontSize: 12, padding: '5px 12px' }}>
              AI Logs
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Slide Thumbnails Sidebar */}
          <div style={{
            width: 220, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
            overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: 4 }}>
              SLIDES ({slides.length})
            </div>

            {slides.map((s, idx) => {
              const icon = SLIDE_TYPE_ICONS[s.slide_type] || '📄';
              const sContent = safeParseJSON(s.content, {});
              const isSelected = selectedSlide === idx;

              return (
                <div
                  key={s.id || idx}
                  onClick={() => setSelectedSlide(idx)}
                  className={`slide-thumb ${isSelected ? 'active' : ''}`}
                  style={{
                    background: bgPreset.style.background,
                    backgroundImage: bgPreset.style.backgroundImage,
                    backgroundSize: bgPreset.style.backgroundSize || 'cover',
                    padding: 8, display: 'flex', flexDirection: 'column',
                    justify: 'space-between', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: bgPreset.style.color }}>
                    <span>{idx + 1}. {icon}</span>
                    <span style={{ textTransform: 'capitalize', opacity: 0.8 }}>{s.slide_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: bgPreset.style.color,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 4,
                  }}>
                    {sContent?.headline || 'Slide'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Stage Presentation Canvas */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', justifyContent: 'center', alignItems: currentSlide ? 'flex-start' : 'center' }}>
            {currentSlide ? (
              <div style={{
                width: '100%', maxWidth: 900, aspectRatio: '16/9',
                background: bgPreset.style.background,
                backgroundImage: bgPreset.style.backgroundImage,
                backgroundSize: bgPreset.style.backgroundSize || 'cover',
                color: bgPreset.style.color,
                borderRadius: 12, border: `1px solid ${bgPreset.style.border}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: '40px 48px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative',
              }}>
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: 6,
                  background: bgPreset.style.accent, borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
                }} />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{SLIDE_TYPE_ICONS[currentSlide.slide_type] || '📄'}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, uppercase: 'true', opacity: 0.8, letterSpacing: '0.05em' }}>
                      {currentSlide.slide_type?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h2 style={{
                    fontSize: currentSlide.slide_type === 'title' ? 36 : 26,
                    fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2,
                    color: bgPreset.style.color,
                  }}>
                    {content?.headline || 'Untitled Slide'}
                  </h2>

                  {content?.subheadline && (
                    <p style={{ fontSize: 16, margin: '0 0 24px', opacity: 0.85, lineHeight: 1.4 }}>
                      {content.subheadline}
                    </p>
                  )}
                </div>

                {/* Content & Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: chartData ? '1fr 1fr' : '1fr', gap: 24, flex: 1, alignItems: 'center' }}>
                  <div>
                    {content?.bullets?.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {content.bullets.map((b, bi) => (
                          <li key={bi} style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.9 }}>{b}</li>
                        ))}
                      </ul>
                    ) : content?.body ? (
                      <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, opacity: 0.9 }}>{content.body}</p>
                    ) : null}
                  </div>

                  {chartData && chartData.type !== 'none' && (
                    <div style={{
                      background: bgPreset.style.cardBg, border: `1px solid ${bgPreset.style.border}`,
                      borderRadius: 10, padding: 16, height: 220,
                    }}>
                      <ChartComponent data={chartData} />
                    </div>
                  )}
                </div>

                {/* Slide Footer */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 11, opacity: 0.6, pt: 16, borderTop: `1px solid ${bgPreset.style.border}`,
                }}>
                  <span>Deao Studios Pitch Generator</span>
                  <span>Slide {selectedSlide + 1} of {slides.length}</span>
                </div>
              </div>
            ) : deck.status === 'generating' || deck.status === 'queued' ? (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '40px 48px', maxWidth: 520, width: '100%', textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', marginBottom: 16 }} className="animate-spin" />
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Crafting Pitch Deck...</h3>
                <p style={{ color: 'var(--text-subtle)', fontSize: 13, margin: '0 0 20px' }}>
                  {progress?.message || 'Gemini 3.6 Flash is drafting your slides...'}
                </p>
                {progress?.slideProgress && (
                  <div style={{ background: 'var(--bg)', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 20 }}>
                    <div style={{
                      width: `${(progress.slideProgress.current / progress.slideProgress.total) * 100}%`,
                      height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease',
                    }} />
                  </div>
                )}
                <button className="btn-secondary" onClick={retryGeneration} style={{ fontSize: 12 }}>
                  ⚡ Force Restart Generation
                </button>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '40px 48px', maxWidth: 480, width: '100%', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Deck Not Generated Yet</h3>
                <p style={{ color: 'var(--text-subtle)', fontSize: 13, margin: '0 0 20px' }}>
                  Click below to generate slides using Gemini 3.6 Flash AI.
                </p>
                <button className="btn-primary" onClick={retryGeneration} style={{ fontSize: 13, padding: '8px 20px' }}>
                  ⚡ Start AI Slide Generation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pre-saved Background Picker Modal */}
      {showBgPicker && (
        <BackgroundPicker
          selectedId={currentBgId}
          onSelect={id => setCurrentBgId(id)}
          onClose={() => setShowBgPicker(false)}
        />
      )}

      {/* Versions Modal */}
      {showVersions && (
        <Modal title="Revision History" onClose={() => setShowVersions(false)}>
          {versions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No saved versions yet</p>
          ) : versions.map(v => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Version {v.version_num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                  {new Date(v.created_at).toLocaleString()}
                </div>
              </div>
              <button className="btn-secondary" onClick={() => restoreVersion(v.id)} style={{ padding: '4px 10px', fontSize: 12 }}>
                Restore
              </button>
            </div>
          ))}
        </Modal>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <Modal title="AI Decision Logs" onClose={() => setShowLogs(false)} wide>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {logs.slice(0, 30).map(log => (
              <div key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
                  <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                    {log.ai_model}
                  </span>
                  <span style={{ color: 'var(--text)' }}>{log.action}</span>
                  {log.duration_ms && <span style={{ color: 'var(--text-subtle)' }}>{log.duration_ms}ms</span>}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </NotionLayout>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px', width: '100%',
        maxWidth: wide ? 680 : 440, margin: '20px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 20, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
