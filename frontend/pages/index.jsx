// pages/index.jsx - High-Converting Public Landing Page for Pitch Deck Generator
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('deao_token');
      setIsAuthenticated(!!token);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      {/* Top Header Navigation Bar */}
      <header style={{
        height: 64,
        padding: '0 32px',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              PITCH DECK
            </div>
            <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Generator
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, color: 'var(--text-muted)' }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
          <a href="#templates" style={{ color: 'inherit', textDecoration: 'none' }}>Templates</a>
          <a href="#stats" style={{ color: 'inherit', textDecoration: 'none' }}>Platform</a>
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                Go to Workspace
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                  Sign In
                </button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                  Create Account
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '90px 24px 70px',
        maxWidth: 960,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 14px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-muted)',
          fontSize: 11,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 24,
        }}>
          <span>AI & Visual Investor Presentation Platform</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          margin: '0 0 20px',
          color: 'var(--text)',
        }}>
          Build Pitch Decks That Raise Capital
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 17,
          lineHeight: 1.6,
          color: 'var(--text-muted)',
          maxWidth: 680,
          margin: '0 auto 36px',
        }}>
          Generate AI-tailored investor presentations or customize ready-made templates with real-time visual editing, custom typography, and instant PPTX/PDF export.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 14, borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
              Create Account Free
            </button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
              Sign In to Workspace
            </button>
          </Link>
        </div>
      </section>

      {/* Mockup Preview Section */}
      <section style={{ maxWidth: 1120, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          overflow: 'hidden',
        }}>
          {/* Mockup Top Window Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: '1px solid var(--bg-tertiary)',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Pitch Deck Generator Workspace</span>
            <div style={{ width: 40 }} />
          </div>

          {/* Mockup Inner Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 240px', gap: 16, height: 380 }}>
            {/* Sidebar Mockup */}
            <div style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ height: 12, width: '60%', background: 'var(--bg-tertiary)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ height: 28, background: 'var(--brand)', borderRadius: 'var(--radius-pill)' }} />
              <div style={{ height: 28, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-pill)' }} />
              <div style={{ height: 28, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-pill)' }} />
            </div>

            {/* Slide Editor Canvas Mockup */}
            <div style={{
              background: 'var(--bg-sidebar)',
              borderRadius: 'var(--radius-md)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <span className="badge badge-completed" style={{ marginBottom: 12 }}>Executive Summary</span>
                <h3 style={{ margin: '12px 0 8px', fontSize: 22, color: '#ffffff' }}>Acme Autonomous AI Platform</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Transforming enterprise workflow automation with autonomous agent reasoning.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  Target Market: $45B TAM
                </div>
                <div style={{ background: 'var(--bg-card)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--brand)' }}>
                  Seed Goal: $2.0M Round
                </div>
              </div>
            </div>

            {/* Inspector Panel Mockup */}
            <div style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inspector Panel</div>
              <div style={{ height: 32, background: 'var(--bg-card)', borderRadius: 6 }} />
              <div style={{ height: 32, background: 'var(--bg-card)', borderRadius: 6 }} />
              <div style={{ height: 32, background: 'var(--bg-card)', borderRadius: 6 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" style={{ maxWidth: 1120, margin: '0 auto 90px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px' }}>Designed for High-Growth Founders</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
            Everything you need to plan, design, and present your investor deck.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div className="notion-card">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--brand)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>AI Deck Generator</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Input your company vision, product problem, and funding goals to generate structured pitch deck outlines.
            </p>
          </div>

          <div className="notion-card">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--brand)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Ready-Made Templates</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Curated pre-built presentation decks tailored for SaaS, AI Tech, Consumer D2C, and Investor Updates.
            </p>
          </div>

          <div className="notion-card">
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--brand)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Inspector Panel</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Visual editor to adjust Google Fonts, font weights, line height, colors, and container border styles.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics / Stats Section */}
      <section id="stats" style={{ background: 'var(--bg-card)', padding: '60px 24px', marginBottom: 90 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>10,000+</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Presentation Slides Generated</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>$50M+</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Capital Raised by Founders</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>100%</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Visual Customization & PPTX Export</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ maxWidth: 840, margin: '0 auto 100px', padding: '0 24px', textAlign: 'center' }}>
        <div className="notion-card" style={{ padding: '48px 36px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>
            Ready to Build Your Investor Deck?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.5 }}>
            Create an account or sign in to access your pitch workspace and start editing presentations.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '11px 26px', fontSize: 14, borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                Create Account
              </button>
            </Link>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '11px 24px', fontSize: 14, borderRadius: 'var(--radius-pill)', fontWeight: 400 }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '36px 32px',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--text-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>Pitch Deck Generator</span>
          <span>•</span>
          <span>Enterprise Presentation Platform</span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
          <Link href="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Create Account</Link>
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Workspace</Link>
        </div>
      </footer>
    </div>
  );
}
