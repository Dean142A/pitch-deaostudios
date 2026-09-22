// pages/admin.jsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('ai');

  // AI key form
  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [aiProvider, setAiProvider] = useState('auto');
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('deao_user') || '{}');
    if (u.role !== 'admin') { router.push('/dashboard'); return; }
    setUser(u);

    Promise.all([api.aiStatus(), api.listUsers()]).then(([ai, us]) => {
      setAiStatus(ai);
      setAiProvider(ai.preference);
      setUsers(us);
    }).catch(() => router.push('/login'));
  }, []);

  async function saveAIKeys() {
    setSaving(true);
    setTestResult(null);
    try {
      const result = await api.updateKeys({
        geminiKey: geminiKey || undefined,
        anthropicKey: anthropicKey || undefined,
        provider: aiProvider,
      });
      setAiStatus(result.status);
      setGeminiKey('');
      setAnthropicKey('');
      setTestResult({ ok: true, message: 'Keys saved successfully!' });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function testAI() {
    setTestResult({ ok: null, message: 'Testing...' });
    try {
      const r = await api.testAI();
      setTestResult({ ok: r.ok, message: r.ok ? `✓ ${r.status.activeProvider} is working!` : r.error });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    }
  }

  async function createUser() {
    setUserMsg('');
    try {
      await api.createUser(newUser);
      setUserMsg('User created!');
      setNewUser({ name: '', email: '', password: '', role: 'editor' });
    } catch (err) {
      setUserMsg(err.message);
      return;
    }
    // Refresh user list separately so a list failure doesn't mask successful creation
    try {
      const us = await api.listUsers();
      setUsers(us);
    } catch {
      // Non-critical — list will refresh on next page load
    }
  }

  const tabs = [
    { id: 'ai', label: '🤖 AI Settings' },
    { id: 'users', label: '👥 Users' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, background: 'rgba(13,21,37,0.9)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--accent)', fontSize: 22 }}>⬡</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>Admin Panel</span>
        </div>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Manage AI keys, users, and system configuration</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: 14, fontWeight: 600,
              color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── AI Settings Tab ─── */}
        {tab === 'ai' && (
          <div>
            {/* Current status */}
            {aiStatus && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Current AI Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Active Provider', value: aiStatus.activeProvider, good: aiStatus.activeProvider !== 'none' },
                    { label: 'Gemini', value: aiStatus.geminiConfigured ? 'Configured ✓' : 'Not set', good: aiStatus.geminiConfigured },
                    { label: 'Anthropic', value: aiStatus.anthropicConfigured ? 'Configured ✓' : 'Not set (optional)', good: aiStatus.anthropicConfigured },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px',
                      border: `1px solid ${item.good ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: item.good ? '#34d399' : '#94a3b8' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Update API Keys</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 20px' }}>
                Keys are stored in your backend .env file. Leave blank to keep existing values.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label>
                  Gemini API Key
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#34d399', fontWeight: 400 }}>Primary (Free tier available)</span>
                </label>
                <input className="input" type="password" placeholder="AIza..."
                  value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer"
                    style={{ color: 'var(--accent)' }}>aistudio.google.com</a>
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label>
                  Anthropic API Key
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>Optional — enables Claude AI</span>
                </label>
                <input className="input" type="password" placeholder="sk-ant-..."
                  value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>AI Provider Preference</label>
                <select className="input" value={aiProvider} onChange={e => setAiProvider(e.target.value)}>
                  <option value="auto">Auto (Anthropic if available, else Gemini)</option>
                  <option value="gemini">Always use Gemini</option>
                  <option value="anthropic">Always use Anthropic</option>
                </select>
              </div>

              {testResult && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
                  background: testResult.ok === null ? 'rgba(99,102,241,0.1)' :
                    testResult.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${testResult.ok === null ? 'var(--border)' :
                    testResult.ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: testResult.ok === null ? 'var(--text-muted)' :
                    testResult.ok ? '#34d399' : '#f87171',
                }}>
                  {testResult.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" onClick={testAI} style={{ padding: '10px 20px' }}>
                  Test Connection
                </button>
                <button className="btn-primary" onClick={saveAIKeys} disabled={saving}
                  style={{ flex: 1, padding: '10px' }}>
                  {saving ? 'Saving...' : 'Save Keys'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Users Tab ─── */}
        {tab === 'users' && (
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Create User</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label>Name</label>
                  <input className="input" placeholder="Jane Doe" value={newUser.name}
                    onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))} />
                </div>
                <div>
                  <label>Email</label>
                  <input className="input" type="email" placeholder="jane@deaostudios.com" value={newUser.email}
                    onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))} />
                </div>
                <div>
                  <label>Password</label>
                  <input className="input" type="password" value={newUser.password}
                    onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} />
                </div>
                <div>
                  <label>Role</label>
                  <select className="input" value={newUser.role}
                    onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              {userMsg && (
                <div style={{ fontSize: 13, color: userMsg.includes('created') ? '#34d399' : '#f87171', marginBottom: 12 }}>
                  {userMsg}
                </div>
              )}
              <button className="btn-primary" onClick={createUser} style={{ padding: '10px 24px' }}>
                Create User
              </button>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>All Users ({users.length})</h3>
              {users.map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--accent)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 700, fontSize: 14,
                    }}>
                      {u.name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.email}</div>
                    </div>
                  </div>
                  <span className={`badge badge-${u.role === 'admin' ? 'generating' : 'drafting'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
