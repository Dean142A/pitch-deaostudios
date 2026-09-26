// pages/dashboard.jsx - Notion Database Style Decks Overview
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NotionLayout from '../components/NotionLayout';
import { BACKGROUND_PRESETS, getBackgroundPreset } from '../utils/backgrounds';
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

  if (loading) return (
    <NotionLayout activeTab="dashboard" title="All Decks">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    </NotionLayout>
  );

  return (
    <NotionLayout activeTab="dashboard" title="All Decks">
      <div style={{ padding: '32px 36px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Top Notion View Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Pitch Decks Database</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {decks.length} deck{decks.length !== 1 ? 's' : ''} in workspace
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Browse Templates
              </button>
            </Link>

            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                + New Pitch Deck
              </button>
            </Link>
          </div>
        </div>

        {/* Notion Search & Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 24, gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--text-subtle)', fontWeight: 700 }}>Search:</span>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Search by deck name or owner..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 600 }}>STATUS:</span>
            {['all', 'completed', 'generating', 'queued', 'failed'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'var(--bg-hover)' : 'transparent',
                  border: filterStatus === st ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: 6, color: filterStatus === st ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 12, padding: '4px 10px', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Decks Grid / Database View */}
        {filteredDecks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 12,
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>No decks found</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              {search || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Create your first pitch deck using AI'}
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Create New Deck</button>
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
                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Pre-saved Background Preview Canvas Header */}
                  <div style={{
                    height: 130,
                    background: preset.style.background,
                    backgroundImage: preset.style.backgroundImage,
                    backgroundSize: preset.style.backgroundSize || 'cover',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: 14, borderBottom: '1px solid var(--border)', position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(0, 0, 0, 0.5)', color: preset.style.color,
                        backdropFilter: 'blur(4px)', border: `1px solid ${preset.style.border}`,
                      }}>
                        {preset.name}
                      </span>
                      <span className={`badge badge-${deck.status}`}>
                        {deck.status}
                      </span>
                    </div>

                    <div style={{
                      fontSize: 16, fontWeight: 800, color: preset.style.color,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {deck.name}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <span>{deck.slide_count || deck.num_slides || 15} slides</span>
                        <span>•</span>
                        <span>{deck.owner_name || 'Owner'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        Created {new Date(deck.created_at || deck.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: 16, pt: 12, borderTop: '1px solid var(--border-light)',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                        Open in Canvas →
                      </span>
                      <button
                        onClick={e => handleDeleteDeck(e, deck.id)}
                        title="Delete Deck"
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-subtle)',
                          cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 4, borderRadius: 4,
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
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
