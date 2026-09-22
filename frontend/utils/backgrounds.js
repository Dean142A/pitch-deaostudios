// utils/backgrounds.js - Pre-Saved Slide Backgrounds Library

export const BACKGROUND_PRESETS = [
  {
    id: 'dark-obsidian',
    name: 'Dark Obsidian',
    description: 'Deep obsidian backdrop with subtle purple glow',
    category: 'Dark',
    previewGradient: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
    style: {
      background: '#090d16',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 119, 198, 0.15), rgba(255, 255, 255, 0))',
      color: '#f3f4f6',
      cardBg: 'rgba(17, 24, 39, 0.7)',
      border: 'rgba(75, 85, 99, 0.4)',
      accent: '#818cf8',
    },
    export: {
      pptxBg: '090d16',
      pptxTitle: '818cf8',
      pptxText: 'f3f4f6',
      pdfBg: '#090d16',
    }
  },
  {
    id: 'minimal-grid',
    name: 'Minimalist Grid',
    description: 'Sleek dark grid pattern inspired by modern developer tools',
    category: 'Technical',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    style: {
      background: '#0f172a',
      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      color: '#f8fafc',
      cardBg: 'rgba(30, 41, 59, 0.8)',
      border: 'rgba(51, 65, 85, 0.6)',
      accent: '#38bdf8',
    },
    export: {
      pptxBg: '0f172a',
      pptxTitle: '38bdf8',
      pptxText: 'f8fafc',
      pdfBg: '#0f172a',
    }
  },
  {
    id: 'aurora-mesh',
    name: 'Aurora Mesh',
    description: 'Vibrant indigo and cyan mesh gradient',
    category: 'Creative',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #065f46 100%)',
    style: {
      background: '#0a0e1a',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.25) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.2) 0px, transparent 50%)',
      color: '#f1f5f9',
      cardBg: 'rgba(15, 23, 42, 0.75)',
      border: 'rgba(99, 102, 241, 0.3)',
      accent: '#6366f1',
    },
    export: {
      pptxBg: '0a0e1a',
      pptxTitle: 'a5b4fc',
      pptxText: 'f1f5f9',
      pdfBg: '#0a0e1a',
    }
  },
  {
    id: 'slate-clean',
    name: 'Clean Slate (Light)',
    description: 'Minimalist crisp light theme inspired by Notion pages',
    category: 'Light',
    previewGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    style: {
      background: '#ffffff',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '16px 16px',
      color: '#0f172a',
      cardBg: '#f8fafc',
      border: '#e2e8f0',
      accent: '#2563eb',
    },
    export: {
      pptxBg: 'ffffff',
      pptxTitle: '1e3a8a',
      pptxText: '0f172a',
      pdfBg: '#ffffff',
    }
  },
  {
    id: 'blueprint-dot',
    name: 'Corporate Blueprint',
    description: 'Professional navy backdrop with fine technical dots',
    category: 'Corporate',
    previewGradient: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)',
    style: {
      background: '#0b192c',
      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      color: '#f1f5f9',
      cardBg: 'rgba(30, 62, 98, 0.5)',
      border: 'rgba(59, 130, 246, 0.3)',
      accent: '#60a5fa',
    },
    export: {
      pptxBg: '0b192c',
      pptxTitle: '60a5fa',
      pptxText: 'f1f5f9',
      pdfBg: '#0b192c',
    }
  },
  {
    id: 'sunset-glass',
    name: 'Sunset Glass',
    description: 'Warm coral and rose dark glassmorphism',
    category: 'Creative',
    previewGradient: 'linear-gradient(135deg, #1c0a18 0%, #4c0519 100%)',
    style: {
      background: '#190614',
      backgroundImage: 'radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.25) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(217, 70, 239, 0.2) 0px, transparent 50%)',
      color: '#fff1f2',
      cardBg: 'rgba(30, 10, 24, 0.75)',
      border: 'rgba(244, 63, 94, 0.3)',
      accent: '#fb7185',
    },
    export: {
      pptxBg: '190614',
      pptxTitle: 'fb7185',
      pptxText: 'fff1f2',
      pdfBg: '#190614',
    }
  },
  {
    id: 'studio-dark',
    name: 'Studio Matte Black',
    description: 'Ultra-clean matte black presentation stage',
    category: 'Dark',
    previewGradient: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
    style: {
      background: '#121212',
      backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
      color: '#e5e5e5',
      cardBg: '#1e1e1e',
      border: '#2e2e2e',
      accent: '#10b981',
    },
    export: {
      pptxBg: '121212',
      pptxTitle: '34d399',
      pptxText: 'e5e5e5',
      pdfBg: '#121212',
    }
  },
  {
    id: 'cyber-glow',
    name: 'Cyber Neon',
    description: 'High-energy emerald and violet glow layout',
    category: 'Modern',
    previewGradient: 'linear-gradient(135deg, #042f2e 0%, #022c22 100%)',
    style: {
      background: '#022c22',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.2), transparent 70%)',
      color: '#ecfdf5',
      cardBg: 'rgba(6, 78, 59, 0.6)',
      border: 'rgba(16, 185, 129, 0.3)',
      accent: '#34d399',
    },
    export: {
      pptxBg: '022c22',
      pptxTitle: '34d399',
      pptxText: 'ecfdf5',
      pdfBg: '#022c22',
    }
  }
];

export function getBackgroundPreset(id) {
  return BACKGROUND_PRESETS.find(p => p.id === id) || BACKGROUND_PRESETS[0];
}
