// pages/deck/[deckId].jsx - Ultra-Modern Pitch Deck Creator & Visual Studio Canvas
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import NotionLayout from '../../components/NotionLayout';
import BackgroundPicker from '../../components/BackgroundPicker';
import FigmaTypographyToolbar from '../../components/FigmaTypographyToolbar';
import { getBackgroundPreset } from '../../utils/backgrounds';
import api from '../../utils/api';

const ChartComponent = dynamic(() => import('../../components/ChartComponent'), { ssr: false });

const SLIDE_TYPES = [
  { id: 'title', label: 'Title / Hero' },
  { id: 'problem', label: 'Problem Statement' },
  { id: 'solution', label: 'Solution' },
  { id: 'product_demo', label: 'Product & Tech' },
  { id: 'market_size', label: 'Market Size (TAM)' },
  { id: 'business_model', label: 'Business Model' },
  { id: 'traction', label: 'Traction & ARR' },
  { id: 'competitive_landscape', label: 'Competitive Analysis' },
  { id: 'go_to_market', label: 'Go-To-Market' },
  { id: 'team', label: 'Team & Advisors' },
  { id: 'financials', label: 'Financial Projections' },
  { id: 'funding_ask', label: 'Investment Ask' },
  { id: 'roadmap', label: 'Product Roadmap' },
  { id: 'testimonials', label: 'Case Studies' },
  { id: 'risk_mitigation', label: 'Risk Mitigation' },
  { id: 'closing', label: 'Closing / Contact' },
];

