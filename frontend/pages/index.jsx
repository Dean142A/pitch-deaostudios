// pages/index.jsx - Notion-Style Deck Creation Wizard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NotionLayout from '../components/NotionLayout';
import BackgroundPicker from '../components/BackgroundPicker';
import TemplateGallery from '../components/TemplateGallery';
import { BACKGROUND_PRESETS, getBackgroundPreset } from '../utils/backgrounds';
import api from '../utils/api';

const STYLES = [
  { id: 'modern-tech', label: 'Modern Tech', desc: 'Dark, bold, futuristic', color: '#6366f1', icon: '⬡' },
  { id: 'corporate', label: 'Corporate', desc: 'Clean, professional, trusted', color: '#0ea5e9', icon: '◈' },
  { id: 'creative', label: 'Creative', desc: 'Vibrant, daring, memorable', color: '#f43f5e', icon: '◉' },
];

export default function Home() {
  const router = useRouter();
  const [creationMode, setCreationMode] = useState('templates'); // 'templates' | 'ai'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const [form, setForm] = useState({
    companyName: '', industry: '', productDescription: '',
    targetMarket: '', fundingGoal: '', keyAchievements: '',
    teamMembers: '', numSlides: 15, style: 'modern-tech',
    backgroundPreset: 'dark-obsidian',
  });

  useEffect(() => {
    const token = localStorage.getItem('deao_token');
    if (!token) router.push('/login');
    if (router.query.tab === 'ai') {
      setCreationMode('ai');
    } else if (router.query.tab === 'templates') {
      setCreationMode('templates');
    }
  }, [router.query.tab]);

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
  const activeBg = getBackgroundPreset(form.backgroundPreset);

  return (
    <NotionLayout activeTab={creationMode === 'templates' ? 'templates' : 'new'} title="Create Pitch Deck">
      <div style={{ maxWidth: creationMode === 'templates' ? 1100 : 780, margin: '0 auto', padding: '36px 24px', transition: 'max-width 0.3s ease' }}>
        {/* Header callout */}
        <div className="notion-callout" style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 24 }}>✨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>
              Deao Studios Pitch Deck Creator
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Pick from industry-proven ready-made templates to edit instantly, or generate a custom pitch deck tailored to your company using AI.
            </div>
          </div>
        </div>

        {/* Top Mode Selector Tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 6, marginBottom: 32,
        }}>
          <button
            onClick={() => setCreationMode('templates')}
            style={{
              background: creationMode === 'templates' ? 'var(--accent)' : 'transparent',
              color: creationMode === 'templates' ? '#ffffff' : 'var(--text-muted)',
              border: 'none', borderRadius: 8, padding: '12px 16px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <span>🎨</span> Ready-Made Templates
          </button>

          <button
            onClick={() => setCreationMode('ai')}
            style={{
              background: creationMode === 'ai' ? 'var(--accent)' : 'transparent',
              color: creationMode === 'ai' ? '#ffffff' : 'var(--text-muted)',
              border: 'none', borderRadius: 8, padding: '12px 16px',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <span>✨</span> Generate with AI Prompt
          </button>
        </div>

        {/* Creation Mode 1: Ready-Made Templates Gallery */}
        {creationMode === 'templates' && (
          <TemplateGallery />
        )}

        {/* Creation Mode 2: AI Wizard */}
        {creationMode === 'ai' && (
          <>
            {/* Wizard Steps Navigation */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 20px', marginBottom: 32,
            }}>
              {['1. Company Info', '2. Market & Goals', '3. Style & Background'].map((label, i) => {
                const stepNum = i + 1;
                const active = step === stepNum;
                const completed = step > stepNum;
                return (
                  <div
                    key={i}
                    onClick={() => completed && setStep(stepNum)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      cursor: completed ? 'pointer' : 'default',
                      opacity: active || completed ? 1 : 0.4,
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      color: active ? 'var(--accent)' : (completed ? '#34d399' : 'var(--text-muted)'),
                    }}
                  >
                    <span>{completed ? '✓' : stepNum + '.'}</span>
                    <span>{label.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                );
              })}
            </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="notion-card">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🏢</span> Company Profile
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label>Company Name *</label>
                <input className="input" placeholder="e.g., Acme Robotics" value={form.companyName}
                  onChange={e => set('companyName', e.target.value)} />
              </div>
              <div>
                <label>Industry / Vertical *</label>
                <input className="input" placeholder="e.g., AI / B2B SaaS" value={form.industry}
                  onChange={e => set('industry', e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Product & Problem Statement *</label>
              <textarea className="input" rows={3}
                placeholder="What problem are you solving? Describe your product and core value proposition..."
                value={form.productDescription}
                onChange={e => set('productDescription', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Founding Team (optional)</label>
              <input className="input" placeholder="CEO: Jane Doe (ex-Stripe), CTO: John Smith (MIT)"
                value={form.teamMembers}
                onChange={e => set('teamMembers', e.target.value)} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Company Logo (optional)</label>
              <div style={{
                border: '1px dashed var(--border)', borderRadius: 8, padding: '16px',
                textAlign: 'center', cursor: 'pointer',
                background: logoFile ? 'rgba(99,102,241,0.05)' : 'var(--bg-sidebar)',
                transition: 'all 0.15s ease',
              }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setLogoFile(f); }}
              >
                <input type="file" accept="image/*" id="logo-input" style={{ display: 'none' }}
                  onChange={e => setLogoFile(e.target.files[0])} />
                <label htmlFor="logo-input" style={{ cursor: 'pointer', color: 'var(--text-muted)', margin: 0 }}>
                  {logoFile ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>✓ {logoFile.name}</span>
                  ) : (
                    <span>Drop logo here or <span style={{ color: 'var(--accent)' }}>browse file</span></span>
                  )}
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!required1}>
                Next: Market & Goals →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="notion-card">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎯</span> Market, Traction & Funding
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label>Target Audience / TAM *</label>
                <input className="input" placeholder="e.g., Mid-market healthcare providers ($40B TAM)"
                  value={form.targetMarket}
                  onChange={e => set('targetMarket', e.target.value)} />
              </div>
              <div>
                <label>Funding Goal *</label>
                <input className="input" placeholder="e.g., $1.5M Seed Round"
                  value={form.fundingGoal}
                  onChange={e => set('fundingGoal', e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Key Milestones & Metrics *</label>
              <textarea className="input" rows={3}
                placeholder="e.g., $40k MRR, 120 paid accounts, 35% MoM user growth..."
                value={form.keyAchievements}
                onChange={e => set('keyAchievements', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Slide Count ({form.numSlides} slides)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input type="range" min="8" max="25" value={form.numSlides}
                  onChange={e => set('numSlides', parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent)' }} />
                <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16, width: 30, textAlign: 'right' }}>
                  {form.numSlides}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} disabled={!required2}>
                Next: Theme & Background →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="notion-card">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎨</span> Theme & Pre-Saved Background
            </h2>

            {/* Visual Style Selection */}
            <div style={{ marginBottom: 24 }}>
              <label>Visual Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {STYLES.map(s => (
                  <div
                    key={s.id}
                    onClick={() => set('style', s.id)}
                    style={{
                      border: form.style === s.id ? `2px solid ${s.color}` : '1px solid var(--border)',
                      borderRadius: 8, padding: '14px 12px', cursor: 'pointer',
                      background: form.style === s.id ? `${s.color}15` : 'var(--bg-sidebar)',
                      textAlign: 'center', transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: 24, color: s.color, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                    <div style={{ color: 'var(--text-subtle)', fontSize: 11, marginTop: 2 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-Saved Slide Background Preset Selector */}
            <div style={{ marginBottom: 24 }}>
              <label>Pre-Saved Slide Background</label>
              <div
                onClick={() => setShowBgPicker(true)}
                style={{
                  border: '1px solid var(--border)', borderRadius: 8, padding: 14,
                  background: activeBg.style.background,
                  backgroundImage: activeBg.style.backgroundImage,
                  backgroundSize: activeBg.style.backgroundSize || 'cover',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 6,
                    background: activeBg.previewGradient,
                    border: `1px solid ${activeBg.style.border}`,
                  }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: activeBg.style.color }}>
                      {activeBg.name}
                    </div>
                    <div style={{ fontSize: 11, color: activeBg.style.color, opacity: 0.8 }}>
                      {activeBg.description}
                    </div>
                  </div>
                </div>
                <span className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>
                  Change Background
                </span>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '14px 18px', marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', uppercase: 'true', marginBottom: 8 }}>
                SUMMARY
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Company:</span> {form.companyName}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Industry:</span> {form.industry}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Slides:</span> {form.numSlides}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Background:</span> {activeBg.name}</div>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 18,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(2)} disabled={loading}>← Back</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px' }}>
                {loading ? (
                  <>
                    <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    Generating Deck...
                  </>
                ) : (
                  '🚀 Generate Pitch Deck'
                )}
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Pre-saved Background Picker Modal */}
      {showBgPicker && (
        <BackgroundPicker
          selectedId={form.backgroundPreset}
          onSelect={id => set('backgroundPreset', id)}
          onClose={() => setShowBgPicker(false)}
        />
      )}
    </NotionLayout>
  );
}
