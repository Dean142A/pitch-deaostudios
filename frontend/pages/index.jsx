// pages/index.jsx - Linear Obsidian Styled Pitch Deck Creator
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NotionLayout from '../components/NotionLayout';
import BackgroundPicker from '../components/BackgroundPicker';
import TemplateGallery from '../components/TemplateGallery';
import { getBackgroundPreset } from '../utils/backgrounds';
import api from '../utils/api';

const STYLES = [
  { id: 'modern-tech', label: 'Modern Tech', desc: 'Dark obsidian slate with indigo highlights', color: '#5e6ad2' },
  { id: 'corporate', label: 'Corporate Executive', desc: 'Clean high-contrast dark steel theme', color: '#38bdf8' },
  { id: 'creative', label: 'Creative Studio', desc: 'Bold typography with rose accents', color: '#f43f5e' },
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
      <div style={{ maxWidth: creationMode === 'templates' ? 1160 : 820, margin: '0 auto', padding: '40px 24px', transition: 'max-width 0.3s ease' }}>
        
        {/* Banner Callout Header */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}>
              AI Generator Engine v2.0
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Create High-Converting Pitch Decks
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, maxWidth: 620, lineHeight: 1.5 }}>
              Choose from pre-built ready-made templates to edit visually, or generate a tailored investor deck with AI.
            </p>
          </div>
        </div>

        {/* Top Creation Mode Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          background: 'var(--bg-sidebar)',
          borderRadius: 'var(--radius-pill)',
          padding: 4,
          marginBottom: 36,
        }}>
          <button
            onClick={() => setCreationMode('templates')}
            style={{
              background: creationMode === 'templates' ? 'var(--brand)' : 'transparent',
              color: creationMode === 'templates' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Ready-Made Templates</span>
          </button>

          <button
            onClick={() => setCreationMode('ai')}
            style={{
              background: creationMode === 'ai' ? 'var(--brand)' : 'transparent',
              color: creationMode === 'ai' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Generate with AI Prompt</span>
          </button>
        </div>

        {/* Mode 1: Ready-Made Templates Gallery */}
        {creationMode === 'templates' && (
          <TemplateGallery />
        )}

        {/* Mode 2: AI Wizard */}
        {creationMode === 'ai' && (
          <>
            {/* Wizard Steps Navigation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              marginBottom: 28,
            }}>
              {[
                { stepNum: 1, title: 'Company Profile', desc: 'Identity & product details' },
                { stepNum: 2, title: 'Market & Traction', desc: 'Target TAM & financial goals' },
                { stepNum: 3, title: 'Theme & Style', desc: 'Colors & preset background' },
              ].map((s) => {
                const active = step === s.stepNum;
                const completed = step > s.stepNum;
                return (
                  <div
                    key={s.stepNum}
                    onClick={() => completed && setStep(s.stepNum)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: completed ? 'pointer' : 'default',
                      background: active ? 'var(--bg-tertiary)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: completed ? 'var(--brand)' : (active ? 'var(--brand)' : 'var(--bg-sidebar)'),
                      color: '#ffffff',
                      fontWeight: 400,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {completed ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : s.stepNum}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--text)' : 'var(--text-subtle)' }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="notion-card" style={{ padding: '28px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
                  Company Profile & Vision
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Company Name *</label>
                    <input className="input" placeholder="e.g., Acme Autonomous AI" value={form.companyName}
                      onChange={e => set('companyName', e.target.value)} />
                  </div>
                  <div>
                    <label>Industry / Vertical *</label>
                    <input className="input" placeholder="e.g., Enterprise B2B SaaS" value={form.industry}
                      onChange={e => set('industry', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label>Product & Core Problem Statement *</label>
                  <textarea className="input" rows={3}
                    placeholder="Describe what problem you are solving, core product capabilities, and unique value proposition..."
                    value={form.productDescription}
                    onChange={e => set('productDescription', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label>Founding Team (optional)</label>
                  <input className="input" placeholder="CEO: Alex Rivera (ex-Google), CTO: Sarah Chen (Stanford AI Lab)"
                    value={form.teamMembers}
                    onChange={e => set('teamMembers', e.target.value)} />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label>Company Logo (optional)</label>
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: logoFile ? 'var(--bg-tertiary)' : 'var(--bg-sidebar)',
                    transition: 'all 0.15s ease',
                  }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setLogoFile(f); }}
                  >
                    <input type="file" accept="image/*" id="logo-input" style={{ display: 'none' }}
                      onChange={e => setLogoFile(e.target.files[0])} />
                    <label htmlFor="logo-input" style={{ cursor: 'pointer', color: 'var(--text-muted)', margin: 0 }}>
                      {logoFile ? (
                        <span style={{ color: 'var(--brand)', fontWeight: 400 }}>Attached: {logoFile.name}</span>
                      ) : (
                        <span>Drag & drop logo file here or <span style={{ color: 'var(--brand)', fontWeight: 400 }}>browse device</span></span>
                      )}
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" onClick={() => setStep(2)} disabled={!required1} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                    Next: Market & Goals
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="notion-card" style={{ padding: '28px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
                  Market, Financials & Slide Count
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label>Target Audience / TAM *</label>
                    <input className="input" placeholder="e.g., Mid-market healthcare providers ($45B TAM)"
                      value={form.targetMarket}
                      onChange={e => set('targetMarket', e.target.value)} />
                  </div>
                  <div>
                    <label>Funding Goal *</label>
                    <input className="input" placeholder="e.g., $2.0M Seed Round"
                      value={form.fundingGoal}
                      onChange={e => set('fundingGoal', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label>Key Milestones & Traction Metrics *</label>
                  <textarea className="input" rows={3}
                    placeholder="e.g., $50k MRR, 140 enterprise accounts, 40% MoM growth..."
                    value={form.keyAchievements}
                    onChange={e => set('keyAchievements', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label>Slide Count ({form.numSlides} slides)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <input type="range" min="8" max="25" value={form.numSlides}
                      onChange={e => set('numSlides', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--brand)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15, width: 32, textAlign: 'right' }}>
                      {form.numSlides}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn-secondary" onClick={() => setStep(1)} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>Back</button>
                  <button className="btn-primary" onClick={() => setStep(3)} disabled={!required2} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                    Next: Theme & Background
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="notion-card" style={{ padding: '28px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>
                  Visual Style & Preset Background
                </h2>

                {/* Visual Theme Grid */}
                <div style={{ marginBottom: 24 }}>
                  <label>Visual Theme Palette</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {STYLES.map(s => (
                      <div
                        key={s.id}
                        onClick={() => set('style', s.id)}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          padding: '16px 14px',
                          cursor: 'pointer',
                          background: form.style === s.id ? 'var(--bg-tertiary)' : 'var(--bg-sidebar)',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{s.label}</div>
                        <div style={{ color: 'var(--text-subtle)', fontSize: 11, marginTop: 4 }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Background Preset Selector */}
                <div style={{ marginBottom: 24 }}>
                  <label>Pre-Saved Slide Background Preset</label>
                  <div
                    onClick={() => setShowBgPicker(true)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        background: activeBg.previewGradient || 'var(--bg-tertiary)',
                      }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                          {activeBg.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {activeBg.description}
                        </div>
                      </div>
                    </div>
                    <span className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                      Change Background
                    </span>
                  </div>
                </div>

                {/* Summary Card */}
                <div style={{
                  background: 'var(--bg-sidebar)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  marginBottom: 28,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    Deck Generation Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Company:</span> <strong>{form.companyName}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Industry:</span> <strong>{form.industry}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Slide Count:</span> <strong>{form.numSlides} slides</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Background:</span> <strong>{activeBg.name}</strong></div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    fontSize: 13,
                    marginBottom: 20,
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)} disabled={loading} style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>Back</button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', fontSize: 14, borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                    {loading ? 'Generating Pitch Deck...' : 'Generate Pitch Deck'}
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
