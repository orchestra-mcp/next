'use client'
import Link from 'next/link'
import { MarkdownRenderer } from '@orchestra-mcp/editor'

const STACK_COLORS: Record<string, string> = {
  '*': '#00e5ff', go: '#00acd7', rust: '#dea584', react: '#61dafb', typescript: '#3178c6',
  'react-native': '#22c55e', swift: '#ff6723', kotlin: '#7f52ff', csharp: '#512bd4',
  c: '#fbbf24', docker: '#2496ed', php: '#777bb4', java: '#b07219', flutter: '#02569b',
}

interface PackInfo {
  display_name: string
  desc: string
  skills: number
  agents: number
  hooks: number
  color: string
  stacks: string[]
}

interface Props {
  slug: string
  pack: PackInfo | null
  readme: string
  isSeedReadme?: boolean
}

export default function PackDetailClient({ slug, pack, readme, isSeedReadme }: Props) {
  if (!pack) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', marginBottom: 12 }}>Pack not found</h1>
        <p style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', marginBottom: 24 }}>The pack &quot;{slug}&quot; doesn&apos;t exist in the marketplace.</p>
        <Link href="/marketplace" style={{ color: '#00e5ff', textDecoration: 'none' }}>Back to Marketplace</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginBottom: 32 }}>
        <Link href="/marketplace" style={{ color: 'var(--color-fg-dim)', textDecoration: 'none' }}>Marketplace</Link>
        <span>/</span><span>Packs</span><span>/</span>
        <span style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.6))' }}>{pack.display_name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: `${pack.color}18`, border: `1px solid ${pack.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bx bx-package" style={{ fontSize: 28, color: pack.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-fg, #f8f8f8)', marginBottom: 6, letterSpacing: '-0.03em' }}>
            {pack.display_name}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.5))', marginBottom: 12 }}>{pack.desc}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {pack.stacks.map(s => (
              <span key={s} style={{
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5,
                background: `${STACK_COLORS[s] ?? '#888'}15`,
                color: STACK_COLORS[s] ?? '#888',
              }}>{s === '*' ? 'universal' : s}</span>
            ))}
            <span style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>
              {[pack.skills > 0 && `${pack.skills} skills`, pack.agents > 0 && `${pack.agents} agents`, pack.hooks > 0 && `${pack.hooks} hooks`].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>
      </div>

      {/* Install + Deep Link */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 300, padding: '14px 18px', borderRadius: 10,
          background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
          border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>$</span>
          <span style={{ color: 'var(--color-fg, #f8f8f8)' }}>orchestra pack install {slug}</span>
        </div>
        <a href={`orchestra://install/pack/${slug}`} style={{
          padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap',
        }}>
          <i className="bx bx-download" /> Install in App
        </a>
      </div>

      {/* README rendered with MarkdownRenderer */}
      <div style={{
        padding: '32px', borderRadius: 16,
        border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
        background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          README.md
        </div>
        {isSeedReadme && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 20,
            background: 'rgba(249, 158, 11, 0.08)', border: '1px solid rgba(249, 158, 11, 0.2)',
            fontSize: 13, color: 'rgba(249, 158, 11, 0.8)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="bx bx-info-circle" />
            Generated from pack metadata — README from GitHub unavailable.
          </div>
        )}
        <MarkdownRenderer content={readme} />
      </div>
    </div>
  )
}
