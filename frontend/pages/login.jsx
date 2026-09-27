// pages/login.jsx - Linear Obsidian Styled Authentication Page
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(form.email, form.password);
      localStorage.setItem('deao_token', data.token);
      localStorage.setItem('deao_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
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
      setForm({ email: demoEmail, password: demoPass });
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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px 16px',
      color: 'var(--text)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            margin: '0 0 6px',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            Sign in to DEAO Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Demo Access
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Pre-configured Admin credentials
            </div>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-secondary"
            style={{
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              whiteSpace: 'nowrap',
            }}
          >
            Demo Sign In
          </button>
        </div>

        {/* Auth Card */}
        <div className="notion-card" style={{ padding: '28px 28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label>Work Email</label>
              <input
                className="input"
                type="email"
                placeholder="admin@deaostudios.com"
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
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 20,
                lineHeight: 1.4,
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '11px',
                fontSize: 14,
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>

        {/* Credentials hint */}
        <div style={{
          textAlign: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginTop: 16,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          Default Admin: <strong style={{ color: 'var(--text)' }}>admin@deaostudios.com</strong> / <strong style={{ color: 'var(--text)' }}>deao_admin_pass_2026!</strong>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 12, marginTop: 24 }}>
          DEAO Studios Pitch Workspace Platform
        </p>
      </div>
    </div>
  );
}
