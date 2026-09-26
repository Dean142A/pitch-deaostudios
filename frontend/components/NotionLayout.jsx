// components/NotionLayout.jsx - Notion-Style Sidebar & Navigation Layout
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
      // Unauthenticated, router will redirect if needed on page load
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('deao_token');
      router.push('/login');
    }
  }

  const navItems = [
    { id: 'templates', label: 'Ready-Made Templates', icon: '⬡', path: '/?tab=templates' },
    { id: 'new', label: 'AI Deck Creator', icon: '+', path: '/?tab=ai', primary: true },
    { id: 'dashboard', label: 'All Decks', icon: '▤', path: '/dashboard' },
    { id: 'admin', label: 'Admin Settings', icon: '⚙', path: '/admin', adminOnly: true },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Notion Sidebar */}
      <aside style={{
        width: collapsed ? 64 : 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        zIndex: 50,
      }}>
        {/* Workspace Brand Header */}
        <div style={{
          height: 56,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 13,
              }}>⬡</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Deao Studios</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Pitch Generator</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {collapsed ? '➔' : '◀'}
          </button>
        </div>

        {/* Navigation List */}
        <div style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const isActive = activeTab === item.id;

            return (
              <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: item.primary
                    ? (isActive ? 'var(--accent)' : 'rgba(99, 102, 241, 0.12)')
                    : (isActive ? 'var(--bg-card)' : 'transparent'),
                  color: item.primary ? (isActive ? '#ffffff' : 'var(--accent-2)') : (isActive ? '#ffffff' : 'var(--text-muted)'),
                  border: item.primary ? '1px solid rgba(99, 102, 241, 0.3)' : (isActive ? '1px solid var(--border)' : '1px solid transparent'),
                  fontSize: 13,
                  fontWeight: isActive || item.primary ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            );
          })}

          {!collapsed && (
            <div style={{ marginTop: 24, padding: '0 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                TEMPLATES & STYLES
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}></span>
                  Modern Tech
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }}></span>
                  Corporate Blue
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }}></span>
                  Creative Rose
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Footer */}
        {user && (
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {!collapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'capitalize' }}>
                    {user.role || 'editor'}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'none', border: 'none', color: 'var(--text-subtle)',
                cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
              }}
            >
              Exit
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Notion Breadcrumb Navigation */}
        <header style={{
          height: 56,
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15, 17, 23, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{title}</span>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
