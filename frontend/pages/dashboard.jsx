// pages/dashboard.jsx - Linear Obsidian Decks Directory
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
    <NotionLayout activeTab="dashboard" title="Decks Directory">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    </NotionLayout>
  );

  return (
    <NotionLayout activeTab="dashboard" title="Decks Directory">
      <div style={{ padding: '36px 36px', maxWidth: 1280, margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Pitch Decks
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} in workspace
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/?tab=templates" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 'var(--radius-pill)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Browse Templates</span>
              </button>
            </Link>

            <Link href="/?tab=ai" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 'var(--radius-pill)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Deck</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Decks
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{decks.length}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ready to Present
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>{completedCount}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Drafts
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{generatingCount}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workspace
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand)' }}>Unlimited</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '12px 18px', marginBottom: 28, gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-subtle)' }}>
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
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter:</span>
            {['all', 'completed', 'generating', 'queued', 'failed'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'var(--brand)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  color: filterStatus === st ? '#ffffff' : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
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
            borderRadius: 'var(--radius-lg)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--text)', fontWeight: 700 }}>No pitch decks found</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
              {search || filterStatus !== 'all' ? 'Try adjusting your search query or status filter' : 'Create your first presentation deck using AI or a template'}
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ borderRadius: 'var(--radius-pill)' }}>Create New Deck</button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
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
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Preset Background Banner */}
                  <div style={{
                    height: 120,
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {preset.name}
                      </span>
                      <span className={`badge badge-${deck.status}`}>
                        {deck.status}
                      </span>
                    </div>

                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {deck.name}
                    </div>
                  </div>

                  {/* Card Info Body */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{deck.slide_count || deck.num_slides || 15} slides</span>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>{deck.owner_name || 'Studio Owner'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        Updated {new Date(deck.updated_at || deck.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>Open Canvas</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                      <button
                        onClick={e => handleDeleteDeck(e, deck.id)}
                        title="Delete Deck"
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'all 0.15s ease',
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
