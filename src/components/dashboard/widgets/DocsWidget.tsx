'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export interface DocItem {
  id: string
  title: string
  doc_id: string
  category?: string
  published: boolean
  updated_at: string
  word_count: number
}

interface DocsWidgetProps {
  docs: DocItem[]
}

export function DocsWidget({ docs }: DocsWidgetProps) {
  const t = useTranslations('dashboard')

  return (
    <div>
      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
          <i className="bx bx-file" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          {t('noDocsYet')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.slice(0, 5).map(d => (
            <Link key={d.id} href={`/docs/${d.doc_id || d.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(0,200,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-file" style={{ fontSize: 14, color: '#00c853' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                {d.category && <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.category}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.published ? '#22c55e' : '#6b7280' }} />
                <span style={{ fontSize: 10, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap' }}>{d.word_count} {d.word_count === 1 ? 'word' : 'words'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
