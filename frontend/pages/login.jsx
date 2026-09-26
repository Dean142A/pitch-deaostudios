// pages/login.jsx - Create UI Authentication Page
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      localStorage.setItem('deao_token', data.token);
      localStorage.setItem('deao_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background Neon Ambient Glow Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none', filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '20%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none', filter: 'blur(60px)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 22, marginBottom: 16,
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)',
          }}>
            ✦
          </div>
          <h1 style={{ fontSize: 24, margin: '0 0 6px', color: 'var(--text)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            DEAO STUDIOS
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Sign in to access your Pitch Studio workspace
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="notion-card" style={{ padding: '32px 36px', backdropFilter: 'blur(16px)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label>Work Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@deaostudios.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171', borderRadius: 8, padding: '10px 14px',
                fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
            >
              {loading ? 'Signing in...' : 'Sign In to Workspace →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 11, marginTop: 28, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          pitch.deaostudios.cloud · Enterprise Pitch Studio Edition
        </p>
      </div>
    </div>
  );
}

