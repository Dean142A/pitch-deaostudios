// pages/login.jsx - Notion Style Authentication Page
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
      justifyContent: 'center', background: 'var(--bg)', padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 16,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          }}>⬡</div>
          <h1 style={{ fontSize: 24, margin: '0 0 6px', color: 'var(--text)', fontWeight: 800 }}>
            Deao Studios Pitch Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>
            Sign in to access your Notion workspace
          </p>
        </div>

        <div className="notion-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@deaostudios.com"
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
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171', borderRadius: 6, padding: '9px 13px',
                fontSize: 13, marginBottom: 18,
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              {loading ? 'Signing in...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: 12, marginTop: 24 }}>
          pitch.deaostudios.cloud · Notion Workspace Edition
        </p>
      </div>
    </div>
  );
}
