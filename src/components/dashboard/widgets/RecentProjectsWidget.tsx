'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
}

interface RecentProjectsWidgetProps {
  projects: Project[]
}

export function RecentProjectsWidget({ projects }: RecentProjectsWidgetProps) {
  const t = useTranslations('dashboard')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>{t('recentProjects')}</span>
        <Link href="/projects" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t('viewAll')} <i className="bx bx-right-arrow-alt rtl-flip" />
        </Link>
      </div>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
          <i className="bx bx-folder" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          {t('noProjectsYet')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects.slice(0, 5).map(p => (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
