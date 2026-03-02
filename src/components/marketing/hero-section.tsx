'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

interface TerminalLine {
  name: string
  note: string
  color: string
}

interface HeroData {
  hero_headline?: string
  hero_subtext?: string
  total_tools?: string
  terminal_lines?: TerminalLine[]
  stats?: Array<{ label: string; value: string }>
}

const COLOR_MAP: Record<string, string> = {
  cyan:   '#00e5ff',
  purple: '#a900ff',
  green:  '#22c55e',
  yellow: '#fbbf24',
  red:    '#f87171',
}

const DEFAULT_LINES: TerminalLine[] = [
  { name: 'orchestrator',       note: 'listening :9100',   color: 'cyan' },
  { name: 'storage.markdown',   note: '.projects/',         color: 'cyan' },
  { name: 'tools.features',     note: '34 tools',           color: 'cyan' },
  { name: 'engine.rag',         note: '22 tools  (Rust)',   color: 'cyan' },
  { name: 'bridge.claude',      note: '5 tools + 1 stream', color: 'purple' },
  { name: 'agent.orchestrator', note: '20 tools',           color: 'purple' },
  { name: 'transport.quic-bridge', note: 'port 9200',       color: 'green' },
]

export function HeroSection({ data }: { data?: HeroData }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const docsBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const docsBtnBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const docsBtnColor = isDark ? '#f8f8f8' : '#0f0f12'

  const totalTools = data?.total_tools ?? '290'
  const terminalLines = data?.terminal_lines ?? DEFAULT_LINES

  useEffect(() => {
    import('animejs').then(({ animate, stagger }) => {
      animate('.hero-badge', { opacity: [0, 1], translateY: [16, 0], duration: 600, easing: 'easeOutCubic' })
      animate('.hero-title span', { opacity: [0, 1], translateY: [24, 0], duration: 700, delay: stagger(80, { start: 200 }), easing: 'easeOutCubic' })
      animate('.hero-sub', { opacity: [0, 1], translateY: [16, 0], duration: 600, delay: 600, easing: 'easeOutCubic' })
      animate('.hero-ctas', { opacity: [0, 1], translateY: [12, 0], duration: 600, delay: 750, easing: 'easeOutCubic' })
      animate('.hero-terminal', { opacity: [0, 1], translateY: [32, 0], duration: 800, delay: 900, easing: 'easeOutCubic' })
    })
  }, [])

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .hero-section { padding: 64px 20px 56px !important; }
        .hero-sub { font-size: 15px !important; }
        .hero-ctas { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
        .hero-ctas a { justify-content: center !important; text-align: center; }
        .hero-terminal-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .hero-terminal-inner { min-width: 420px; }
        .terminal-line { font-size: 11px !important; line-height: 1.7 !important; }
      }
      @media (max-width: 400px) {
        .hero-badge span { font-size: 10px !important; }
      }
    `}</style>
    <section ref={heroRef} className="hero-section" style={{ position: 'relative', padding: '100px 32px 80px', textAlign: 'center', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '0%', left: '10%', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(169,0,255,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
        {/* Badge */}
        <div className="hero-badge" style={{ opacity: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)', marginBottom: 32, fontSize: 12, fontWeight: 500 }}>
          <span style={{ background: 'linear-gradient(90deg, #00e5ff, #a900ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            &#10022; {totalTools} AI tools &middot; 36 plugins &middot; 17 packs &middot; 5 platforms
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24, color: textPrimary }}>
          {['The', 'AI-native', 'IDE'].map(w => (
            <span key={w} style={{ opacity: 0, display: 'inline-block', marginRight: '0.25em' }}>{w}</span>
          ))}
          <br />
          {['for', 'every', 'platform'].map(w => (
            <span key={w} style={{ opacity: 0, display: 'inline-block', marginRight: '0.25em', background: 'linear-gradient(135deg, #00e5ff 0%, #a900ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{w}</span>
          ))}
        </h1>

        {/* Subheading */}
        <p className="hero-sub" style={{ opacity: 0, fontSize: 19, color: textMuted, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
          {data?.hero_subtext ?? 'Orchestra connects your AI agents to a unified plugin backbone over QUIC + Protobuf with mTLS. One protocol, every tool, any AI.'}
        </p>

        {/* CTAs */}
        <div className="hero-ctas" style={{ opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href="/register" style={{ padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Get started free <i className="bx bx-right-arrow-alt" style={{ fontSize: 18 }} />
          </Link>
          <Link href="/docs" style={{ padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: `1px solid ${docsBtnBorder}`, color: docsBtnColor, background: docsBtnBg, textDecoration: 'none', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <i className="bx bx-book-open" /> Read the docs
          </Link>
        </div>

        {/* Terminal — always dark (intentional) */}
        <div className="hero-terminal hero-terminal-wrap" style={{ opacity: 0, maxWidth: 700, margin: '0 auto' }}>
          <div className="hero-terminal-inner" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(22,18,28,0.97)', boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>orchestra serve</span>
            </div>
            <div style={{ padding: '20px 24px', fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: 13, lineHeight: 1.9, color: '#d0d0d0', textAlign: 'left' }}>
              {terminalLines.map((line, i) => (
                <div key={i} className="terminal-line">
                  <span style={{ color: COLOR_MAP[line.color] ?? '#00e5ff' }}>&#10003; </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{line.name.padEnd(24)}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>{line.note}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }} className="terminal-line">
                <span style={{ color: '#00e5ff' }}>&#9889; </span>
                <span style={{ fontWeight: 600, color: '#f8f8f8' }}>{totalTools} tools ready</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}> &middot; stdio + quic &middot; mTLS secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
