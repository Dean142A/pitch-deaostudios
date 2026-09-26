// frontend/components/TemplateGallery.jsx - Create UI Ready-Made Template Gallery
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import { getBackgroundPreset } from '../utils/backgrounds';
import TemplatePreviewModal from './TemplatePreviewModal';

const CATEGORIES = [
  'All',
  'SaaS & Software',
  'AI & Tech',
  'Consumer & D2C',
  'Investor Updates',
  'Agency & Proposals',
  'Fintech',
];

export default function TemplateGallery({ onSelectTemplate }) {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [creatingId, setCreatingId] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const list = await api.listTemplates();
      setTemplates(list);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUseTemplate(templateId, customInput = {}) {
    setCreatingId(templateId);
    try {
      const res = await api.useTemplate(templateId, customInput);
      router.push(`/deck/${res.deckId}`);
    } catch (err) {
      alert(`Failed to create deck: ${err.message}`);
      setCreatingId(null);
    }
  }

  async function handleOpenPreview(tId) {
    try {
      const full = await api.getTemplate(tId);
      setPreviewTemplate(full);
    } catch (err) {
      alert(`Failed to fetch template details: ${err.message}`);
    }
  }

  const filtered = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.description.toLowerCase().includes(search.toLowerCase()) ||
                          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Category Pills & Search */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
        }}>
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(14, 18, 27, 0.8)',
            border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', flex: 1, minWidth: 280,
            backdropFilter: 'blur(12px)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-subtle)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Search ready-made templates by keyword or industry..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {templates.length} templates
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--accent-gradient)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: selectedCategory === cat ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: 24,
      }}>
        {filtered.map(t => {
          const bgPreset = getBackgroundPreset(t.backgroundPreset || 'dark-obsidian');
          const isCreating = creatingId === t.id;

          return (
            <div
              key={t.id}
              className="notion-card"
              style={{
                padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Card Preset Background Banner Header */}
              <div style={{
                height: 145,
                background: bgPreset.style.background,
                backgroundImage: bgPreset.style.backgroundImage,
                backgroundSize: bgPreset.style.backgroundSize || 'cover',
                padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    color: '#06b6d4', padding: '4px 12px', borderRadius: 20,
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                  }}>
                    {t.category}
                  </span>
                  {t.badge && (
                    <span style={{
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: '#ffffff', padding: '4px 12px', borderRadius: 20,
                      fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em',
                      boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)',
                    }}>
                      {t.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                    {t.name}
                  </h3>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 500 }}>
                    {t.numSlides} Pre-Built Slides • Theme: {bgPreset.name}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {t.description}
                </p>

                {/* Tags list */}
                {t.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {t.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
                        color: 'var(--text-subtle)', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleOpenPreview(t.id)}
                    style={{ fontSize: 12, padding: '9px 14px', justifyContent: 'center' }}
                  >
                    <span>Preview Deck</span>
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleUseTemplate(t.id)}
                    disabled={isCreating}
                    style={{ fontSize: 12, padding: '9px 14px', justifyContent: 'center', fontWeight: 700 }}
                  >
                    {isCreating ? 'Creating...' : 'Use Template'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Interactive Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={(id, opts) => {
            setPreviewTemplate(null);
            handleUseTemplate(id, opts);
          }}
        />
      )}
    </div>
  );
}

