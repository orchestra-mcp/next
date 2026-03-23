'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MarkdownRenderer } from '@orchestra-mcp/editor'
import Link from 'next/link'

interface PublicDoc {
  id: string
  doc_id: string
  title: string
  body: string
  category: string
  parent_id: string
  icon: string
  color: string
  published: boolean
  published_at: string
  created_at: string
  updated_at: string
}

interface TocEntry {
  level: number
  text: string
  id: string
}

const colors = {
  bg: '#fafafa',
  cardBg: '#fff',
  border: '#e5e7eb',
  text: '#1a1a2e',
  muted: '#6b7280',
  accent: '#a900ff',
  accentLight: 'rgba(169,0,255,0.08)',
  sidebarBg: '#fff',
}

function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[#*_`\[\]]/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      entries.push({ level, text, id })
    }
  }
  return entries
}

export default function DocDetailPage() {
  const params = useParams()
  const team = params.team as string
  const project = params.project as string
  const slug = params.slug as string

  const [doc, setDoc] = useState<PublicDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTocId, setActiveTocId] = useState<string>('')

  useEffect(() => {
    if (!team || !project || !slug) return
    setLoading(true)
    setError(null)
    const sb = createClient()
    sb.from('docs').select('*').eq('team_slug', team).eq('project_slug', project).eq('slug', slug).single()
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) throw fetchErr
        if (data && (data as any).title) {
          setDoc(data as PublicDoc)
        } else {
          setError('Document not found or not published.')
        }
      })
      .catch(err => {
        console.error('[public-docs] fetch error:', err)
        setError(err.message || 'Failed to load document')
      })
      .finally(() => setLoading(false))
  }, [team, project, slug])

  const toc = useMemo(() => {
    if (!doc?.body) return []
    return extractToc(doc.body)
  }, [doc?.body])

  // Track active heading on scroll
  useEffect(() => {
    if (toc.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    // Observe after a short delay to let content render
    const timer = setTimeout(() => {
      for (const item of toc) {
        const el = document.getElementById(item.id)
        if (el) observer.observe(el)
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [toc])

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.cardBg,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Link href={`/docs/${team}/${project}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill={colors.accent} />
              <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="sans-serif">O</text>
            </svg>
          </Link>

          {/* Breadcrumbs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: colors.muted,
            overflow: 'hidden',
          }}>
            <Link
              href={`/docs/${team}/${project}`}
              style={{ color: colors.muted, textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.color = colors.accent }}
              onMouseLeave={e => { e.currentTarget.style.color = colors.muted }}
            >
              {decodeURIComponent(team)}
            </Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <Link
              href={`/docs/${team}/${project}`}
              style={{ color: colors.muted, textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.color = colors.accent }}
              onMouseLeave={e => { e.currentTarget.style.color = colors.muted }}
            >
              {decodeURIComponent(project)}
            </Link>
            {doc && (
              <>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{
                  color: colors.text,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {doc.title}
                </span>
              </>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Back link */}
          <Link
            href={`/docs/${team}/${project}`}
            style={{
              fontSize: 13,
              color: colors.accent,
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All docs
          </Link>
        </div>
      </header>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '120px 0',
          color: colors.muted,
        }}>
          <div style={{
            width: 32,
            height: 32,
            border: `3px solid ${colors.border}`,
            borderTopColor: colors.accent,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: 14 }}>Loading document...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : error || !doc ? (
        <div style={{
          textAlign: 'center',
          padding: '120px 0',
          color: colors.muted,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>!</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Document not found
          </div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>{error || 'This document does not exist or is not published.'}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { setError(null); setLoading(true); const sb = createClient(); sb.from('docs').select('*').eq('team_slug', team).eq('project_slug', project).eq('slug', slug).single().then(({ data: d, error: e }) => { if (e) throw e; if (d && (d as any).title) setDoc(d as PublicDoc); else setError('Document not found.'); }).catch((e: any) => setError(e.message)).finally(() => setLoading(false)) }}
              style={{ fontSize: 13, color: colors.accent, background: 'none', border: `1px solid ${colors.accent}`, borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: 600 }}
            >
              Retry
            </button>
            <Link
              href={`/docs/${team}/${project}`}
              style={{ fontSize: 13, color: colors.muted, textDecoration: 'none', fontWeight: 600, padding: '6px 16px' }}
            >
              Back to docs
            </Link>
          </div>
        </div>
      ) : (
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          gap: 0,
          minHeight: 'calc(100vh - 52px)',
        }}>
          {/* Left sidebar: Table of contents */}
          {toc.length > 0 && (
            <aside style={{
              width: 240,
              minWidth: 240,
              padding: '28px 0 28px 24px',
              position: 'sticky',
              top: 52,
              height: 'calc(100vh - 52px)',
              overflowY: 'auto',
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.muted,
                marginBottom: 12,
              }}>
                On this page
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {toc.map((item, i) => {
                  const isActive = activeTocId === item.id
                  return (
                    <a
                      key={`${item.id}-${i}`}
                      href={`#${item.id}`}
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: isActive ? colors.accent : colors.muted,
                        textDecoration: 'none',
                        padding: '4px 8px',
                        paddingLeft: item.level === 3 ? 22 : 8,
                        borderRadius: 4,
                        background: isActive ? colors.accentLight : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'color 0.15s, background 0.15s',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.color = colors.text
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.color = colors.muted
                      }}
                    >
                      {item.text}
                    </a>
                  )
                })}
              </nav>
            </aside>
          )}

          {/* Main content */}
          <main style={{
            flex: 1,
            minWidth: 0,
            padding: '32px 40px 80px',
            maxWidth: 720,
          }}>
            {/* Title */}
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              color: colors.text,
              lineHeight: 1.25,
              marginBottom: 8,
            }}>
              {doc.icon && <span style={{ marginRight: 10 }}>{doc.icon}</span>}
              {doc.title}
            </h1>

            {/* Category badge */}
            {doc.category && (
              <div style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 20,
                background: colors.accentLight,
                color: colors.accent,
                marginBottom: 20,
              }}>
                {doc.category}
              </div>
            )}

            {/* Markdown content */}
            <MarkdownRenderer content={doc.body} />

            {/* Meta info */}
            <div style={{
              marginTop: 48,
              paddingTop: 20,
              borderTop: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 12,
              color: colors.muted,
            }}>
              <span>
                Last updated{' '}
                {new Date(doc.updated_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {doc.published_at && (
                <>
                  <span style={{ opacity: 0.3 }}>|</span>
                  <span>
                    Published{' '}
                    {new Date(doc.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${colors.border}`,
        background: colors.cardBg,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 12,
          color: colors.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          Powered by
          <span style={{ fontWeight: 700, color: colors.accent }}>Orchestra</span>
        </div>
      </footer>
    </div>
  )
}
