// pages/admin.jsx - Pitch Deck Generator Admin Settings
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NotionLayout from '../components/NotionLayout';
import api from '../utils/api';

export default function Admin() {
  const router = useRouter();
  const [aiStatus, setAiStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('ai');

  const [geminiKey, setGeminiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [aiProvider, setAiProvider] = useState('auto');
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('deao_token');
    if (!token) { router.push('/login'); return; }

    Promise.all([api.aiStatus(), api.listUsers()]).then(([ai, us]) => {
      setAiStatus(ai);
      setAiProvider(ai.preference);
      setUsers(us);
    }).catch(() => router.push('/dashboard'));
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
      setTestResult({ ok: true, message: 'AI credentials saved successfully!' });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function testAI() {
    setTestResult({ ok: null, message: 'Testing provider connection...' });
    try {
      const r = await api.testAI();
      setTestResult({ ok: r.ok, message: r.ok ? `Connection verified: ${r.status.activeProvider} model responding cleanly.` : r.error });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    }
  }

  async function createUser() {
    setUserMsg('');
    try {
      await api.createUser(newUser);
      setUserMsg('User account created successfully!');
      setNewUser({ name: '', email: '', password: '', role: 'editor' });
      const us = await api.listUsers();
      setUsers(us);
    } catch (err) {
      setUserMsg(err.message);
    }
  }

  return (
    <NotionLayout activeTab="admin" title="Admin Settings">
      <div style={{ padding: '36px 36px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Admin & Settings
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
            Manage AI Provider keys, LLM preferences, and workspace team permissions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'inline-flex', gap: 6,
          background: 'var(--bg-sidebar)',
          borderRadius: 'var(--radius-pill)', padding: 4, marginBottom: 28,
        }}>
          {[
            { id: 'ai', label: 'AI Provider Settings' },
            { id: 'users', label: 'User Access Control' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? 'var(--brand)' : 'transparent',
                color: tab === t.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'ai' && (
          <div className="notion-card" style={{ padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>AI Model Credentials</h3>

            {aiStatus && (
              <div style={{
                background: 'var(--bg-sidebar)',
                borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 24,
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Live LLM Status
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Google Gemini: </span>
                    <span style={{ color: aiStatus.geminiConfigured ? '#34d399' : '#f87171', fontWeight: 600 }}>
                      {aiStatus.geminiConfigured ? 'Active' : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Anthropic Claude: </span>
                    <span style={{ color: aiStatus.anthropicConfigured ? '#34d399' : 'var(--text-subtle)', fontWeight: 600 }}>
                      {aiStatus.anthropicConfigured ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Active Provider: </span>
                    <span style={{ fontWeight: 600, color: 'var(--brand)' }}>{aiStatus.activeProvider}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label>Google Gemini API Key</label>
              <input
                type="password" className="input" placeholder="AIzaSy..."
                value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Anthropic Claude API Key (optional)</label>
              <input
                type="password" className="input" placeholder="sk-ant-..."
                value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label>Preferred AI Provider</label>
              <select
                className="input" value={aiProvider} onChange={e => setAiProvider(e.target.value)}
              >
                <option value="auto">Auto (Gemini primary, Claude fallback)</option>
                <option value="gemini">Google Gemini Only</option>
                <option value="anthropic">Anthropic Claude Only</option>
              </select>
            </div>

            {testResult && (
              <div style={{
                background: testResult.ok === true ? 'rgba(16,185,129,0.1)' : testResult.ok === false ? 'rgba(239,68,68,0.1)' : 'var(--bg-sidebar)',
                color: testResult.ok === true ? '#34d399' : testResult.ok === false ? '#f87171' : 'var(--text)',
                borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, marginBottom: 24,
              }}>
                {testResult.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={testAI} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>Test Connection</button>
              <button className="btn-primary" onClick={saveAIKeys} disabled={saving} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                {saving ? 'Saving...' : 'Save AI Credentials'}
              </button>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Add User Form */}
            <div className="notion-card" style={{ padding: '28px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700 }}>Add Team Member</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label>Full Name</label>
                  <input className="input" placeholder="Alex Morgan" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div>
                  <label>Email Address</label>
                  <input className="input" placeholder="alex@pitchdeck.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewUserPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      title={showNewUserPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {showNewUserPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label>Role</label>
                  <select className="input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {userMsg && (
                <div style={{ fontSize: 13, color: userMsg.includes('created') ? '#34d399' : '#f87171', marginBottom: 18 }}>
                  {userMsg}
                </div>
              )}

              <button className="btn-primary" onClick={createUser} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>Create User Account</button>
            </div>

            {/* Users Directory */}
            <div className="notion-card" style={{ padding: '28px' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 17, fontWeight: 700 }}>Team Users ({users.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', background: 'var(--bg-sidebar)',
                    borderRadius: 'var(--radius-md)', fontSize: 13,
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</span>
                      <span style={{ color: 'var(--text-subtle)', marginLeft: 10 }}>({u.email})</span>
                    </div>
                    <span className="badge badge-drafting" style={{ textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </NotionLayout>
  );
}
