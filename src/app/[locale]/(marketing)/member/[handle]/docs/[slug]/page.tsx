'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { relativeTime } from '@/lib/mcp-parsers'
import { JsonLd } from '@/components/content/json-ld'
import { buildJsonLd } from '@/lib/seo'

interface DocShare {
  id: number
  slug: string
  title: string
  description: string
  content: string
  entity_type: string
  updated_at: string
  views_count: number
}

interface SidebarDoc {
  id: number
  slug: string
  title: string
  description: string
  entity_type: string
  updated_at: string
}

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function PublicDocDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const [doc, setDoc] = useState<DocShare | null>(null)
  const [allDocs, setAllDocs] = useState<SidebarDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [docRes, listRes] = await Promise.all([
          apiFetch<DocShare>(`/api/public/community/shares/${handle}/doc/${slug}`),
          apiFetch<{ shares: SidebarDoc[] }>(
            `/api/public/community/shares/${handle}?entity_type=doc`
          ),
        ])
        setDoc(docRes)
        setAllDocs(listRes.shares ?? [])
      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [handle, slug])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading document...</p>
      </div>
    )
  }

  if (notFound || !doc) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-error-circle"
          style={{ fontSize: 36, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: '0 0 16px' }}>
          Document not found
        </p>
        <Link
          href={`/@${handle}/docs`}
          style={{ fontSize: 13, color: '#00e5ff', textDecoration: 'none' }}
        >
          <i className="bx bx-arrow-back" style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Back to Documentation
        </Link>
      </div>
    )
  }

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      {allDocs.length > 1 && (
        <aside style={sidebarStyle}>
          <div style={{ padding: '12px 14px 8px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Documentation
            </span>
          </div>
          <div style={{ padding: '4px 8px 12px' }}>
            {allDocs.map((d) => {
              const isActive = d.slug === slug
              return (
                <Link
                  key={d.id}
                  href={`/@${handle}/docs/${d.slug}`}
                  style={{
                    ...sidebarItemStyle,
                    background: isActive ? 'var(--color-bg-active)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00e5ff' : '2px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {d.title}
                </Link>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main content */}
      <article style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Link
            href={`/@${handle}/docs`}
            style={{ fontSize: 12, color: 'var(--color-fg-dim)', textDecoration: 'none' }}
          >
            Documentation
          </Link>
          <i className="bx bx-chevron-right" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-fg)', fontWeight: 600 }}>
            {doc.title}
          </span>
        </div>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
            {doc.title}
          </h1>
          {doc.description && (
            <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: '8px 0 0', lineHeight: '1.5' }}>
              {doc.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
              Updated {relativeTime(doc.updated_at)}
            </span>
            {doc.views_count > 0 && (
              <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                {doc.views_count.toLocaleString()} view{doc.views_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Markdown content */}
        {doc.content ? (
          <div
            className="doc-content prose"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }}
          />
        ) : (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>This document has no content yet.</p>
          </div>
        )}
        <JsonLd data={buildJsonLd({ title: doc.title, description: doc.description, handle, type: 'docs', slug })} />
      </article>
    </div>
  )
}

/**
 * Simple markdown-to-HTML renderer for common elements.
 * For production, swap with a proper markdown library (remark/rehype).
 */
function renderMarkdown(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Paragraphs (lines not already wrapped)
    .replace(/^(?!<[hlupoa]|<li|<hr|<pre|<code)(.+)$/gm, '<p>$1</p>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')

  return html
}

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  alignItems: 'flex-start',
}

const sidebarStyle: React.CSSProperties = {
  width: 220,
  flexShrink: 0,
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  position: 'sticky',
  top: 100,
  maxHeight: 'calc(100vh - 200px)',
  overflowY: 'auto',
}

const sidebarItemStyle: React.CSSProperties = {
  display: 'block',
  padding: '7px 12px',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--color-fg)',
  textDecoration: 'none',
  transition: 'background 0.1s ease',
}

const headerStyle: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: '1px solid var(--color-border)',
}

const contentStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: '1.7',
  color: 'var(--color-fg)',
}
