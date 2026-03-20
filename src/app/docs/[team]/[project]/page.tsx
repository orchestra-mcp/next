'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'
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

const colors = {
  bg: '#fafafa',
  cardBg: '#fff',
  border: '#e5e7eb',
  text: '#1a1a2e',
  muted: '#6b7280',
  accent: '#a900ff',
  accentLight: 'rgba(169,0,255,0.08)',
}

export default function DocsIndexPage() {
  const params = useParams()
  const team = params.team as string
  const project = params.project as string

  const [docs, setDocs] = useState<PublicDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!team || !project) return
    setLoading(true)
    setError(null)
    apiFetch<PublicDoc[]>(`/api/public/docs/${team}/${project}`, { skipAuth: true })
      .then(data => {
        const published = (data || []).filter(d => d.published)
        setDocs(published)
      })
      .catch(err => {
        console.error('[public-docs] fetch error:', err)
        setError(err.message || 'Failed to load docs')
      })
      .finally(() => setLoading(false))
  }, [team, project])

  // Group docs by category
  const grouped: Record<string, PublicDoc[]> = {}
  for (const doc of docs) {
    const cat = doc.category || 'Uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(doc)
  }
  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return a.localeCompare(b)
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${colors.border}`,
        background: colors.cardBg,
      }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={colors.accent} />
            <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="sans-serif">O</text>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
            Orchestra Docs
          </span>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '20px 24px 0',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: colors.muted,
        }}>
          <span>{decodeURIComponent(team)}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ fontWeight: 600, color: colors.text }}>
            {decodeURIComponent(project)}
          </span>
        </div>
      </div>

      {/* Content */}
      <main style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '24px 24px 64px',
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
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
            <div style={{ fontSize: 14 }}>Loading documentation...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            color: colors.muted,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>!</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              Could not load docs
            </div>
            <div style={{ fontSize: 13 }}>{error}</div>
          </div>
        ) : docs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            color: colors.muted,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>
              {'\u{1F4C4}'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              No published docs yet
            </div>
            <div style={{ fontSize: 13 }}>
              This project does not have any published documentation.
            </div>
          </div>
        ) : (
          categories.map(category => (
            <div key={category} style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: colors.muted,
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: `1px solid ${colors.border}`,
              }}>
                {category}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {grouped[category].map(doc => (
                  <Link
                    key={doc.id}
                    href={`/docs/${team}/${project}/${doc.doc_id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      padding: '16px 20px',
                      background: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = colors.accent
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.accent}`
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = colors.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                      }}>
                        {doc.icon ? (
                          <span style={{ fontSize: 18 }}>{doc.icon}</span>
                        ) : (
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: doc.color ? doc.color : colors.accentLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                          </div>
                        )}
                        <div style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {doc.title}
                        </div>
                      </div>
                      {doc.body && (
                        <div style={{
                          fontSize: 13,
                          color: colors.muted,
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {doc.body.slice(0, 120).replace(/[#*_`>\[\]]/g, '')}
                          {doc.body.length > 120 ? '...' : ''}
                        </div>
                      )}
                      <div style={{
                        fontSize: 11,
                        color: colors.muted,
                        opacity: 0.6,
                        marginTop: 10,
                      }}>
                        {doc.published_at
                          ? `Published ${new Date(doc.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : `Updated ${new Date(doc.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        }
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

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
