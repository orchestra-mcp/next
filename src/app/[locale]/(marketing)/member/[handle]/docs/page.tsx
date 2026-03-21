'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { relativeTime } from '@/lib/mcp-parsers'

interface DocShare {
  id: number
  slug: string
  title: string
  description: string
  entity_type: string
  visibility: string
  updated_at: string
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function PublicDocsPage(props: PageProps) {
  const { handle } = use(props.params)
  const { user } = useAuthStore()
  const [docs, setDocs] = useState<DocShare[]>([])
  const [loading, setLoading] = useState(true)

  const isOwner = !!user && (user.username === handle || (user.settings?.handle as string) === handle)

  useEffect(() => {
    async function load() {
      try {
        let shares: DocShare[] = []
        if (isOwner) {
          // Owner sees all their items (public + private)
          const res = await apiFetch<{ shares: DocShare[] }>('/api/community/shares?entity_type=doc')
          shares = res.shares ?? []
        } else {
          const res = await apiFetch<{ shares: DocShare[] }>(
            `/api/public/community/shares/${handle}?entity_type=doc`, { skipAuth: true }
          )
          shares = res.shares ?? []
        }
        setDocs(shares)
      } catch {
        setDocs([])
      }
      setLoading(false)
    }
    load()
  }, [handle, isOwner])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading documentation...</p>
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-file"
          style={{ fontSize: 40, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: 0 }}>
          No public documentation
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <i className="bx bx-file" style={{ fontSize: 22, color: 'var(--color-fg)' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
          Documentation
        </h2>
        <span style={countBadgeStyle}>{docs.length}</span>
      </div>

      {/* Doc list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docs.map((doc) => (
          <Link
            key={doc.id}
            href={`/@${handle}/docs/${doc.slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              style={cardStyle}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = '#00e5ff'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <i
                  className="bx bx-file"
                  style={{ fontSize: 18, color: '#00c853', marginTop: 2, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg)', flex: 1, minWidth: 0 }}>
                      {doc.title}
                    </span>
                    {isOwner && doc.visibility === 'private' && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', flexShrink: 0 }}>
                        <i className="bx bx-lock-alt" style={{ fontSize: 10, marginRight: 2 }} />Private
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p style={descriptionStyle}>{doc.description}</p>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                    Updated {relativeTime(doc.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const countBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 20,
  padding: '2px 8px',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  padding: 16,
  transition: 'border-color 0.15s ease',
  cursor: 'pointer',
}

const descriptionStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--color-fg-dim)',
  margin: '0 0 6px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: '1.45',
}