export default function DeckEditor() {
  const router = useRouter();
  const { deckId } = router.query;
  const [deck, setDeck] = useState(null);
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [progress, setProgress] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [logs, setLogs] = useState([]);
  const [exportName, setExportName] = useState('');
  const [currentBgId, setCurrentBgId] = useState('dark-obsidian');
  const [exporting, setExporting] = useState(false);
  const [savingStatus, setSavingStatus] = useState('saved'); // 'saved' | 'saving' | 'error'
  const [visualTheme, setVisualTheme] = useState({});

  // Slide Reordering Drag State
  const [draggedSlideIdx, setDraggedSlideIdx] = useState(null);
  // Right Click Context Menu State
  const [contextMenu, setContextMenu] = useState(null);

  // Active Selected Canvas Block
  const [selectedBlock, setSelectedBlock] = useState('title');

  // Local Editable State for Current Active Slide
  const [slideContent, setSlideContent] = useState({});
  const [slideChartData, setSlideChartData] = useState(null);
  const [slideType, setSlideType] = useState('title');
  const [slideLayout, setSlideLayout] = useState('single_column');

  // Drag-and-Drop Active Tracking State for Canvas Elements
  const [activeDrag, setActiveDrag] = useState(null);

  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!deckId) return;
    loadDeck();
  }, [deckId]);

  useEffect(() => () => {
    clearInterval(pollRef.current);
    clearTimeout(saveTimerRef.current);
    wsRef.current?.close();
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Update local editable buffers whenever selected slide changes
  useEffect(() => {
    const current = slides[selectedSlide];
    if (current) {
      const parsedContent = safeParseJSON(current.content, {});
      const parsedChart = safeParseJSON(current.chart_data, null);
      setSlideContent(parsedContent);
      setSlideChartData(parsedChart);
      setSlideType(current.slide_type || 'title');
      setSlideLayout(current.layout || 'single_column');
      setSavingStatus('saved');
    }
  }, [selectedSlide, slides]);

  async function loadDeck() {
    try {
      const data = await api.getDeck(deckId);
      setDeck(data);
      setSlides(data.slides || []);
      setExportName(data.name ? data.name.replace(/\s+/g, '_') : 'Pitch_Deck');

      const inputData = safeParseJSON(data.input_data, {});
      if (inputData?.globalTheme) {
        setVisualTheme(inputData.globalTheme);
      }
      if (inputData?.backgroundPreset) {
        setCurrentBgId(inputData.backgroundPreset);
      }

      if (data.status === 'generating' || data.status === 'queued') {
        startPolling();
        connectWebSocket();
      }
    } catch (err) {
      console.error('Failed to load deck:', err);
      router.push('/dashboard');
    }
  }

  function safeParseJSON(val, fallback = null) {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
  }

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.getDeck(deckId);
        setDeck(data);
        setSlides(data.slides || []);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setProgress(null);
        }
      } catch (err) {
        console.warn('Polling error:', err);
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 2000);
  }

  function connectWebSocket() {
    if (wsRef.current) wsRef.current.close();
    const token = localStorage.getItem('deao_token');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    const ws = new WebSocket(`${wsUrl}/ws?token=${token}&deckId=${deckId}`);

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'progress') setProgress(msg);
        if (msg.type === 'user_joined') setActiveUsers(u => [...u, { id: msg.userId, name: msg.name }]);
        if (msg.type === 'user_left') setActiveUsers(u => u.filter(x => x.id !== msg.userId));
        if (msg.type === 'slide_edit') {
          setSlides(s => s.map(sl => sl.id === msg.slideId ? { ...sl, content: msg.content } : sl));
        }
      } catch {}
    };

    wsRef.current = ws;
  }

  // ─── Auto-Save Slide Changes ──────────────────────────────────────────────────
  const persistSlide = useCallback(async (updatedContent, updatedChart, updatedType, updatedLayout) => {
    const current = slides[selectedSlide];
    if (!current || !current.id) return;

    setSavingStatus('saving');
    try {
      const savedSlide = await api.updateSlide(deckId, current.id, {
        content: updatedContent,
        chartData: updatedChart,
        slide_type: updatedType,
        layout: updatedLayout,
      });

      setSlides(prev => prev.map((s, idx) => idx === selectedSlide ? savedSlide : s));
      setSavingStatus('saved');

      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.send(JSON.stringify({
          type: 'slide_edit',
          slideId: current.id,
          content: updatedContent,
        }));
      }
    } catch (err) {
      console.error('Failed to save slide:', err);
      setSavingStatus('error');
    }
  }, [deckId, selectedSlide, slides]);

  function triggerSave(newContent, newChart = slideChartData, newType = slideType, newLayout = slideLayout) {
    setSlideContent(newContent);
    setSlideChartData(newChart);
    setSlideType(newType);
    setSlideLayout(newLayout);
    setSavingStatus('saving');

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistSlide(newContent, newChart, newType, newLayout);
    }, 600);
  }

  // Helper mutations for content & positions
  const updateTitle = (val) => {
    const updated = { ...slideContent, title: val, headline: val };
    triggerSave(updated);
  };

  const updateSubtitle = (val) => {
    const updated = { ...slideContent, subtitle: val, subheadline: val };
    triggerSave(updated);
  };

  const updateCallout = (val) => {
    const updated = { ...slideContent, callout: val };
    triggerSave(updated);
  };

  const updateBullet = (idx, val) => {
    const bullets = [...(slideContent.bullets || [])];
    bullets[idx] = val;
    triggerSave({ ...slideContent, bullets });
  };

  const addBullet = () => {
    const bullets = [...(slideContent.bullets || []), 'New key takeaway or metric point'];
    triggerSave({ ...slideContent, bullets });
  };

  const deleteBullet = (idx) => {
    const bullets = (slideContent.bullets || []).filter((_, i) => i !== idx);
    triggerSave({ ...slideContent, bullets });
  };

  const updateMember = (idx, field, val) => {
    const members = [...(slideContent.members || [])];
    members[idx] = { ...members[idx], [field]: val };
    triggerSave({ ...slideContent, members });
  };

  const addMember = () => {
    const members = [...(slideContent.members || []), { name: 'Team Leader', role: 'VP of Growth', bio: 'Ex-Stripe, 10+ years experience' }];
    triggerSave({ ...slideContent, members });
  };

  const deleteMember = (idx) => {
    const members = (slideContent.members || []).filter((_, i) => i !== idx);
    triggerSave({ ...slideContent, members });
  };

  // ─── Custom Widgets Management ──────────────────────────────────────────────
  const addWidget = (type) => {
    const widgets = [...(slideContent.widgets || [])];
    let newWidget = { id: `w_${Date.now()}`, type, x: 0, y: 0 };

    if (type === 'stat_card') {
      newWidget = { ...newWidget, value: '$10M+', label: 'Annual Recurring Revenue' };
    } else if (type === 'text_box') {
      newWidget = { ...newWidget, title: 'Custom Highlight Box', body: 'Add additional detailed notes, metrics, or custom container text here.' };
    } else if (type === 'callout_box') {
      newWidget = { ...newWidget, text: 'Custom Key Insight or Value Proposition Callout' };
    } else if (type === 'bordered_container') {
      newWidget = { ...newWidget, title: 'Bordered Container', content: 'Container block with custom border and fill' };
    }

    widgets.push(newWidget);
    triggerSave({ ...slideContent, widgets });
  };

  const updateWidget = (id, field, val) => {
    const widgets = (slideContent.widgets || []).map(w => w.id === id ? { ...w, [field]: val } : w);
    triggerSave({ ...slideContent, widgets });
  };

  const deleteWidget = (id) => {
    const widgets = (slideContent.widgets || []).filter(w => w.id !== id);
    triggerSave({ ...slideContent, widgets });
  };

  // ─── Mouse Drag-and-Drop Handler for Canvas Elements ────────────────────────
  const handleDragStart = (e, itemKey) => {
    e.stopPropagation();
    setActiveDrag(itemKey);
    setSelectedBlock(itemKey);
    const positions = slideContent.positions || {};
    const currentPos = positions[itemKey] || { x: 0, y: 0 };
    const startMouse = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startMouse.x;
      const deltaY = moveEvent.clientY - startMouse.y;
      const updatedPositions = {
        ...(slideContent.positions || {}),
        [itemKey]: { x: currentPos.x + deltaX, y: currentPos.y + deltaY },
      };
      setSlideContent(prev => ({ ...prev, positions: updatedPositions }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setActiveDrag(null);
      setSlideContent(latest => {
        triggerSave(latest);
        return latest;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Slide Reordering Drag & Drop Handlers ──────────────────────────────────
  const handleSlideDragStart = (e, idx) => {
    setDraggedSlideIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlideDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleSlideDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedSlideIdx === null || draggedSlideIdx === targetIdx) return;

    const reordered = [...slides];
    const [removed] = reordered.splice(draggedSlideIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    setSlides(reordered);
    setSelectedSlide(targetIdx);
    setDraggedSlideIdx(null);

    try {
      const orderedIds = reordered.map(s => s.id);
      await api.reorderSlides(deckId, orderedIds);
    } catch (err) {
      console.error('Failed to save slide order:', err);
    }
  };

  // ─── Right Click Context Menu Handlers ─────────────────────────────────────
  const handleContextMenu = (e, idx, slideId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      slideIdx: idx,
      slideId: slideId,
    });
  };

  const handleContextDuplicate = async () => {
    if (!contextMenu) return;
    const targetId = contextMenu.slideId;
    const targetIdx = contextMenu.slideIdx;
    setContextMenu(null);
    try {
      const duplicated = await api.duplicateSlide(deckId, targetId);
      setSlides(prev => {
        const next = [...prev];
        next.splice(targetIdx + 1, 0, duplicated);
        return next;
      });
      setSelectedSlide(targetIdx + 1);
    } catch (err) {
      alert(`Failed to duplicate slide: ${err.message}`);
    }
  };

  const handleContextMove = async (direction) => {
    if (!contextMenu) return;
    const fromIdx = contextMenu.slideIdx;
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    setContextMenu(null);
    if (toIdx < 0 || toIdx >= slides.length) return;

    const reordered = [...slides];
    const [removed] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, removed);

    setSlides(reordered);
    setSelectedSlide(toIdx);

    try {
      await api.reorderSlides(deckId, reordered.map(s => s.id));
    } catch (err) {
      console.error('Failed to move slide:', err);
    }
  };

  const handleContextDelete = async () => {
    if (!contextMenu) return;
    const targetIdx = contextMenu.slideIdx;
    const targetId = contextMenu.slideId;
    setContextMenu(null);

    if (slides.length <= 1) {
      alert('Deck must contain at least one slide');
      return;
    }
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      await api.deleteSlide(deckId, targetId);
      setSlides(prev => prev.filter((_, idx) => idx !== targetIdx));
      setSelectedSlide(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(`Failed to delete slide: ${err.message}`);
    }
  };

  async function handleAddSlide() {
    try {
      const newSlide = await api.addSlide(deckId, {
        slide_type: 'solution',
        title: 'New Custom Slide',
        subtitle: 'Add key details and metrics to personalize this slide',
      });
      setSlides(prev => [...prev, newSlide]);
      setSelectedSlide(slides.length);
    } catch (err) {
      alert(`Failed to add slide: ${err.message}`);
    }
  }

  async function handleDuplicateSlide() {
    const current = slides[selectedSlide];
    if (!current || !current.id) return;
    try {
      const duplicated = await api.duplicateSlide(deckId, current.id);
      setSlides(prev => {
        const next = [...prev];
        next.splice(selectedSlide + 1, 0, duplicated);
        return next;
      });
      setSelectedSlide(selectedSlide + 1);
    } catch (err) {
      alert(`Failed to duplicate slide: ${err.message}`);
    }
  }

  async function handleSaveGlobalTheme(globalThemeObj) {
    try {
      const updatedDeck = await api.updateDeckTheme(deckId, globalThemeObj);
      setDeck(updatedDeck);
      setVisualTheme(globalThemeObj);
    } catch (err) {
      alert(`Failed to save global theme: ${err.message}`);
    }
  }

  async function handleDeleteSlide() {
    if (slides.length <= 1) {
      alert('Deck must contain at least one slide');
      return;
    }
    const current = slides[selectedSlide];
    if (!confirm('Are you sure you want to delete this slide?')) return;
    try {
      await api.deleteSlide(deckId, current.id);
      setSlides(prev => prev.filter((_, idx) => idx !== selectedSlide));
      setSelectedSlide(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(`Failed to delete slide: ${err.message}`);
    }
  }

  async function loadVersions() {
    try {
      const v = await api.getVersions(deckId);
      setVersions(v);
      setShowVersions(true);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  }

  async function restoreVersion(versionId) {
    if (!confirm('Restore this version? Current slides will be replaced.')) return;
    try {
      await api.restoreVersion(deckId, versionId);
      setSelectedSlide(0);
      await loadDeck();
      setShowVersions(false);
    } catch (err) {
      alert(`Failed to restore version: ${err.message}`);
    }
  }

  async function loadLogs() {
    try {
      const l = await api.getLogs(deckId);
      setLogs(l);
      setShowLogs(true);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }

  async function handleExport(format) {
    setExporting(true);
    try {
      const blob = await api.exportDeck(deckId, format, exportName || undefined);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${exportName || 'deck'}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  }

  const currentSlide = slides[selectedSlide];
  const bgPreset = getBackgroundPreset(currentBgId);
  const slideTitleVal = slideContent.title || slideContent.headline || slideContent.name || '';
  const slideSubtitleVal = slideContent.subtitle || slideContent.subheadline || slideContent.description || '';
  const positions = slideContent.positions || {};

  if (!deck) return (
    <NotionLayout activeTab="dashboard" title="Loading Canvas...">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    </NotionLayout>
  );

  return (
    <NotionLayout activeTab="dashboard" title={deck.name}>
      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Navigation Bar */}
        <div style={{
          height: 52, padding: '0 20px', background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)', letterSpacing: '0.02em' }}>{deck.name}</span>
            <span className={`badge badge-${deck.status}`}>{deck.status}</span>

            {/* Save Status */}
            <span style={{ fontSize: 11, fontWeight: 600, color: savingStatus === 'saving' ? '#eab308' : (savingStatus === 'error' ? '#f43f5e' : '#10b981') }}>
              {savingStatus === 'saving' ? 'Saving...' : (savingStatus === 'error' ? 'Save Error' : '[Saved]')}
            </span>

            {/* Active User Avatars */}
            {activeUsers.map(u => (
              <div key={u.id} title={u.name} style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>
                {u.name[0]}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Inspector Toggle Button */}
            <button
              className="btn-secondary"
              onClick={() => setShowInspector(!showInspector)}
              style={{
                fontSize: 12, padding: '5px 12px', fontWeight: 700,
                background: showInspector ? 'var(--accent)' : 'transparent',
                color: showInspector ? '#ffffff' : 'var(--text)',
              }}
            >
              Figma Inspector Panel {showInspector ? '[ON]' : '[OFF]'}
            </button>

            {/* Background Picker */}
            <button
              className="btn-secondary"
              onClick={() => setShowBgPicker(true)}
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              Theme: {bgPreset.name}
            </button>

            {/* Export Buttons */}
            {deck.status === 'completed' && (
              <>
                <input
                  className="input"
                  style={{ width: 140, padding: '5px 10px', fontSize: 12 }}
                  placeholder="Filename..."
                  value={exportName}
                  onChange={e => setExportName(e.target.value)}
                />
                <button
                  className="btn-secondary"
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  Export PDF
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleExport('pptx')}
                  disabled={exporting}
                  style={{ fontSize: 12, padding: '5px 12px' }}
                >
                  Export PPTX
                </button>
              </>
            )}

            <button className="btn-secondary" onClick={loadVersions} style={{ fontSize: 12, padding: '5px 12px' }}>
              Versions
            </button>
            <button className="btn-secondary" onClick={loadLogs} style={{ fontSize: 12, padding: '5px 12px' }}>
              Logs
            </button>
          </div>
        </div>

        {/* Editor Main Stage (3-Column Layout: Left Outline, Center Canvas, Right Popover Inspector) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel: Slide Deck Outline Thumbnails */}
          <div style={{
            width: 240, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
            overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                SLIDE DECK ({slides.length})
              </span>
              <button
                onClick={handleAddSlide}
                style={{
                  background: 'var(--accent)', color: 'white', border: 'none',
                  borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                + Slide
              </button>
            </div>

            {slides.map((s, idx) => {
              const sContent = safeParseJSON(s.content, {});
              const isSelected = selectedSlide === idx;
              const sTitle = sContent?.title || sContent?.headline || `Slide ${idx + 1}`;
              const sSubtitle = sContent?.subtitle || sContent?.subheadline || '';

              return (
                <div
                  key={s.id || idx}
                  draggable={true}
                  onDragStart={e => handleSlideDragStart(e, idx)}
                  onDragOver={e => handleSlideDragOver(e, idx)}
                  onDrop={e => handleSlideDrop(e, idx)}
                  onContextMenu={e => handleContextMenu(e, idx, s.id)}
                  onClick={() => setSelectedSlide(idx)}
                  style={{
                    background: visualTheme.bgColor || bgPreset.style.background,
                    backgroundImage: visualTheme.bgColor ? 'none' : bgPreset.style.backgroundImage,
                    backgroundSize: bgPreset.style.backgroundSize || 'cover',
                    padding: 10, borderRadius: 8, cursor: 'grab',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    border: isSelected ? '2px solid var(--accent)' : `1px solid ${bgPreset.style.border}`,
                    boxShadow: isSelected ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                    opacity: draggedSlideIdx === idx ? 0.4 : 1,
                    transition: 'all 0.15s ease', position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                    background: visualTheme.accentColor || bgPreset.style.accent,
                    borderTopLeftRadius: 8, borderBottomLeftRadius: 8,
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: visualTheme.titleColor || bgPreset.style.color, paddingLeft: 6 }}>
                    <span style={{ fontWeight: 700 }}>Slide {idx + 1}</span>
                    <span style={{ textTransform: 'capitalize', opacity: 0.8 }}>{s.slide_type?.replace(/_/g, ' ')}</span>
                  </div>

                  <div style={{
                    fontSize: 11, fontWeight: 700, color: visualTheme.titleColor || bgPreset.style.color,
                    fontFamily: visualTheme.headingFont ? `'${visualTheme.headingFont}', sans-serif` : 'inherit',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 6, paddingLeft: 6,
                  }}>
                    {sTitle}
                  </div>

                  {sSubtitle && (
                    <div style={{
                      fontSize: 10, color: visualTheme.textColor || 'rgba(255,255,255,0.7)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2, paddingLeft: 6, opacity: 0.85,
                    }}>
                      {sSubtitle}
                    </div>
                  )}

                  {sContent.widgets && sContent.widgets.length > 0 && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: visualTheme.accentColor || 'var(--accent)', marginTop: 4, paddingLeft: 6 }}>
                      [{sContent.widgets.length} Widget{sContent.widgets.length > 1 ? 's' : ''}]
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center Stage: Floating Canvas Toolbar & Slide Canvas */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {currentSlide ? (
              <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* Floating Canvas Quick Toolbar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(18, 22, 34, 0.85)', backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px', gap: 12, flexWrap: 'wrap',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>CANVAS TOOLBAR:</span>
                    <button className="btn-secondary" onClick={() => addWidget('stat_card')} style={{ fontSize: 11, padding: '4px 8px' }}>+ Stat Card</button>
                    <button className="btn-secondary" onClick={() => addWidget('text_box')} style={{ fontSize: 11, padding: '4px 8px' }}>+ Text Box</button>
                    <button className="btn-secondary" onClick={() => addWidget('callout_box')} style={{ fontSize: 11, padding: '4px 8px' }}>+ Callout</button>
                    <button className="btn-secondary" onClick={() => addWidget('bordered_container')} style={{ fontSize: 11, padding: '4px 8px' }}>+ Container</button>
                    <button className="btn-secondary" onClick={() => setShowChartModal(true)} style={{ fontSize: 11, padding: '4px 8px' }}>Edit Chart</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <select
                      className="input"
                      style={{ padding: '4px 8px', fontSize: 11, width: 160 }}
                      value={slideType}
                      onChange={e => {
                        setSlideType(e.target.value);
                        triggerSave(slideContent, slideChartData, e.target.value, slideLayout);
                      }}
                    >
                      {SLIDE_TYPES.map(st => (
                        <option key={st.id} value={st.id}>{st.label}</option>
                      ))}
                    </select>

                    <button className="btn-primary" onClick={() => persistSlide(slideContent, slideChartData, slideType, slideLayout)} style={{ fontSize: 11, padding: '4px 12px', fontWeight: 700 }}>
                      Save Slide
                    </button>
                    <button className="btn-secondary" onClick={handleDuplicateSlide} style={{ fontSize: 11, padding: '4px 10px' }}>
                      Duplicate
                    </button>
                    <button onClick={handleDeleteSlide} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 6, fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Active Slide Presentation Canvas */}
                <div style={{
                  width: '100%', minHeight: 490,
                  background: visualTheme.bgColor || bgPreset.style.background,
                  backgroundImage: visualTheme.bgColor ? 'none' : bgPreset.style.backgroundImage,
                  backgroundSize: bgPreset.style.backgroundSize || 'cover',
                  color: visualTheme.textColor || '#ffffff',
                  fontFamily: visualTheme.bodyFont ? `'${visualTheme.bodyFont}', sans-serif` : 'inherit',
                  borderRadius: visualTheme.borderRadius || '14px',
                  border: visualTheme.borderEnabled !== false
                    ? `${visualTheme.borderWidth || '1px'} ${visualTheme.borderStyle || 'solid'} ${visualTheme.borderColor || bgPreset.style.border}`
                    : 'none',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                  padding: '40px 48px', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', position: 'relative', transition: 'background 0.2s ease',
                }}>
                  {/* Left Accent Bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 6,
                    background: visualTheme.accentColor || bgPreset.style.accent,
                    borderTopLeftRadius: visualTheme.borderRadius || '14px',
                    borderBottomLeftRadius: visualTheme.borderRadius || '14px',
                  }} />

                  {/* Header / Title Group */}
                  <div
                    onClick={() => setSelectedBlock('title_group')}
                    style={{
                      transform: `translate(${positions.title_group?.x || 0}px, ${positions.title_group?.y || 0}px)`,
                      position: 'relative', transition: activeDrag === 'title_group' ? 'none' : 'transform 0.1s ease',
                      border: selectedBlock === 'title_group' ? '1px dashed var(--accent)' : '1px solid transparent',
                      borderRadius: 8, padding: 4,
                    }}
                  >
                    <div
                      onMouseDown={e => handleDragStart(e, 'title_group')}
                      style={{
                        cursor: 'grab', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, display: 'inline-block',
                      }}
                    >
                      ::: DRAG TITLE BLOCK
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4,
                      }}>
                        {slideType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* LIVE EDITABLE TITLE */}
                    <input
                      value={slideTitleVal}
                      onChange={e => updateTitle(e.target.value)}
                      placeholder="Enter Slide Title..."
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: '2px dashed rgba(255,255,255,0.2)',
                        fontSize: slideType === 'title' ? 34 : 26,
                        fontWeight: visualTheme.fontWeight || 800,
                        fontFamily: visualTheme.headingFont ? `'${visualTheme.headingFont}', sans-serif` : 'inherit',
                        letterSpacing: visualTheme.letterSpacing || 'normal',
                        lineHeight: visualTheme.lineHeight || 1.2,
                        textTransform: visualTheme.textTransform || 'none',
                        color: visualTheme.titleColor || '#ffffff',
                        outline: 'none', padding: '4px 0', marginBottom: 12,
                      }}
                    />

                    {/* LIVE EDITABLE SUBTITLE */}
                    <textarea
                      rows={2}
                      value={slideSubtitleVal}
                      onChange={e => updateSubtitle(e.target.value)}
                      placeholder="Enter slide subtitle or core thesis statement..."
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: '1px dashed rgba(255,255,255,0.15)',
                        fontSize: 14,
                        fontFamily: visualTheme.bodyFont ? `'${visualTheme.bodyFont}', sans-serif` : 'inherit',
                        color: visualTheme.textColor || 'rgba(255,255,255,0.85)',
                        outline: 'none', resize: 'vertical', padding: '4px 0', marginBottom: 20,
                        lineHeight: visualTheme.lineHeight || 1.4,
                      }}
                    />
                  </div>

                  {/* Content Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: slideChartData && slideChartData.type !== 'none' ? '1fr 1fr' : '1fr',
                    gap: 24, flex: 1, margin: '16px 0',
                  }}>
                    {/* Left Column: Bullets / Members / Widgets */}
                    <div
                      onClick={() => setSelectedBlock('body_group')}
                      style={{
                        transform: `translate(${positions.body_group?.x || 0}px, ${positions.body_group?.y || 0}px)`,
                        display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
                        border: selectedBlock === 'body_group' ? '1px dashed var(--accent)' : '1px solid transparent',
                        borderRadius: 8, padding: 4,
                      }}
                    >
                      <div
                        onMouseDown={e => handleDragStart(e, 'body_group')}
                        style={{
                          cursor: 'grab', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                          letterSpacing: '0.1em', marginBottom: 2, display: 'inline-block',
                        }}
                      >
                        ::: DRAG CONTENT SECTION
                      </div>

                      {/* Editable Bullets */}
                      {slideContent.bullets && slideContent.bullets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                            BULLET POINTS ({slideContent.bullets.length})
                          </div>
                          {slideContent.bullets.map((b, bi) => (
                            <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: visualTheme.accentColor || bgPreset.style.accent, fontWeight: 800 }}>•</span>
                              <input
                                value={b}
                                onChange={e => updateBullet(bi, e.target.value)}
                                style={{
                                  flex: 1, background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6,
                                  color: visualTheme.textColor || '#ffffff',
                                  fontFamily: visualTheme.bodyFont ? `'${visualTheme.bodyFont}', sans-serif` : 'inherit',
                                  padding: '6px 10px', fontSize: 13, outline: 'none',
                                }}
                              />
                              <button
                                onClick={() => deleteBullet(bi)}
                                title="Delete Bullet"
                                style={{
                                  background: 'transparent', border: 'none', color: '#f43f5e',
                                  cursor: 'pointer', fontSize: 14, padding: '2px 6px',
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={addBullet}
                            style={{
                              alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)',
                              color: '#ffffff', border: '1px dashed rgba(255,255,255,0.3)',
                              borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', marginTop: 4,
                            }}
                          >
                            + Add Bullet Point
                          </button>
                        </div>
                      ) : slideContent.members && slideContent.members.length > 0 ? (
                        /* Editable Team Members */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                            TEAM MEMBERS
                          </div>
                          {slideContent.members.map((m, mi) => (
                            <div key={mi} style={{
                              background: visualTheme.containerBg || 'rgba(255,255,255,0.06)',
                              border: visualTheme.borderEnabled !== false ? `${visualTheme.borderWidth || '1px'} ${visualTheme.borderStyle || 'solid'} ${visualTheme.borderColor || 'rgba(255,255,255,0.15)'}` : 'none',
                              borderRadius: visualTheme.borderRadius || 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6,
                            }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                  value={m.name || ''}
                                  placeholder="Name"
                                  onChange={e => updateMember(mi, 'name', e.target.value)}
                                  style={{
                                    flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: visualTheme.titleColor || '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700,
                                    fontFamily: visualTheme.headingFont ? `'${visualTheme.headingFont}', sans-serif` : 'inherit',
                                  }}
                                />
                                <input
                                  value={m.role || ''}
                                  placeholder="Role"
                                  onChange={e => updateMember(mi, 'role', e.target.value)}
                                  style={{
                                    flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: visualTheme.accentColor || '#38bdf8', padding: '4px 8px', borderRadius: 4, fontSize: 12,
                                  }}
                                />
                                <button onClick={() => deleteMember(mi)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>✕</button>
                              </div>
                              <input
                                value={m.bio || ''}
                                placeholder="Bio & Background"
                                onChange={e => updateMember(mi, 'bio', e.target.value)}
                                style={{
                                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                  color: visualTheme.textColor || 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 11,
                                  fontFamily: visualTheme.bodyFont ? `'${visualTheme.bodyFont}', sans-serif` : 'inherit',
                                }}
                              />
                            </div>
                          ))}
                          <button onClick={addMember} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                            + Add Member
                          </button>
                        </div>
                      ) : null}

                      {/* Editable Callout Box */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
                          CALLOUT BOX (HIGHLIGHT)
                        </div>
                        <input
                          value={slideContent.callout || ''}
                          onChange={e => updateCallout(e.target.value)}
                          placeholder="Add key takeaway, metric callout, or contact info..."
                          style={{
                            width: '100%',
                            background: visualTheme.accentColor ? `${visualTheme.accentColor}22` : 'rgba(14, 165, 233, 0.15)',
                            border: `1px solid ${visualTheme.accentColor ? `${visualTheme.accentColor}66` : 'rgba(14, 165, 233, 0.4)'}`,
                            borderRadius: visualTheme.borderRadius || 8, padding: '8px 12px', fontSize: 12, fontWeight: 600,
                            color: visualTheme.accentColor || '#38bdf8', outline: 'none',
                            fontFamily: visualTheme.bodyFont ? `'${visualTheme.bodyFont}', sans-serif` : 'inherit',
                          }}
                        />
                      </div>

                      {/* Render Custom Draggable Widgets */}
                      {slideContent.widgets && slideContent.widgets.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                          {slideContent.widgets.map((w) => {
                            const pos = positions[w.id] || { x: 0, y: 0 };
                            return (
                              <div
                                key={w.id}
                                style={{
                                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                                  background: visualTheme.containerBg || 'rgba(255,255,255,0.06)',
                                  border: visualTheme.borderEnabled !== false ? `${visualTheme.borderWidth || '1px'} ${visualTheme.borderStyle || 'solid'} ${visualTheme.borderColor || 'rgba(255,255,255,0.2)'}` : 'none',
                                  borderRadius: visualTheme.borderRadius || 8, padding: 12, position: 'relative',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <span onMouseDown={e => handleDragStart(e, w.id)} style={{ cursor: 'grab', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                                    ::: DRAG WIDGET ({w.type.toUpperCase()})
                                  </span>
                                  <button onClick={() => deleteWidget(w.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                </div>

                                {w.type === 'stat_card' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <input
                                      value={w.value || ''}
                                      onChange={e => updateWidget(w.id, 'value', e.target.value)}
                                      placeholder="Stat Value (e.g. $10M+)"
                                      style={{ background: 'transparent', border: 'none', fontSize: 24, fontWeight: 800, color: visualTheme.accentColor || '#38bdf8', outline: 'none' }}
                                    />
                                    <input
                                      value={w.label || ''}
                                      onChange={e => updateWidget(w.id, 'label', e.target.value)}
                                      placeholder="Stat Label"
                                      style={{ background: 'transparent', border: 'none', fontSize: 12, color: visualTheme.textColor || '#fff', outline: 'none' }}
                                    />
                                  </div>
                                )}

                                {w.type === 'text_box' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <input
                                      value={w.title || ''}
                                      onChange={e => updateWidget(w.id, 'title', e.target.value)}
                                      placeholder="Box Header"
                                      style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 700, color: visualTheme.titleColor || '#fff', outline: 'none' }}
                                    />
                                    <textarea
                                      rows={2}
                                      value={w.body || ''}
                                      onChange={e => updateWidget(w.id, 'body', e.target.value)}
                                      placeholder="Box paragraph body..."
                                      style={{ background: 'transparent', border: 'none', fontSize: 12, color: visualTheme.textColor || '#e2e8f0', outline: 'none', resize: 'vertical' }}
                                    />
                                  </div>
                                )}

                                {w.type === 'callout_box' && (
                                  <input
                                    value={w.text || ''}
                                    onChange={e => updateWidget(w.id, 'text', e.target.value)}
                                    placeholder="Callout Highlight text..."
                                    style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 12, fontWeight: 600, color: visualTheme.accentColor || '#38bdf8', outline: 'none' }}
                                  />
                                )}

                                {w.type === 'bordered_container' && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <input
                                      value={w.title || ''}
                                      onChange={e => updateWidget(w.id, 'title', e.target.value)}
                                      placeholder="Container Header"
                                      style={{ background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700, color: visualTheme.titleColor || '#fff', outline: 'none' }}
                                    />
                                    <input
                                      value={w.content || ''}
                                      onChange={e => updateWidget(w.id, 'content', e.target.value)}
                                      placeholder="Container content body"
                                      style={{ background: 'transparent', border: 'none', fontSize: 12, color: visualTheme.textColor || '#fff', outline: 'none' }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Chart (Draggable) */}
                    {slideChartData && slideChartData.type !== 'none' && (
                      <div
                        onClick={() => setSelectedBlock('chart_group')}
                        style={{
                          transform: `translate(${positions.chart_group?.x || 0}px, ${positions.chart_group?.y || 0}px)`,
                          background: 'rgba(0,0,0,0.4)',
                          border: selectedBlock === 'chart_group' ? '1px dashed var(--accent)' : (visualTheme.borderEnabled !== false ? `${visualTheme.borderWidth || '1px'} ${visualTheme.borderStyle || 'solid'} ${visualTheme.borderColor || 'rgba(255,255,255,0.15)'}` : 'none'),
                          borderRadius: visualTheme.borderRadius || 10, padding: 16, height: 240, display: 'flex', flexDirection: 'column', position: 'relative',
                        }}
                      >
                        <div onMouseDown={e => handleDragStart(e, 'chart_group')} style={{ cursor: 'grab', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                          ::: DRAG CHART
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: visualTheme.accentColor || '#38bdf8' }}>Chart: {slideChartData.title || 'Performance'}</span>
                          <button className="btn-secondary" onClick={() => setShowChartModal(true)} style={{ fontSize: 10, padding: '2px 6px' }}>Edit Chart</button>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <ChartComponent data={slideChartData} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Canvas Footer */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 11, opacity: 0.6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <span>Deao Studios Deck Editor</span>
                    <span>Slide {selectedSlide + 1} of {slides.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <p>No slides found</p>
              </div>
            )}
          </div>

          {/* Right Panel: Figma Popover Inspector Studio */}
          {showInspector && (
            <FigmaTypographyToolbar
              isSidebar={true}
              currentTheme={visualTheme}
              onChangeTheme={theme => setVisualTheme(theme)}
              onSaveGlobalTheme={handleSaveGlobalTheme}
              onClose={() => setShowInspector(false)}
            />
          )}
        </div>
      </div>

      {/* Floating Context Menu for Slide Thumbnails */}
      {contextMenu && (
        <div style={{
          position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 2000,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 0', width: 170,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }} onClick={e => e.stopPropagation()}>
          <button
            onClick={handleContextDuplicate}
            style={{
              width: '100%', textAlign: 'left', padding: '6px 14px', background: 'transparent',
              border: 'none', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Duplicate Slide
          </button>

          <button
            onClick={() => handleContextMove('up')}
            disabled={contextMenu.slideIdx === 0}
            style={{
              width: '100%', textAlign: 'left', padding: '6px 14px', background: 'transparent',
              border: 'none', color: contextMenu.slideIdx === 0 ? 'var(--text-subtle)' : 'var(--text)',
              fontSize: 12, cursor: contextMenu.slideIdx === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => contextMenu.slideIdx !== 0 && (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Move Slide Up
          </button>

          <button
            onClick={() => handleContextMove('down')}
            disabled={contextMenu.slideIdx === slides.length - 1}
            style={{
              width: '100%', textAlign: 'left', padding: '6px 14px', background: 'transparent',
              border: 'none', color: contextMenu.slideIdx === slides.length - 1 ? 'var(--text-subtle)' : 'var(--text)',
              fontSize: 12, cursor: contextMenu.slideIdx === slides.length - 1 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => contextMenu.slideIdx !== slides.length - 1 && (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Move Slide Down
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          <button
            onClick={handleContextDelete}
            style={{
              width: '100%', textAlign: 'left', padding: '6px 14px', background: 'transparent',
              border: 'none', color: '#f43f5e', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Delete Slide
          </button>
        </div>
      )}

      {/* Chart Editor Modal */}
      {showChartModal && (
        <Modal title="Edit Slide Chart Data" onClose={() => setShowChartModal(false)} wide>
          <ChartEditorDrawer
            chartData={slideChartData}
            onSave={(newChart) => {
              setSlideChartData(newChart);
              triggerSave(slideContent, newChart, slideType, slideLayout);
              setShowChartModal(false);
            }}
          />
        </Modal>
      )}

      {/* Background Theme Picker Modal */}
      {showBgPicker && (
        <BackgroundPicker
          selectedId={currentBgId}
          onSelect={id => setCurrentBgId(id)}
          onClose={() => setShowBgPicker(false)}
        />
      )}

      {/* Versions Modal */}
      {showVersions && (
        <Modal title="Revision History" onClose={() => setShowVersions(false)}>
          {versions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No saved versions yet</p>
          ) : versions.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Version {v.version_num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{new Date(v.created_at).toLocaleString()}</div>
              </div>
              <button className="btn-secondary" onClick={() => restoreVersion(v.id)} style={{ padding: '4px 10px', fontSize: 12 }}>Restore</button>
            </div>
          ))}
        </Modal>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <Modal title="AI Decision Logs" onClose={() => setShowLogs(false)} wide>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {logs.slice(0, 30).map(log => (
              <div key={log.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
                  <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{log.ai_model}</span>
                  <span style={{ color: 'var(--text)' }}>{log.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </NotionLayout>
  );
}

// ─── Interactive Chart Data Editor Component ──────────────────────────────────
function ChartEditorDrawer({ chartData, onSave }) {
  const existing = chartData || {};
  const [type, setType] = useState(existing.type || 'bar');
  const [title, setTitle] = useState(existing.title || 'Quarterly Performance');
  const [labelsStr, setLabelsStr] = useState((existing.labels || ['Q1', 'Q2', 'Q3', 'Q4']).join(', '));
  const [dataStr, setDataStr] = useState((existing.datasets?.[0]?.data || [20, 45, 80, 120]).join(', '));

  function handleSaveChart() {
    const labels = labelsStr.split(',').map(s => s.trim()).filter(Boolean);
    const dataNums = dataStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

    if (type === 'none') {
      onSave(null);
      return;
    }

    const newChart = {
      type,
      title,
      labels,
      datasets: [
        {
          label: title,
          data: dataNums,
          backgroundColor: ['#0ea5e9', '#6366f1', '#a855f7', '#10b981', '#f43f5e'],
          borderColor: '#0ea5e9',
        }
      ]
    };

    onSave(newChart);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label>Chart Type</label>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="doughnut">Doughnut / Pie Chart</option>
          <option value="none">No Chart (Remove)</option>
        </select>
      </div>

      {type !== 'none' && (
        <>
          <div>
            <label>Chart Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ARR Growth ($K)" />
          </div>

          <div>
            <label>Labels (comma-separated)</label>
            <input className="input" value={labelsStr} onChange={e => setLabelsStr(e.target.value)} placeholder="Q1, Q2, Q3, Q4" />
          </div>

          <div>
            <label>Values (comma-separated numbers)</label>
            <input className="input" value={dataStr} onChange={e => setDataStr(e.target.value)} placeholder="100, 250, 400, 650" />
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
        <button className="btn-primary" onClick={handleSaveChart}>
          Save Chart Data
        </button>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '24px', width: '100%',
        maxWidth: wide ? 680 : 440, margin: '20px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
