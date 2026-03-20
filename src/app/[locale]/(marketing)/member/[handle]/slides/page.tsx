'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { relativeTime } from '@/lib/mcp-parsers'

interface Presentation {
  id: string
  title: string
  slug: string
  description: string
  slide_count: number
  visibility: string
  updated_at: string
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function PublicSlidesPage(props: PageProps) {
  const { handle } = use(props.params)
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ presentations: Presentation[] }>(
          `/api/public/presentations/${handle}`
        )
        setPresentations(res.presentations ?? [])
      } catch {
        setPresentations([])
      }
      setLoading(false)
    }
    load()
  }, [handle])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading presentations...</p>
      </div>
    )
  }

  if (presentations.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-slideshow"
          style={{ fontSize: 40, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: 0 }}>
          No public presentations
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <i className="bx bx-slideshow" style={{ fontSize: 22, color: 'var(--color-fg)' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
          Presentations
        </h2>
        <span style={countBadgeStyle}>{presentations.length}</span>
      </div>

      {/* Grid */}
      <div className="slides-grid" style={gridStyle}>
        {presentations.map((pres) => (
          <Link
            key={pres.id}
            href={`/@${handle}/slides/${pres.slug}`}
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
              {/* Slide preview placeholder */}
              <div style={previewStyle}>
                <i className="bx bx-slideshow" style={{ fontSize: 28, color: 'var(--color-fg-dim)' }} />
              </div>

              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', display: 'block', marginBottom: 4 }}>
                  {pres.title}
                </span>
                {pres.description && (
                  <p style={descriptionStyle}>{pres.description}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={slideCountStyle}>
                    {pres.slide_count} slide{pres.slide_count !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                    {relativeTime(pres.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .slides-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 14,
}

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  overflow: 'hidden',
  transition: 'border-color 0.15s ease',
  cursor: 'pointer',
}

const previewStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 120,
  background: 'var(--color-bg-alt)',
  borderBottom: '1px solid var(--color-border)',
}

const descriptionStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-fg-dim)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: '1.4',
}

const slideCountStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 20,
  padding: '2px 8px',
}
