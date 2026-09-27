// pages/register.jsx - Linear-styled Account Registration Page
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(form.name, form.email, form.password);
      localStorage.setItem('deao_token', data.token);
      localStorage.setItem('deao_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
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
        {/* Logo and Title Header */}
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
            Create your account
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Get started with DEAO Pitch Studio today
          </p>
        </div>

        {/* Form Card */}
        <div className="notion-card" style={{ padding: '28px 28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label>Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Work Email</label>
              <input
                className="input"
                type="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Password</label>
              <input
                className="input"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Confirm Password</label>
              <input
                className="input"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
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
              {loading ? 'Creating account...' : 'Create Account'}
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
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 12, marginTop: 24 }}>
          DEAO Studios Pitch Workspace Platform
        </p>
      </div>
    </div>
  );
}
