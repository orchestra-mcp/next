'use client'
import Link from 'next/link'
import { MarkdownRenderer } from '@orchestra-mcp/editor'

interface PluginInfo {
  display_name: string
  desc: string
  tools: number
  language: string
  repo: string
  color: string
}

interface Props {
  slug: string
  plugin: PluginInfo | null
  readme: string
  isSeedReadme?: boolean
}

export default function PluginDetailClient({ slug, plugin, readme, isSeedReadme }: Props) {
  if (!plugin) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', marginBottom: 12 }}>Plugin not found</h1>
        <p style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', marginBottom: 24 }}>The plugin &quot;{slug}&quot; doesn&apos;t exist in the marketplace.</p>
        <Link href="/marketplace" style={{ color: '#00e5ff', textDecoration: 'none' }}>Back to Marketplace</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginBottom: 32 }}>
        <Link href="/marketplace" style={{ color: 'var(--color-fg-dim)', textDecoration: 'none' }}>Marketplace</Link>
        <span>/</span>
        <span>Plugins</span>
        <span>/</span>
        <span style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.6))' }}>{plugin.display_name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: `${plugin.color}18`, border: `1px solid ${plugin.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bx bx-plug" style={{ fontSize: 28, color: plugin.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-fg, #f8f8f8)', marginBottom: 6, letterSpacing: '-0.03em' }}>
            {plugin.display_name}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.5))', marginBottom: 12 }}>{plugin.desc}</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: `${plugin.color}18`, color: plugin.color }}>{plugin.language}</span>
            {plugin.tools > 0 && (
              <span style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>{plugin.tools} MCP tools</span>
            )}
            <a href={`https://github.com/${plugin.repo}`} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="bx bxl-github" /> {plugin.repo}
            </a>
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
          <span style={{ color: 'var(--color-fg, #f8f8f8)' }}>orchestra plugin install {slug}</span>
        </div>
        <a href={`orchestra://install/plugin/${slug}`} style={{
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
            Generated from plugin metadata — README from GitHub unavailable.
          </div>
        )}
        <MarkdownRenderer content={readme} />
      </div>
    </div>
  )
}
