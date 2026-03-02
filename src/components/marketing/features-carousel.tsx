'use client'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback } from 'react'
import { useThemeStore } from '@/store/theme'

const features = [
  { icon: 'bx-bolt', title: '131 AI Tools', desc: 'Projects, features, RAG memory, search, agents — all callable via MCP protocol from any AI client.', color: '#00e5ff' },
  { icon: 'bx-chip', title: 'QUIC Plugin Mesh', desc: 'All plugins communicate over QUIC + Protobuf with mTLS. Sub-millisecond latency, zero config.', color: '#a900ff' },
  { icon: 'bx-brain', title: 'RAG Memory Engine', desc: 'Tantivy full-text search + SQLite vector storage. Rust-powered. Your AI remembers everything.', color: '#00e5ff' },
  { icon: 'bx-group', title: 'Multi-Agent Orchestration', desc: 'Parallel agents, sessions, provider routing across Claude, GPT-4o, Gemini, Ollama, DeepSeek.', color: '#a900ff' },
  { icon: 'bx-devices', title: '5 Platforms', desc: 'macOS, Windows, Linux desktop apps. Chrome extension. iOS and Android mobile. One backend.', color: '#00e5ff' },
  { icon: 'bx-package', title: '17 Official Packs', desc: 'Install skills, agents, and hooks with one command. Marketplace with 17 packs ready to go.', color: '#a900ff' },
]

export function FeaturesCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 })
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const btnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const btnBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const btnColor = isDark ? '#f8f8f8' : '#0f0f12'

  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .embla-slide { flex: 0 0 85% !important; min-width: unset !important; }
        .features-carousel-section { padding-bottom: 56px !important; }
        .features-carousel-header { padding: 0 20px !important; }
      }
      @media (max-width: 900px) and (min-width: 641px) {
        .embla-slide { flex: 0 0 calc(50% - 8px) !important; }
      }
    `}</style>
    <section className="features-carousel-section" style={{ padding: '0 0 80px', overflow: 'hidden' }}>
      <div className="features-carousel-header" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8, color: textPrimary }}>
              Everything built in
            </h2>
            <p style={{ fontSize: 15, color: textMuted }}>No glue code. No middleware. Just ship.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={scrollPrev} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${btnBorder}`, background: btnBg, color: btnColor, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bx bx-chevron-left" />
            </button>
            <button onClick={scrollNext} style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${btnBorder}`, background: btnBg, color: btnColor, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bx bx-chevron-right" />
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div ref={emblaRef} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="embla-slide" style={{ flex: '0 0 calc(33.333% - 11px)', minWidth: 260, padding: '28px 24px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <i className={`bx ${f.icon}`} style={{ fontSize: 22, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
