// pages/dashboard.jsx - Create UI Decks Database Studio
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NotionLayout from '../components/NotionLayout';
import { getBackgroundPreset } from '../utils/backgrounds';
import api from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('deao_token');
    if (!token) { router.push('/login'); return; }

    api.listDecks()
      .then(setDecks)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteDeck(e, deckId) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deck?')) return;
    try {
      await api.deleteDeck(deckId);
      setDecks(decks.filter(d => d.id !== deckId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  const filteredDecks = decks.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          (d.owner_name && d.owner_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const completedCount = decks.filter(d => d.status === 'completed').length;
  const generatingCount = decks.filter(d => d.status === 'generating' || d.status === 'queued').length;

  if (loading) return (
    <NotionLayout activeTab="dashboard" title="All Pitch Decks">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    </NotionLayout>
  );

  return (
    <NotionLayout activeTab="dashboard" title="All Pitch Decks">
      <div style={{ padding: '36px 40px', maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Top Notion View Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Pitch Decks Database
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} in workspace studio
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/?tab=templates" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Browse Templates</span>
              </button>
            </Link>

            <Link href="/?tab=ai" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Pitch Deck</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Studio Metrics Grid Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL DECKS
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{decks.length}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              READY TO PRESENT
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#34d399' }}>{completedCount}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ACTIVE DRAFTS
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{generatingCount}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STUDIO CAPACITY
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#06b6d4' }}>Unlimited</div>
          </div>
        </div>

        {/* Search & Filter Studio Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(14, 18, 27, 0.8)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 28, gap: 16, flexWrap: 'wrap',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-subtle)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Search pitch decks by title or owner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>FILTER:</span>
            {['all', 'completed', 'generating', 'queued', 'failed'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'var(--accent-gradient)' : 'var(--bg-card)',
                  border: filterStatus === st ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                  borderRadius: 20, color: filterStatus === st ? '#ffffff' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'all 0.15s ease',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Decks Grid View */}
        {filteredDecks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 20px',
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 14,
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--text)', fontWeight: 800 }}>No pitch decks found</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
              {search || filterStatus !== 'all' ? 'Try adjusting your search query or status filter' : 'Create your first presentation deck using AI or a template'}
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Create New Deck</button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
          }}>
            {filteredDecks.map(deck => {
              const bgPresetId = deck.input_data?.backgroundPreset || 'dark-obsidian';
              const preset = getBackgroundPreset(bgPresetId);

              return (
                <div
                  key={deck.id}
                  className="notion-card"
                  onClick={() => router.push(`/deck/${deck.id}`)}
                  style={{
                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Preset Background Banner */}
                  <div style={{
                    height: 140,
                    background: preset.style.background,
                    backgroundImage: preset.style.backgroundImage,
                    backgroundSize: preset.style.backgroundSize || 'cover',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: 16, borderBottom: '1px solid var(--border)', position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(0, 0, 0, 0.6)', color: preset.style.color,
                        backdropFilter: 'blur(6px)', border: `1px solid ${preset.style.border}`,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {preset.name}
                      </span>
                      <span className={`badge badge-${deck.status}`}>
                        {deck.status}
                      </span>
                    </div>

                    <div style={{
                      fontSize: 17, fontWeight: 900, color: preset.style.color,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {deck.name}
                    </div>
                  </div>

                  {/* Card Info Body */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{deck.slide_count || deck.num_slides || 15} slides</span>
                        <span>•</span>
                        <span>{deck.owner_name || 'Studio Owner'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        Updated {new Date(deck.updated_at || deck.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)',
                    }}>
                      <span style={{ fontSize: 12, color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Open Canvas</span>
                        <span>→</span>
                      </span>
                      <button
                        onClick={e => handleDeleteDeck(e, deck.id)}
                        title="Delete Deck"
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s ease',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NotionLayout>
  );
}

