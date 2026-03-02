'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

const navSections = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', slug: '' },
      { label: 'Installation', slug: 'installation' },
      { label: 'Quick Start', slug: 'quick-start' },
    ],
  },
  {
    title: 'CLI Reference',
    items: [
      { label: 'orchestra serve', slug: 'cli/serve' },
      { label: 'orchestra init', slug: 'cli/init' },
      { label: 'orchestra pack', slug: 'cli/pack' },
      { label: 'orchestra version', slug: 'cli/version' },
    ],
  },
  {
    title: 'MCP Tools',
    items: [
      { label: 'Feature Tools', slug: 'tools/features' },
      { label: 'RAG Memory', slug: 'tools/rag' },
      { label: 'Agent Orchestration', slug: 'tools/agents' },
      { label: 'Marketplace', slug: 'tools/marketplace' },
    ],
  },
  {
    title: 'Plugin SDK',
    items: [
      { label: 'Plugin Architecture', slug: 'sdk/architecture' },
      { label: 'Go Plugins', slug: 'sdk/go' },
      { label: 'Rust Plugins', slug: 'sdk/rust' },
      { label: 'QUIC Protocol', slug: 'sdk/quic' },
    ],
  },
  {
    title: 'Architecture',
    items: [
      { label: 'System Overview', slug: 'architecture/overview' },
      { label: 'Plugin Mesh', slug: 'architecture/mesh' },
      { label: 'Storage Layer', slug: 'architecture/storage' },
    ],
  },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const linkColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const linkHoverColor = isDark ? '#f8f8f8' : '#0f0f12'

  return (
    <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${sidebarBorder}`, padding: '32px 20px', position: 'sticky', top: 60, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {navSections.map(section => (
            <div key={section.title}>
              <div style={{ fontSize: 11, fontWeight: 600, color: sectionTitleColor, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(item => (
                  <Link
                    key={item.slug}
                    href={`/docs${item.slug ? `/${item.slug}` : ''}`}
                    style={{ padding: '6px 10px', borderRadius: 7, fontSize: 13, color: linkColor, textDecoration: 'none', display: 'block' }}
                    onMouseEnter={e => (e.currentTarget.style.color = linkHoverColor)}
                    onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, padding: '40px 48px', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
