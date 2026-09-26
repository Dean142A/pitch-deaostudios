// frontend/components/TemplateGallery.jsx
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Category Pills & Search */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 260,
          }}>
            <span style={{ color: 'var(--text-subtle)' }}>🔍</span>
            <input
              className="input"
              style={{ border: 'none', background: 'transparent', padding: 0 }}
              placeholder="Search templates by industry, topic, or keyword..."
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
                background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-card)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: selectedCategory === cat ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whitespace: 'nowrap', transition: 'all 0.15s ease',
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
                padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                justify: 'space-between', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Card Preset Background Banner Header */}
              <div style={{
                height: 140,
                background: bgPreset.style.background,
                backgroundImage: bgPreset.style.backgroundImage,
                backgroundSize: bgPreset.style.backgroundSize || 'cover',
                padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    color: '#38bdf8', padding: '3px 10px', borderRadius: 12,
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {t.category}
                  </span>
                  {t.badge && (
                    <span style={{
                      background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                      color: '#ffffff', padding: '3px 10px', borderRadius: 12,
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {t.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ffffff', dropShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {t.name}
                  </h3>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
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
                        background: 'var(--bg-sidebar)', border: '1px solid var(--border)',
                        color: 'var(--text-subtle)', borderRadius: 4, padding: '2px 8px', fontSize: 11,
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
                    style={{ fontSize: 12, padding: '8px 12px', justifyContent: 'center' }}
                  >
                    👁️ Preview
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => handleUseTemplate(t.id)}
                    disabled={isCreating}
                    style={{ fontSize: 12, padding: '8px 12px', justifyContent: 'center', fontWeight: 700 }}
                  >
                    {isCreating ? 'Creating...' : '🚀 Use Template'}
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
