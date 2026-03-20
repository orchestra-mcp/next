'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export interface PresentationItem {
  id: string
  title: string
  slug: string
  description?: string
  slide_count: number
  visibility: string
  updated_at: string
}

interface PresentationsWidgetProps {
  presentations: PresentationItem[]
}

const VISIBILITY_ICONS: Record<string, string> = {
  private: 'bx-lock-alt',
  team: 'bx-group',
  public: 'bx-globe',
}

export function PresentationsWidget({ presentations }: PresentationsWidgetProps) {
  const t = useTranslations('dashboard')

  return (
    <div>
      {presentations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
          <i className="bx bx-slideshow" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          {t('noPresentationsYet')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {presentations.slice(0, 5).map(p => (
            <Link key={p.id} href={`/presentations/${p.slug || p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,109,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-slideshow" style={{ fontSize: 14, color: '#ff6d00' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                {p.description && <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <i className={`bx ${VISIBILITY_ICONS[p.visibility] || 'bx-globe'}`} style={{ fontSize: 12, color: 'var(--color-fg-dim)' }} />
                <span style={{ fontSize: 10, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap' }}>{p.slide_count} {p.slide_count === 1 ? 'slide' : 'slides'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
