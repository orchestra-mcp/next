'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'

interface ApiCollection {
  id: number
  name: string
  slug: string
  description: string
  base_url: string
  auth_type: string
  visibility: string
  version: string
  endpoint_count?: number
}

const AUTH_COLORS: Record<string, string> = {
  bearer: '#22c55e',
  api_key: '#3b82f6',
  basic: '#f59e0b',
  oauth2: '#a855f7',
  none: '#6b7280',
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function PublicApiCollectionsPage(props: PageProps) {
  const { handle } = use(props.params)
  const [collections, setCollections] = useState<ApiCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ collections: ApiCollection[] }>(
          `/api/public/api-collections/${handle}`
        )
        setCollections(res.collections ?? [])
      } catch {
        setCollections([])
      }
      setLoading(false)
    }
    load()
  }, [handle])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading API collections...</p>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-collection"
          style={{ fontSize: 40, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: 0 }}>
          No public API collections
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <i className="bx bx-collection" style={{ fontSize: 22, color: 'var(--color-fg)' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
          API Collections
        </h2>
      </div>

      {/* Grid */}
      <div className="api-col-grid" style={gridStyle}>
        {collections.map((col) => {
          const authColor = AUTH_COLORS[col.auth_type] ?? AUTH_COLORS.none

          return (
            <Link
              key={col.id}
              href={`/@${handle}/apis/${col.slug}`}
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
                {/* Name + version */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg)' }}>
                    {col.name}
                  </span>
                  {col.version && (
                    <span style={versionBadgeStyle}>{col.version}</span>
                  )}
                </div>

                {/* Description */}
                {col.description && (
                  <p style={descriptionStyle}>{col.description}</p>
                )}

                {/* Base URL */}
                {col.base_url && (
                  <div style={baseUrlStyle}>{col.base_url}</div>
                )}

                {/* Footer: auth badge + endpoint count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <span style={{ ...authBadgeStyle, background: `${authColor}18`, color: authColor }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: authColor,
                        display: 'inline-block',
                        marginRight: 5,
                      }}
                    />
                    {col.auth_type || 'none'}
                  </span>
                  {col.endpoint_count !== undefined && col.endpoint_count > 0 && (
                    <span style={endpointCountStyle}>
                      {col.endpoint_count} endpoint{col.endpoint_count !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .api-col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
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
  padding: 18,
  transition: 'border-color 0.15s ease',
  cursor: 'pointer',
}

const versionBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 6,
  padding: '2px 7px',
}

const descriptionStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--color-fg-dim)',
  margin: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: '1.45',
}

const baseUrlStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'monospace',
  color: 'var(--color-fg-dim)',
  marginTop: 8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const authBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10,
  fontWeight: 600,
  borderRadius: 20,
  padding: '2px 9px',
}

const endpointCountStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 20,
  padding: '2px 9px',
}
