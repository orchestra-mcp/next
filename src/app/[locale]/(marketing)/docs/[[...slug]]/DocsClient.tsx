'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MarkdownRenderer } from '@orchestra-mcp/editor'

interface DocsClientProps {
  slug?: string[]
  title: string
  description: string
  body: string | null
  sidebar: Array<{ title: string; items: Array<{ label: string; slug: string }> }>
}

function toId(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function DocsClient({ slug, title, description, body, sidebar }: DocsClientProps) {
  const pathname = usePathname()
  const path = slug?.join('/') ?? ''

  // Extract TOC from body for right sidebar
  const toc: Array<{ level: number; text: string; id: string }> = []
  if (body) {
    for (const line of body.split('\n')) {
      if (line.startsWith('### ')) {
        const text = line.slice(4).trim()
        toc.push({ level: 3, text, id: toId(text) })
      } else if (line.startsWith('## ')) {
        const text = line.slice(3).trim()
        toc.push({ level: 2, text, id: toId(text) })
      }
    }
  }

  return (
    <div className="docs-client-layout" style={{ display: 'flex', gap: 0, minHeight: 'calc(100vh - 120px)' }}>
      {/* Left sidebar */}
      <aside className="docs-sidebar" style={{
        width: 240, flexShrink: 0,
        borderInlineEnd: '1px solid var(--color-border, rgba(255,255,255,0.06))',
        padding: '32px 20px',
        position: 'sticky', top: 60, alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sidebar.map(section => (
            <div key={section.title}>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--color-fg-dim, rgba(255,255,255,0.3))',
                letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(item => {
                  const href = `/docs${item.slug ? `/${item.slug}` : ''}`
                  const isActive = path === item.slug
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      className="docs-nav-link"
                      style={{
                        padding: '6px 10px', borderRadius: 7, fontSize: 13,
                        color: isActive ? '#00e5ff' : 'var(--color-fg-muted, rgba(255,255,255,0.55))',
                        background: isActive ? 'rgba(0,229,255,0.06)' : 'transparent',
                        textDecoration: 'none', display: 'block',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="docs-content" style={{ flex: 1, padding: '40px 48px', minWidth: 0, maxWidth: 780 }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
          color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginBottom: 32,
        }}>
          <Link href="/docs" style={{ color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', textDecoration: 'none' }}>Docs</Link>
          {slug?.map((s, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>/</span>
              <span style={{
                color: i === slug.length - 1
                  ? 'var(--color-fg-muted, rgba(255,255,255,0.6))'
                  : 'var(--color-fg-dim, rgba(255,255,255,0.3))',
              }}>{s}</span>
            </span>
          ))}
        </div>

        {body ? (
          <MarkdownRenderer content={body} />
        ) : (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-fg, #f8f8f8)', marginBottom: 16 }}>
              {title}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-fg-muted, rgba(255,255,255,0.55))', lineHeight: 1.7, marginBottom: 32 }}>
              This page is coming soon. Check back later or browse the other docs sections.
            </p>
            <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00e5ff', textDecoration: 'none', fontSize: 14 }}>
              <i className="bx bx-left-arrow-alt rtl-flip" /> Back to Introduction
            </Link>
          </div>
        )}
      </div>

      {/* Right TOC sidebar */}
      {toc.length > 2 && (
        <aside className="docs-toc" style={{
          width: 200, flexShrink: 0,
          borderInlineStart: '1px solid var(--color-border, rgba(255,255,255,0.06))',
          padding: '32px 16px',
          position: 'sticky', top: 60, alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--color-fg-dim, rgba(255,255,255,0.3))',
            letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12,
          }}>On this page</div>
          {toc.map((entry, i) => (
            <a
              key={i}
              href={`#${entry.id}`}
              style={{
                display: 'block', fontSize: 12,
                padding: '3px 0',
                paddingInlineStart: entry.level === 3 ? 12 : 0,
                color: 'var(--color-fg-dim, rgba(255,255,255,0.4))',
                textDecoration: 'none', lineHeight: 1.6,
              }}
            >
              {entry.text}
            </a>
          ))}
        </aside>
      )}

      <style>{`
        .docs-nav-link:hover {
          color: var(--color-fg, #f8f8f8) !important;
          background: var(--color-bg-active, rgba(255,255,255,0.04)) !important;
        }
        .docs-toc a:hover {
          color: var(--color-fg-muted, rgba(255,255,255,0.6)) !important;
        }
        @media (max-width: 1024px) {
          .docs-toc { display: none !important; }
        }
        @media (max-width: 768px) {
          .docs-client-layout { flex-direction: column !important; }
          .docs-sidebar { width: 100% !important; position: static !important; max-height: none !important; border-inline-end: none !important; border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.06)) !important; padding: 16px 20px !important; }
          .docs-content { padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  )
}
