'use client'

import { useTranslations } from 'next-intl'

interface StatsWidgetProps {
  projectCount: number
  noteCount: number
  toolCount: number
  connStatus: string
}

const cardSt: React.CSSProperties = {
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  padding: '20px 22px',
}

export function StatsWidget({ projectCount, noteCount, toolCount, connStatus }: StatsWidgetProps) {
  const t = useTranslations('dashboard')

  const stats = [
    { icon: 'bx-folder', label: t('projects'), value: String(projectCount), color: '#00e5ff' },
    { icon: 'bx-note', label: t('notes'), value: String(noteCount), color: '#a900ff' },
    { icon: 'bx-bolt', label: t('aiTools'), value: String(toolCount || '-'), change: connStatus === 'connected' ? 'tunnel' : '', color: '#00e5ff' },
    { icon: 'bx-plug', label: t('plugins'), value: connStatus === 'connected' ? 'connected' : 'offline', color: connStatus === 'connected' ? '#22c55e' : '#6b7280' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
      {stats.map(s => (
        <div key={s.label} style={cardSt}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)' }}>{s.label}</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`bx ${s.icon}`} style={{ fontSize: 16, color: s.color }} />
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-fg)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
          {'change' in s && s.change && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 6 }}>{s.change}</div>}
        </div>
      ))}
    </div>
  )
}
