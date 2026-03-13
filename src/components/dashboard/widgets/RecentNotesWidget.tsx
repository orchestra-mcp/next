'use client'

import { useTranslations } from 'next-intl'

export interface Note {
  id: string
  title: string
  updated_at: string
}

interface RecentNotesWidgetProps {
  notes: Note[]
}

export function RecentNotesWidget({ notes }: RecentNotesWidgetProps) {
  const t = useTranslations('dashboard')

  return (
    <div>
      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
          <i className="bx bx-note" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          {t('noNotesYet')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.map(n => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(169,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-note" style={{ fontSize: 14, color: '#a900ff' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title || t('untitled')}</div>
                <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>{new Date(n.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
