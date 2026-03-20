'use client'

import { useEffect, useState } from 'react'
import { useRoleStore } from '@/store/roles'
import { apiFetch, isDevSeed } from '@/lib/api'
import Link from 'next/link'

interface AutomationCounts {
  skills: number
  agents: number
}

export function TeamAutomationWidget() {
  const team = useRoleStore(s => s.team)
  const [counts, setCounts] = useState<AutomationCounts>({ skills: 0, agents: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!team?.id || isDevSeed()) {
      setLoading(false)
      return
    }

    Promise.all([
      apiFetch<{ skills: unknown[] }>(`/api/teams/${team.id}/skills`).then(r => r.skills?.length ?? 0).catch(() => 0),
      apiFetch<{ agents: unknown[] }>(`/api/teams/${team.id}/agents`).then(r => r.agents?.length ?? 0).catch(() => 0),
    ]).then(([skills, agents]) => {
      setCounts({ skills, agents })
    }).finally(() => setLoading(false))
  }, [team?.id])

  const items = [
    { icon: 'bx-terminal', label: 'Skills', count: counts.skills, href: '/skills', color: '#a900ff' },
    { icon: 'bx-bot', label: 'Agents', count: counts.agents, href: '/agents', color: '#00e5ff' },
  ]

  if (!team?.id) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
        <i className="bx bx-terminal" style={{ fontSize: 24, opacity: 0.4, display: 'block', marginBottom: 6 }} />
        Select a team to see automation
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map(item => (
        <Link
          key={item.label}
          href={item.href}
          style={{
            flex: 1, padding: '16px 14px', borderRadius: 10,
            background: 'var(--color-bg)', border: '1px solid var(--color-border)',
            textDecoration: 'none', textAlign: 'center',
            transition: 'border-color 0.15s',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${item.color}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <i className={`bx ${item.icon}`} style={{ fontSize: 18, color: item.color }} />
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, color: 'var(--color-fg)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            {loading ? '-' : item.count}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 4 }}>
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  )
}
