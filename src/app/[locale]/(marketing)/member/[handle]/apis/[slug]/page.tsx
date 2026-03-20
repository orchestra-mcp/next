'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { ApiDocRenderer } from '@/components/content/api-doc-renderer'
import { JsonLd } from '@/components/content/json-ld'
import { buildJsonLd } from '@/lib/seo'

interface ApiCollection {
  id: number
  name: string
  slug: string
  description: string
  base_url: string
  auth_type: string
  visibility: string
  version: string
}

interface ApiEndpoint {
  id: string
  name: string
  method: string
  path: string
  headers: any
  query_params: any
  body: string
  body_type: string
  description: string
  sort_order: number
  folder_path: string
}

const AUTH_COLORS: Record<string, string> = {
  bearer: '#22c55e',
  api_key: '#3b82f6',
  basic: '#f59e0b',
  oauth2: '#a855f7',
  none: '#6b7280',
}

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function PublicApiCollectionDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const [collection, setCollection] = useState<ApiCollection | null>(null)
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{
          collection: ApiCollection
          endpoints: ApiEndpoint[]
        }>(`/api/public/api-collections/${handle}/${slug}`)
        setCollection(res.collection)
        setEndpoints(res.endpoints ?? [])
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
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading collection...</p>
      </div>
    )
  }

  if (notFound || !collection) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-error-circle"
          style={{ fontSize: 36, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: '0 0 16px' }}>
          Collection not found
        </p>
        <Link
          href={`/@${handle}/apis`}
          style={{ fontSize: 13, color: '#00e5ff', textDecoration: 'none' }}
        >
          <i className="bx bx-arrow-back" style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Back to API Collections
        </Link>
      </div>
    )
  }

  const authColor = AUTH_COLORS[collection.auth_type] ?? AUTH_COLORS.none

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Link
          href={`/@${handle}/apis`}
          style={{ fontSize: 12, color: 'var(--color-fg-dim)', textDecoration: 'none' }}
        >
          API Collections
        </Link>
        <i className="bx bx-chevron-right" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
        <span style={{ fontSize: 12, color: 'var(--color-fg)', fontWeight: 600 }}>
          {collection.name}
        </span>
      </div>

      {/* Collection header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
            {collection.name}
          </h1>
          {collection.version && (
            <span style={versionBadgeStyle}>{collection.version}</span>
          )}
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
            {collection.auth_type || 'none'}
          </span>
        </div>

        {collection.description && (
          <p style={{ fontSize: 13, color: 'var(--color-fg-dim)', margin: '8px 0 0', lineHeight: '1.5' }}>
            {collection.description}
          </p>
        )}

        {collection.base_url && (
          <div style={baseUrlRowStyle}>
            <i className="bx bx-link" style={{ fontSize: 13, color: 'var(--color-fg-dim)', flexShrink: 0 }} />
            <code style={baseUrlCodeStyle}>{collection.base_url}</code>
          </div>
        )}
      </div>

      {/* Endpoints */}
      <ApiDocRenderer endpoints={endpoints} baseUrl={collection.base_url} />

      <JsonLd data={buildJsonLd({ title: collection.name, description: collection.description, handle, type: 'apis', slug })} />
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  padding: 20,
  marginBottom: 20,
}

const versionBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 6,
  padding: '2px 7px',
}

const authBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10,
  fontWeight: 600,
  borderRadius: 20,
  padding: '2px 9px',
}

const baseUrlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 10,
}

const baseUrlCodeStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: 'var(--color-fg-dim)',
}
