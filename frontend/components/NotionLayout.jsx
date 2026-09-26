// components/NotionLayout.jsx - Create UI Studio Hybrid Layout
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function NotionLayout({ children, activeTab = 'dashboard', title = 'Deao Studios' }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      // Unauthenticated, router handles redirects on page level
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deao_token');
      localStorage.removeItem('deao_user');
      router.push('/login');
    }
  }

  const navItems = [
    {
      id: 'templates',
      label: 'Ready-Made Templates',
      path: '/?tab=templates',
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    },
    {
      id: 'new',
      label: 'AI Deck Creator',
      path: '/?tab=ai',
      primary: true,
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    },
    {
      id: 'dashboard',
      label: 'All Pitch Decks',
      path: '/dashboard',
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: 'admin',
      label: 'Admin Settings',
      path: '/admin',
      adminOnly: true,
      svg: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Studio Glass Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 250,
        background: 'rgba(14, 17, 26, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
        zIndex: 50,
      }}>
        {/* Workspace Brand Header */}
        <div style={{
          height: 60,
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: 14,
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              }}>
                ✦
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  DEAO STUDIOS
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  PITCH STUDIO
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? (
                <polyline points="13 17 18 12 13 7" />
              ) : (
                <polyline points="11 17 6 12 11 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation List */}
        <div style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const isActive = activeTab === item.id;

            return (
              <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: item.primary
                    ? (isActive ? 'var(--accent-gradient)' : 'rgba(99, 102, 241, 0.12)')
                    : (isActive ? 'var(--bg-hover)' : 'transparent'),
                  color: item.primary ? '#ffffff' : (isActive ? '#ffffff' : 'var(--text-muted)'),
                  border: item.primary
                    ? (isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(99, 102, 241, 0.35)')
                    : (isActive ? '1px solid var(--border-highlight)' : '1px solid transparent'),
                  fontSize: 13,
                  fontWeight: isActive || item.primary ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive && item.primary ? '0 4px 14px rgba(99, 102, 241, 0.35)' : 'none',
                }}>
                  <span style={{ color: isActive ? '#06b6d4' : (item.primary ? '#ffffff' : 'var(--text-muted)'), display: 'flex' }}>
                    {item.svg}
                  </span>
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
              </Link>
            );
          })}

          {!collapsed && (
            <div style={{ marginTop: 28, padding: '0 10px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                DESIGN THEMES
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}></span>
                  Modern Tech Studio
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }}></span>
                  Corporate Cyan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 8px #f43f5e' }}></span>
                  Creative Rose
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Footer */}
        {user && (
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent-gradient)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#06b6d4', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role || 'editor'}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s ease',
              }}
            >
              Exit
            </button>
          </div>
        )}
      </aside>

      {/* Main Studio Workspace Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Breadcrumb & Status Header */}
        <header style={{
          height: 60,
          padding: '0 28px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(9, 11, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500 }}>Workspace</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--text)', fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Live API Status Indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#34d399',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} className="animate-pulse-glow" />
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

