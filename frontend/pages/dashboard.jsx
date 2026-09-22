// pages/dashboard.jsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

const STYLES_INFO = {
  'modern-tech': { label: 'Modern Tech', color: '#6366f1', icon: '⬡' },
  'corporate':   { label: 'Corporate', color: '#0ea5e9', icon: '◈' },
  'creative':    { label: 'Creative', color: '#f43f5e', icon: '◉' },
};

export default function Dashboard() {
  const router = useRouter();
  const [decks, setDecks] = useState([]);
  const [user, setUser] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('deao_token');
    if (!token) { router.push('/login'); return; }

    const u = JSON.parse(localStorage.getItem('deao_user') || '{}');
    setUser(u);

    Promise.all([api.listDecks(), api.aiStatus()])
      .then(([d, ai]) => { setDecks(d); setAiStatus(ai); })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.clear();
    router.push('/login');
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
        background: 'rgba(13,21,37,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--accent)', fontSize: 22 }}>⬡</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>DEAO PITCH</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* AI Status */}
          {aiStatus && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: aiStatus.geminiConfigured || aiStatus.anthropicConfigured
                ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${aiStatus.geminiConfigured || aiStatus.anthropicConfigured ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 20, fontSize: 12,
              color: aiStatus.geminiConfigured || aiStatus.anthropicConfigured ? '#34d399' : '#f87171',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'block' }} />
              {aiStatus.activeProvider === 'none' ? 'No AI' : `AI: ${aiStatus.activeProvider}`}
            </div>
          )}

          {user?.role === 'admin' && (
            <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
              Admin
            </Link>
          )}

          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.name}</span>
          <button onClick={logout} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 32 }}>Pitch Decks</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{decks.length} deck{decks.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>+</span> New Deck
            </button>
          </Link>
        </div>

        {/* AI Warning */}
        {aiStatus && !aiStatus.geminiConfigured && !aiStatus.anthropicConfigured && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <strong style={{ color: '#fbbf24' }}>No AI provider configured.</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 14 }}>
                Add your Gemini API key in <Link href="/admin" style={{ color: 'var(--accent)' }}>Admin Settings</Link> to enable deck generation.
              </span>
            </div>
          </div>
        )}

        {/* Deck Grid */}
        {decks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            border: '1px dashed var(--border)', borderRadius: 16,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3 style={{ color: '#94a3b8', marginBottom: 8 }}>No decks yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Create your first AI-powered pitch deck</p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Create Your First Deck</button>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {decks.map(deck => {
              const styleInfo = STYLES_INFO[deck.style] || STYLES_INFO['modern-tech'];
              return (
                <div key={deck.id} className="card" style={{
                  padding: 0, overflow: 'hidden',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                  onClick={() => router.push(`/deck/${deck.id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {/* Deck preview header */}
                  <div style={{
                    height: 120, background: '#0f172a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                      background: styleInfo.color,
                    }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, color: styleInfo.color, marginBottom: 6 }}>{styleInfo.icon}</div>
                      <div style={{ fontFamily: 'Syne', fontSize: 13, color: '#94a3b8' }}>{styleInfo.label}</div>
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10 }}>
                      <span className={`badge badge-${deck.status}`}>{deck.status}</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>{deck.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 12px' }}>
                      {deck.slide_count || deck.num_slides} slides · {deck.owner_name}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0 }}>
                      {new Date(deck.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
