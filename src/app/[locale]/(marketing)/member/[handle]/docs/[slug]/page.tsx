'use client'

import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/mcp-parsers'
import { JsonLd } from '@/components/content/json-ld'
import { buildJsonLd } from '@/lib/seo'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ReactMarkdownBase from 'react-markdown'

const ReactMarkdown = ReactMarkdownBase as unknown as React.FC<{
  children: string
  components?: Record<string, React.FC<any>>
}>

interface DocShare {
  id: number
  slug: string
  title: string
  description: string
  content: string
  entity_type: string
  updated_at: string
  views_count: number
  group?: string
}

interface SidebarDoc {
  id: number
  slug: string
  title: string
  description: string
  entity_type: string
  updated_at: string
  group?: string
}

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function PublicDocDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const { colors } = useProfileTheme()
  const [doc, setDoc] = useState<DocShare | null>(null)
  const [allDocs, setAllDocs] = useState<SidebarDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        const [docRes, listRes] = await Promise.all([
          sb.from('shares').select('*').eq('author_handle', handle).eq('entity_type', 'doc').eq('slug', slug).eq('visibility', 'public').single(),
          sb.from('shares').select('id, slug, title, description, entity_type, updated_at, group').eq('author_handle', handle).eq('entity_type', 'doc').eq('visibility', 'public').order('updated_at', { ascending: false }),
        ])
        if (docRes.error) throw docRes.error
        setDoc(docRes.data as DocShare)
        setAllDocs((listRes.data as SidebarDoc[]) ?? [])
      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [handle, slug])

  // Group docs by their group field
  const grouped = useCallback(() => {
    const groups: Record<string, SidebarDoc[]> = {}
    for (const d of allDocs) {
      const key = d.group || ''
      if (!groups[key]) groups[key] = []
      groups[key].push(d)
    }
    return groups
  }, [allDocs])

  const currentIdx = allDocs.findIndex(d => d.slug === slug)
  const prevDoc = currentIdx > 0 ? allDocs[currentIdx - 1] : null
  const nextDoc = currentIdx < allDocs.length - 1 ? allDocs[currentIdx + 1] : null

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${colors.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: colors.textMuted }}>Loading document…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound || !doc) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <i className="bx bx-error-circle" style={{ fontSize: 40, color: colors.textMuted, display: 'block', marginBottom: 16 }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px' }}>Document not found</p>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 20px' }}>This document may have been removed or made private.</p>
        <Link href={`/@${handle}/docs`} style={{ fontSize: 13, color: colors.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i className="bx bx-arrow-back" /> Back to Docs
        </Link>
      </div>
    )
  }

  const groups = grouped()
  const hasGroups = Object.keys(groups).some(k => k !== '')
  const hasSidebar = allDocs.length > 1

  const mdComponents = {
    h1: ({ children }: any) => <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary, margin: '32px 0 12px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>{children}</h1>,
    h2: ({ children }: any) => (
      <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, margin: '28px 0 10px', letterSpacing: '-0.02em', paddingBottom: 8, borderBottom: `1px solid ${colors.cardBorder}` }}>{children}</h2>
    ),
    h3: ({ children }: any) => <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: '20px 0 8px' }}>{children}</h3>,
    h4: ({ children }: any) => <h4 style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, margin: '16px 0 6px' }}>{children}</h4>,
    p: ({ children }: any) => <p style={{ fontSize: 15, lineHeight: 1.8, color: colors.textBody, margin: '0 0 16px' }}>{children}</p>,
    a: ({ href, children }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'none', borderBottom: `1px solid ${colors.accent}40` }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = colors.accent }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = `${colors.accent}40` }}
      >{children}</a>
    ),
    strong: ({ children }: any) => <strong style={{ color: colors.textPrimary, fontWeight: 700 }}>{children}</strong>,
    em: ({ children }: any) => <em style={{ color: colors.textSecondary, fontStyle: 'italic' }}>{children}</em>,
    ul: ({ children }: any) => <ul style={{ paddingLeft: 22, margin: '0 0 16px', color: colors.textBody, fontSize: 15, lineHeight: 1.8 }}>{children}</ul>,
    ol: ({ children }: any) => <ol style={{ paddingLeft: 22, margin: '0 0 16px', color: colors.textBody, fontSize: 15, lineHeight: 1.8 }}>{children}</ol>,
    li: ({ children }: any) => <li style={{ marginBottom: 4 }}>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote style={{ borderLeft: `3px solid ${colors.accent}`, paddingLeft: 16, margin: '16px 0', color: colors.textMuted, fontStyle: 'italic', background: `${colors.accent}08`, borderRadius: '0 6px 6px 0', padding: '12px 16px' }}>{children}</blockquote>
    ),
    code: ({ inline, children, className }: any) => {
      if (inline) return <code style={{ fontSize: 13, padding: '2px 6px', borderRadius: 5, background: 'rgba(0,229,255,0.08)', color: '#00e5ff', fontFamily: 'monospace' }}>{children}</code>
      return (
        <div style={{ position: 'relative', margin: '16px 0' }}>
          {className && <span style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', textTransform: 'uppercase' }}>{className.replace('language-', '')}</span>}
          <pre style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${colors.cardBorder}`, borderRadius: 10, padding: '16px 18px', overflowX: 'auto', margin: 0 }}>
            <code style={{ fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', lineHeight: 1.6 }}>{children}</code>
          </pre>
        </div>
      )
    },
    hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${colors.cardBorder}`, margin: '28px 0' }} />,
    table: ({ children }: any) => (
      <div style={{ overflowX: 'auto', margin: '16px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead style={{ background: colors.cardBg }}>{children}</thead>,
    th: ({ children }: any) => <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: colors.textPrimary, borderBottom: `1px solid ${colors.cardBorder}`, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</th>,
    td: ({ children }: any) => <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.cardBorder}`, color: colors.textBody, fontSize: 14 }}>{children}</td>,
  }

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', minHeight: '60vh' }}>
      {/* Left sidebar */}
      {hasSidebar && (
        <aside style={{
          width: sidebarOpen ? 240 : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          position: 'sticky',
          top: 80,
          maxHeight: 'calc(100vh - 120px)',
          marginRight: sidebarOpen ? 24 : 0,
        }}>
          <div style={{
            width: 240,
            borderRadius: 12,
            border: `1px solid ${colors.cardBorder}`,
            background: colors.cardBg,
            overflow: 'hidden',
          }}>
            {/* Sidebar header */}
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${colors.cardBorder}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bx bx-book-open" style={{ fontSize: 14, color: colors.accent }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Documentation</span>
            </div>

            {/* Doc list */}
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', padding: '8px 6px' }}>
              {hasGroups
                ? Object.entries(groups).map(([group, docs]) => (
                    <div key={group}>
                      {group && (
                        <div style={{ padding: '10px 8px 4px', fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {group}
                        </div>
                      )}
                      {docs.map(d => {
                        const isActive = d.slug === slug
                        return (
                          <Link key={d.id} href={`/@${handle}/docs/${d.slug}`} style={{
                            display: 'block', padding: '7px 10px', borderRadius: 7, fontSize: 13,
                            color: isActive ? colors.accent : colors.textBody,
                            background: isActive ? `${colors.accent}12` : 'transparent',
                            textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                            borderLeft: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                            marginBottom: 1, transition: 'all 0.1s',
                          }}
                          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = colors.hoverBg; (e.currentTarget as HTMLElement).style.color = colors.textPrimary } }}
                          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = colors.textBody } }}
                          >
                            {d.title}
                          </Link>
                        )
                      })}
                    </div>
                  ))
                : allDocs.map(d => {
                    const isActive = d.slug === slug
                    return (
                      <Link key={d.id} href={`/@${handle}/docs/${d.slug}`} style={{
                        display: 'block', padding: '7px 10px', borderRadius: 7, fontSize: 13,
                        color: isActive ? colors.accent : colors.textBody,
                        background: isActive ? `${colors.accent}12` : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                        borderLeft: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                        marginBottom: 1, transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = colors.hoverBg; (e.currentTarget as HTMLElement).style.color = colors.textPrimary } }}
                      onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = colors.textBody } }}
                      >
                        {d.title}
                      </Link>
                    )
                  })
              }
            </div>
          </div>
        </aside>
      )}

      {/* Main content */}
      <article style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {hasSidebar && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background: 'transparent', border: `1px solid ${colors.cardBorder}`, borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              <i className={`bx bx-${sidebarOpen ? 'sidebar' : 'menu'}`} style={{ fontSize: 14 }} />
            </button>
          )}
          {/* Breadcrumb */}
          <Link href={`/@${handle}/docs`} style={{ fontSize: 12, color: colors.textMuted, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = colors.textPrimary }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = colors.textMuted }}
          >Docs</Link>
          {doc.group && <>
            <i className="bx bx-chevron-right" style={{ fontSize: 13, color: colors.textMuted }} />
            <span style={{ fontSize: 12, color: colors.textMuted }}>{doc.group}</span>
          </>}
          <i className="bx bx-chevron-right" style={{ fontSize: 13, color: colors.textMuted }} />
          <span style={{ fontSize: 12, color: colors.textPrimary, fontWeight: 600 }}>{doc.title}</span>
        </div>

        {/* Article header */}
        <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${colors.cardBorder}` }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: colors.textPrimary, margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {doc.title}
          </h1>
          {doc.description && (
            <p style={{ fontSize: 16, color: colors.textMuted, margin: '0 0 14px', lineHeight: 1.6 }}>
              {doc.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="bx bx-time-five" style={{ fontSize: 12 }} />
              Updated {relativeTime(doc.updated_at)}
            </span>
            {doc.views_count > 0 && (
              <span style={{ fontSize: 11, color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="bx bx-show" style={{ fontSize: 12 }} />
                {doc.views_count.toLocaleString()} view{doc.views_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Markdown content */}
        {doc.content ? (
          <div style={{ lineHeight: 1.8 }}>
            <ReactMarkdown components={mdComponents}>{doc.content}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <i className="bx bx-file-blank" style={{ fontSize: 36, color: colors.textMuted, display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: colors.textMuted }}>This document has no content yet.</p>
          </div>
        )}

        {/* Prev / Next navigation */}
        {(prevDoc || nextDoc) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${colors.cardBorder}` }}>
            {prevDoc ? (
              <Link href={`/@${handle}/docs/${prevDoc.slug}`} style={{ flex: 1, padding: '14px 16px', borderRadius: 10, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.accent }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.cardBorder }}
              >
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-arrow-back" /> Previous
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{prevDoc.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            {nextDoc ? (
              <Link href={`/@${handle}/docs/${nextDoc.slug}`} style={{ flex: 1, padding: '14px 16px', borderRadius: 10, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, textDecoration: 'none', transition: 'border-color 0.15s', textAlign: 'right' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.accent }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = colors.cardBorder }}
              >
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  Next <i className="bx bx-right-arrow-alt" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{nextDoc.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>
        )}

        <JsonLd data={buildJsonLd({ title: doc.title, description: doc.description, handle, type: 'docs', slug })} />
      </article>
    </div>
  )
}
