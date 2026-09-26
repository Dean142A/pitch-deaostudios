// pages/login.jsx - Create UI Authentication Page with Demo Autofill & Sign Up
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'register') {
        data = await api.register(form.name, form.email, form.password);
      } else {
        data = await api.login(form.email, form.password);
      }
      localStorage.setItem('deao_token', data.token);
      localStorage.setItem('deao_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setLoading(true);
    try {
      const demoEmail = 'admin@deaostudios.com';
      const demoPass = 'deao_admin_pass_2026!';
      setForm({ name: 'Admin', email: demoEmail, password: demoPass });
      const data = await api.login(demoEmail, demoPass);
      localStorage.setItem('deao_token', data.token);
      localStorage.setItem('deao_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(`Demo login failed: ${err.message}`);
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
      {/* Background Ambient Glow Orbs */}
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

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: 22, marginBottom: 14,
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)',
          }}>
            ✦
          </div>
          <h1 style={{ fontSize: 24, margin: '0 0 4px', color: 'var(--text)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            DEAO STUDIOS
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Sign in or create an account to access the Pitch Studio
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Demo Access
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Click to sign in with pre-configured Admin credentials
            </div>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-primary"
            style={{ fontSize: 12, padding: '7px 14px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', whiteSpace: 'nowrap' }}
          >
            1-Click Admin Sign In →
          </button>
        </div>

        {/* Auth Card */}
        <div className="notion-card" style={{ padding: '28px 32px', backdropFilter: 'blur(16px)' }}>
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 4, marginBottom: 24,
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                background: mode === 'login' ? 'var(--accent-gradient)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
                border: 'none', borderRadius: 6, padding: '8px 12px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                background: mode === 'register' ? 'var(--accent-gradient)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--text-muted)',
                border: 'none', borderRadius: 6, padding: '8px 12px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label>Full Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label>Work Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="admin@deaostudios.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              {mode === 'register' && (
                <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
                  Min 8 chars, 1 uppercase letter, 1 number
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171', borderRadius: 8, padding: '10px 14px',
                fontSize: 12.5, marginBottom: 20, lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }}
            >
              {loading ? (mode === 'register' ? 'Creating Account...' : 'Signing in...') : (mode === 'register' ? 'Create Account & Continue →' : 'Sign In to Workspace →')}
            </button>
          </form>
        </div>

        {/* Credentials hint */}
        <div style={{
          textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 14px', marginTop: 16, fontSize: 11, color: 'var(--text-muted)',
        }}>
          <span>Default Demo Credentials: </span>
          <strong style={{ color: 'var(--text)' }}>admin@deaostudios.com</strong> / <strong style={{ color: 'var(--text)' }}>deao_admin_pass_2026!</strong>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 11, marginTop: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          pitch.deaostudios.cloud · Enterprise Pitch Studio Edition
        </p>
      </div>
    </div>
  );
}


