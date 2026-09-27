// frontend/components/TemplateGallery.jsx - Linear Obsidian Ready-Made Template Gallery
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
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Search & Category Filter Toolbar */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
        }}>
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)', padding: '10px 16px', flex: 1, minWidth: 280,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-subtle)' }}>
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
                background: selectedCategory === cat ? 'var(--brand)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {filtered.map(t => {
          const bgPreset = getBackgroundPreset(t.backgroundPreset || 'dark-obsidian');
          const isCreating = creatingId === t.id;

          return (
            <div
              key={t.id}
              className="notion-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Card Preset Background Banner Header */}
              <div style={{
                height: 135,
                background: 'var(--bg-tertiary)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    border: 'none',
                  }}>
                    {t.category}
                  </span>
                  {t.badge && (
                    <span style={{
                      background: 'var(--brand)',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      border: 'none',
                    }}>
                      {t.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                    {t.name}
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
                    {t.numSlides} Pre-Built Slides • Theme: {bgPreset.name}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {t.description}
                </p>

                {/* Tags list */}
                {t.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {t.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'var(--bg-sidebar)',
                        color: 'var(--text-subtle)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 400,
                        border: 'none',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => handleOpenPreview(t.id)}
                    style={{ fontSize: 12, padding: '8px 14px', justifyContent: 'center', borderRadius: 'var(--radius-pill)', fontWeight: 400 }}
                  >
                    Preview Deck
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleUseTemplate(t.id)}
                    disabled={isCreating}
                    style={{ fontSize: 12, padding: '8px 14px', justifyContent: 'center', borderRadius: 'var(--radius-pill)', fontWeight: 400 }}
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
