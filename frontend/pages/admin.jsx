// pages/admin.jsx - Notion Style Admin & AI Settings
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
      const us = await api.listUsers();
      setUsers(us);
    } catch (err) {
      setUserMsg(err.message);
    }
  }

  return (
    <NotionLayout activeTab="admin" title="Admin Settings">
      <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>Admin Settings</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>
            Manage AI Provider keys, models, and team user permissions
          </p>
        </div>

        {/* Notion Tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {[
            { id: 'ai', label: '🤖 AI Configuration' },
            { id: 'users', label: '👥 User Access' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'none', border: 'none',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: tab === t.id ? 700 : 500, fontSize: 13,
                padding: '8px 16px', cursor: 'pointer', marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'ai' && (
          <div className="notion-card">
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>AI Provider Credentials</h3>

            {aiStatus && (
              <div style={{
                background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 16, marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: 8 }}>
                  CURRENT STATUS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Gemini: </span>
                    <span style={{ color: aiStatus.geminiConfigured ? '#34d399' : '#f87171', fontWeight: 600 }}>
                      {aiStatus.geminiConfigured ? '✅ Active' : '❌ Not set'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Anthropic: </span>
                    <span style={{ color: aiStatus.anthropicConfigured ? '#34d399' : 'var(--text-subtle)', fontWeight: 600 }}>
                      {aiStatus.anthropicConfigured ? '✅ Active' : 'Off'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Active Provider: </span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{aiStatus.activeProvider}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label>Google Gemini API Key</label>
              <input
                type="password" className="input" placeholder="AIzaSy..."
                value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Anthropic Claude API Key (optional)</label>
              <input
                type="password" className="input" placeholder="sk-ant-..."
                value={anthropicKey} onChange={e => setAnthropicKey(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
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
                border: `1px solid ${testResult.ok === true ? 'rgba(16,185,129,0.3)' : testResult.ok === false ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                color: testResult.ok === true ? '#34d399' : testResult.ok === false ? '#f87171' : 'var(--text)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20,
              }}>
                {testResult.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={testAI}>Test Connection</button>
              <button className="btn-primary" onClick={saveAIKeys} disabled={saving}>
                {saving ? 'Saving...' : 'Save AI Credentials'}
              </button>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Create User Card */}
            <div className="notion-card">
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Add Team Member</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label>Full Name</label>
                  <input className="input" placeholder="Jane Doe" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div>
                  <label>Email Address</label>
                  <input className="input" placeholder="jane@deaostudios.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label>Password</label>
                  <input type="password" className="input" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
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
                <div style={{ fontSize: 13, color: userMsg.includes('created') ? '#34d399' : '#f87171', marginBottom: 16 }}>
                  {userMsg}
                </div>
              )}

              <button className="btn-primary" onClick={createUser}>Create User</button>
            </div>

            {/* User List */}
            <div className="notion-card">
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Team Users ({users.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {users.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13,
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      <span style={{ color: 'var(--text-subtle)', marginLeft: 8 }}>({u.email})</span>
                    </div>
                    <span className="badge badge-drafting" style={{ textTransform: 'capitalize' }}>
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
