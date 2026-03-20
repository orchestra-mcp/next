'use client'
import Link from 'next/link'
import { MarkdownRenderer } from '@orchestra-mcp/editor'

const TYPE_ICONS: Record<string, string> = {
  skill: 'bx-terminal', agent: 'bx-bot', workflow: 'bx-git-branch',
}
const TYPE_COLORS: Record<string, string> = {
  skill: '#00e5ff', agent: '#a900ff', workflow: '#22c55e',
}
const STACK_COLORS: Record<string, string> = {
  '*': '#00e5ff', go: '#00acd7', rust: '#dea584', react: '#61dafb', typescript: '#3178c6',
  'react-native': '#22c55e', swift: '#ff6723', kotlin: '#7f52ff', csharp: '#512bd4',
  c: '#fbbf24', docker: '#2496ed', php: '#777bb4', java: '#b07219', flutter: '#02569b',
}

interface ItemData {
  slug: string
  name: string
  desc: string
  author: string
  author_handle: string
  type: 'skill' | 'agent' | 'workflow'
  stacks: string[]
  downloads: number
  content?: string
}

interface Props {
  item: ItemData | null
  type: 'skill' | 'agent' | 'workflow'
  slug: string
}

export default function CommunityDetailClient({ item, type, slug }: Props) {
  const typePlural = type + 's'
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)

  if (!item) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', marginBottom: 12 }}>{typeLabel} not found</h1>
        <p style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', marginBottom: 24 }}>
          The {type} &quot;{slug}&quot; doesn&apos;t exist in the marketplace.
        </p>
        <Link href="/marketplace" style={{ color: '#00e5ff', textDecoration: 'none' }}>Back to Marketplace</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginBottom: 32 }}>
        <Link href="/marketplace" style={{ color: 'var(--color-fg-dim)', textDecoration: 'none' }}>Marketplace</Link>
        <span>/</span><span>{typeLabel}s</span><span>/</span>
        <span style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.6))' }}>{item.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: `${TYPE_COLORS[type]}18`, border: `1px solid ${TYPE_COLORS[type]}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`bx ${TYPE_ICONS[type]}`} style={{ fontSize: 28, color: TYPE_COLORS[type] }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-fg, #f8f8f8)', letterSpacing: '-0.03em', margin: 0 }}>
              {item.name}
            </h1>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5,
              background: `${TYPE_COLORS[type]}15`, color: TYPE_COLORS[type],
              textTransform: 'uppercase',
            }}>{type}</span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.5))', marginBottom: 12 }}>{item.desc}</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`/member/${item.author_handle}`} style={{ fontSize: 13, color: 'var(--color-fg-dim, rgba(255,255,255,0.4))', textDecoration: 'none' }}>
              by <span style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.6))', fontWeight: 500 }}>{item.author}</span>
            </Link>
            <span style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))' }}>
              {item.downloads.toLocaleString()} installs
            </span>
            {item.stacks.map(s => (
              <span key={s} style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                background: `${STACK_COLORS[s] ?? '#888'}12`, color: STACK_COLORS[s] ?? '#888',
              }}>{s === '*' ? 'universal' : s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Deep link install */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
        <a href={`orchestra://install/${type}/${item.slug}`} style={{
          padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <i className="bx bx-download" /> Install in App
        </a>
        <button
          onClick={() => navigator.clipboard?.writeText(`orchestra://install/${type}/${item.slug}`)}
          style={{
            padding: '14px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            color: 'var(--color-fg, #f8f8f8)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <i className="bx bx-link" /> Copy Deep Link
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '32px', borderRadius: 16,
        border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
        background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {typeLabel} Content
        </div>
        {item.content ? (
          <MarkdownRenderer content={item.content} />
        ) : (
          <p style={{ fontSize: 14, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>
            Content preview not available yet. Install the {type} to see its full definition.
          </p>
        )}
      </div>
    </div>
  )
}
