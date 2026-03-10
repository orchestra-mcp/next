'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const sectionTitleColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const linkColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const linkHoverColor = isDark ? '#f8f8f8' : '#0f0f12'

  const navSections = [
    {
      title: t('docs.gettingStarted'),
      items: [
        { label: t('docs.introduction'), slug: '' },
        { label: t('docs.installation'), slug: 'installation' },
        { label: t('docs.quickStart'), slug: 'quick-start' },
      ],
    },
    {
      title: t('docs.cliReference'),
      items: [
        { label: 'orchestra serve', slug: 'cli/serve' },
        { label: 'orchestra init', slug: 'cli/init' },
        { label: 'orchestra pack', slug: 'cli/pack' },
        { label: 'orchestra version', slug: 'cli/version' },
      ],
    },
    {
      title: t('docs.mcpTools'),
      items: [
        { label: t('docs.featureTools'), slug: 'tools/features' },
        { label: t('docs.ragMemory'), slug: 'tools/rag' },
        { label: t('docs.agentOrchestration'), slug: 'tools/agents' },
        { label: t('nav.marketplace'), slug: 'tools/marketplace' },
      ],
    },
    {
      title: t('docs.pluginSdk'),
      items: [
        { label: t('docs.pluginArchitecture'), slug: 'sdk/architecture' },
        { label: t('docs.goPlugins'), slug: 'sdk/go' },
        { label: t('docs.rustPlugins'), slug: 'sdk/rust' },
        { label: t('docs.quicProtocol'), slug: 'sdk/quic' },
      ],
    },
    {
      title: t('docs.architecture'),
      items: [
        { label: t('docs.systemOverview'), slug: 'architecture/overview' },
        { label: t('docs.pluginMesh'), slug: 'architecture/mesh' },
        { label: t('docs.storageLayer'), slug: 'architecture/storage' },
      ],
    },
  ]

  return (
    <div className="docs-layout" style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <aside className="docs-sidebar" style={{ width: 240, flexShrink: 0, borderInlineEnd: `1px solid ${sidebarBorder}`, padding: '32px 20px', position: 'sticky', top: 60, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' }}>
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
      <div className="docs-content" style={{ flex: 1, padding: '40px 48px', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
