'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export interface ApiCollectionItem {
  id: string
  name: string
  slug: string
  description?: string
  base_url?: string
  endpoint_count: number
  auth_type: string
  updated_at: string
}

interface ApiCollectionsWidgetProps {
  collections: ApiCollectionItem[]
}

const AUTH_DOT_COLORS: Record<string, string> = {
  bearer: '#22c55e',
  api_key: '#3b82f6',
  none: '#6b7280',
}

export function ApiCollectionsWidget({ collections }: ApiCollectionsWidgetProps) {
  const t = useTranslations('dashboard')

  return (
    <div>
      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
          <i className="bx bx-collection" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          {t('noCollectionsYet')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collections.slice(0, 5).map(c => (
            <Link key={c.id} href={`/api-collections/${c.slug || c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(124,77,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-collection" style={{ fontSize: 14, color: '#7c4dff' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                {(c.description || c.base_url) && <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description || c.base_url}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AUTH_DOT_COLORS[c.auth_type] || '#6b7280' }} />
                <span style={{ fontSize: 10, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap' }}>{c.endpoint_count} {c.endpoint_count === 1 ? 'endpoint' : 'endpoints'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
