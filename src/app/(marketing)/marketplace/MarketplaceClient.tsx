'use client'
import { useThemeStore } from '@/store/theme'

interface Pack {
  name: string
  display_name: string
  desc: string
  skills: number
  agents: number
  hooks: number
  color: string
  tags: string[]
}

interface MarketplaceData {
  total_packs?: number
  packs?: Pack[]
}

const FALLBACK_PACKS: Pack[] = [
  { name: 'go-backend', display_name: 'Go Backend', desc: 'Fiber v3, GORM, JWT, asynq, and Go API development patterns.', skills: 12, agents: 3, hooks: 2, color: '#00acd7', tags: ['go'] },
  { name: 'typescript-react', display_name: 'TypeScript + React', desc: 'React, Zustand, shadcn/ui, Tailwind CSS v4, and modern frontend patterns.', skills: 14, agents: 4, hooks: 3, color: '#3178c6', tags: ['react'] },
  { name: 'ai-agentic', display_name: 'AI & Agentic', desc: 'Anthropic SDK, OpenAI, RAG, vector search, embeddings, and agent workflows.', skills: 16, agents: 6, hooks: 2, color: '#a900ff', tags: ['ai'] },
]

export default function MarketplaceClient({ data }: { data: MarketplaceData }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const cmdBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cmdBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const cmdPromptColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const cmdTextColor = isDark ? '#f8f8f8' : '#0f0f12'
  const statLabelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const ctaBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const ctaBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const ghBtnBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const ghBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const installBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const installBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const packs: Pack[] = data.packs?.length ? data.packs : FALLBACK_PACKS
  const totalPacks = data.total_packs ?? packs.length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 56, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)', marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#00e5ff', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
          {totalPacks} Official Packs
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>Pack Marketplace</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 500, margin: '0 auto 32px' }}>Install curated skills, agents, and hooks with one command.</p>

        {/* Install snippet */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 10, background: installBg, border: `1px solid ${installBorder}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
          <span style={{ color: cmdPromptColor }}>$</span>
          <span style={{ color: textPrimary }}>orchestra pack install <span style={{ color: '#00e5ff' }}>go-backend</span></span>
        </div>
      </div>

      {/* Packs grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {packs.map(pack => (
          <div key={pack.name} style={{ padding: '24px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>{pack.display_name}</div>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, margin: 0 }}>{pack.desc}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${pack.color}18`, border: `1px solid ${pack.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-package" style={{ fontSize: 20, color: pack.color }} />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Skills', value: pack.skills },
                { label: 'Agents', value: pack.agents },
                { label: 'Hooks', value: pack.hooks },
              ].map(s => (
                <div key={s.label} style={{ fontSize: 12, color: statLabelColor }}>
                  <span style={{ fontWeight: 600, color: textPrimary }}>{s.value}</span> {s.label}
                </div>
              ))}
            </div>

            {/* Install command */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: cmdBg, border: `1px solid ${cmdBorder}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
              <span style={{ color: cmdPromptColor }}>$</span>
              <span style={{ color: cmdTextColor, opacity: 0.7 }}>orchestra pack install {pack.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 64, textAlign: 'center', padding: '48px', borderRadius: 20, border: `1px solid ${ctaBorder}`, background: ctaBg }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 10 }}>Build your own pack</h2>
        <p style={{ fontSize: 15, color: textMuted, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>Publish skills, agents, and hooks to the marketplace. Reach every Orchestra user.</p>
        <a href="https://github.com/orchestra-mcp" target="_blank" rel="noopener" style={{ padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: ghBtnBg, color: textPrimary, textDecoration: 'none', border: `1px solid ${ghBtnBorder}`, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="bx bxl-github" style={{ fontSize: 18 }} /> View on GitHub
        </a>
      </div>
    </div>
  )
}
