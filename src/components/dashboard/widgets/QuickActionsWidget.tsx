'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function QuickActionsWidget() {
  const t = useTranslations('dashboard')

  const actions = [
    { icon: 'bx-plus', label: t('newProject'), href: '/projects/new', color: '#00e5ff' },
    { icon: 'bx-file', label: t('newNote'), href: '/notes/new', color: '#a900ff' },
    { icon: 'bx-cog', label: t('settings'), href: '/settings', color: 'var(--color-fg-muted)' },
  ]

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {actions.map(action => (
        <Link
          key={action.label}
          href={action.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-alt)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-fg)',
            textDecoration: 'none',
          }}
        >
          <i className={`bx ${action.icon}`} style={{ fontSize: 15, color: action.color }} />
          {action.label}
        </Link>
      ))}
    </div>
  )
}
