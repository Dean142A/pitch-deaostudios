// pages/index.jsx - Deck Creation Form

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

const STYLES = [
  { id: 'modern-tech', label: 'Modern Tech', desc: 'Dark, bold, futuristic', color: '#6366f1', icon: '⬡' },
  { id: 'corporate', label: 'Corporate', desc: 'Clean, professional, trusted', color: '#0ea5e9', icon: '◈' },
  { id: 'creative', label: 'Creative', desc: 'Vibrant, daring, memorable', color: '#f43f5e', icon: '◉' },
];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [form, setForm] = useState({
    companyName: '', industry: '', productDescription: '',
    targetMarket: '', fundingGoal: '', keyAchievements: '',
    teamMembers: '', numSlides: 15, style: 'modern-tech',
  });

  useEffect(() => {
    const token = localStorage.getItem('deao_token');
    if (!token) router.push('/login');
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        const uploaded = await api.uploadFile(logoFile);
        logoUrl = uploaded.url;
      }

      const result = await api.createDeck({ ...form, logoUrl });
      router.push(`/deck/${result.deckId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const required1 = form.companyName && form.industry && form.productDescription;
  const required2 = form.targetMarket && form.fundingGoal && form.keyAchievements;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.02,
        backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, background: 'rgba(13,21,37,0.9)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ color: 'var(--accent)', fontSize: 22 }}>⬡</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: 1, color: 'var(--text)' }}>DEAO PITCH</span>
        </Link>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, margin: '0 0 12px' }}>Create Pitch Deck</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>AI-powered deck generation in minutes</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, gap: 0 }}>
          {['Company Info', 'Market & Goals', 'Style & Generate'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: step >= i + 1 ? 1 : 0.4,
                cursor: i + 1 < step ? 'pointer' : 'default',
              }} onClick={() => i + 1 < step && setStep(i + 1)}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: step >= i + 1 ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `1px solid ${step >= i + 1 ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step === i + 1 ? 'var(--text)' : 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div style={{ width: 40, height: 1, background: 'var(--border)', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        {/* ─── Step 1 ─── */}
        {step === 1 && (
          <div className="card">
            <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>Company Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <div>
                <label>Company Name *</label>
                <input className="input" placeholder="Acme Corp" value={form.companyName}
                  onChange={e => set('companyName', e.target.value)} />
              </div>
              <div>
                <label>Industry *</label>
                <input className="input" placeholder="SaaS / FinTech / HealthTech" value={form.industry}
                  onChange={e => set('industry', e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Product / Service Description *</label>
              <textarea className="input" rows={3}
                placeholder="Describe what your product does, the problem it solves, and how it works..."
                value={form.productDescription}
                onChange={e => set('productDescription', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Team Members (optional)</label>
              <input className="input" placeholder="CEO: Jane Doe (ex-Google), CTO: John Smith (MIT)"
                value={form.teamMembers}
                onChange={e => set('teamMembers', e.target.value)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Company Logo (optional)</label>
              <div style={{
                border: '1px dashed var(--border)', borderRadius: 8, padding: '20px',
                textAlign: 'center', cursor: 'pointer',
                background: logoFile ? 'rgba(99,102,241,0.05)' : 'transparent',
                transition: 'all 0.2s',
              }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setLogoFile(f); }}
              >
                <input type="file" accept="image/*" id="logo-input" style={{ display: 'none' }}
                  onChange={e => setLogoFile(e.target.files[0])} />
                <label htmlFor="logo-input" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {logoFile ? (
                    <span style={{ color: 'var(--accent)' }}>✓ {logoFile.name}</span>
                  ) : (
                    <span>Drop image here or <span style={{ color: 'var(--accent)' }}>browse</span></span>
                  )}
                </label>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setStep(2)} disabled={!required1}
              style={{ float: 'right', padding: '11px 28px' }}>
              Next →
            </button>
            <div style={{ clear: 'both' }} />
          </div>
        )}

        {/* ─── Step 2 ─── */}
        {step === 2 && (
          <div className="card">
            <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>Market & Goals</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <div>
                <label>Target Market *</label>
                <input className="input" placeholder="SMBs in North America, 50-500 employees"
                  value={form.targetMarket}
                  onChange={e => set('targetMarket', e.target.value)} />
              </div>
              <div>
                <label>Funding Goal *</label>
                <input className="input" placeholder="$2M Seed Round"
                  value={form.fundingGoal}
                  onChange={e => set('fundingGoal', e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Key Achievements & Metrics *</label>
              <textarea className="input" rows={3}
                placeholder="$50K MRR, 200 customers, 40% MoM growth, 3 enterprise pilots..."
                value={form.keyAchievements}
                onChange={e => set('keyAchievements', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Number of Slides</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <input type="range" min="8" max="25" value={form.numSlides}
                  onChange={e => set('numSlides', parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent)' }} />
                <div style={{
                  minWidth: 44, textAlign: 'center', fontWeight: 700,
                  color: 'var(--accent)', fontSize: 18,
                }}>{form.numSlides}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={!required2}
                style={{ flex: 1, padding: '11px' }}>
                Next: Choose Style →
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3 ─── */}
        {step === 3 && (
          <div className="card">
            <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>Choose a Style</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
              {STYLES.map(s => (
                <div key={s.id}
                  onClick={() => set('style', s.id)}
                  style={{
                    border: `2px solid ${form.style === s.id ? s.color : 'var(--border)'}`,
                    borderRadius: 12, padding: '20px 16px', cursor: 'pointer',
                    background: form.style === s.id ? `${s.color}12` : 'var(--bg-elevated)',
                    textAlign: 'center', transition: 'all 0.2s',
                    boxShadow: form.style === s.id ? `0 0 20px ${s.color}30` : 'none',
                  }}
                >
                  <div style={{ fontSize: 32, color: s.color, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 10,
              padding: '16px 20px', marginBottom: 24,
              border: '1px solid var(--border)',
            }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1 }}>GENERATION SUMMARY</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Company:</span><span>{form.companyName}</span>
                <span style={{ color: 'var(--text-muted)' }}>Industry:</span><span>{form.industry}</span>
                <span style={{ color: 'var(--text-muted)' }}>Slides:</span><span>{form.numSlides}</span>
                <span style={{ color: 'var(--text-muted)' }}>Style:</span><span>{STYLES.find(s => s.id === form.style)?.label}</span>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', borderRadius: 8, padding: '10px 14px',
                fontSize: 13, marginBottom: 18,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setStep(2)} disabled={loading}>← Back</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}
                style={{ flex: 1, padding: '12px', fontSize: 15 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} className="animate-spin" />
                    Starting Generation...
                  </span>
                ) : (
                  '🚀 Generate Pitch Deck'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
