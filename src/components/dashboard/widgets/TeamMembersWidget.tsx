'use client'

import { useEffect, useState } from 'react'
import { useRoleStore } from '@/store/roles'
import { apiFetch, isDevSeed } from '@/lib/api'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: string
  status?: 'online' | 'away' | 'offline'
}

const ROLE_COLORS: Record<string, string> = {
  owner: '#a900ff',
  admin: '#00e5ff',
  member: '#22c55e',
  viewer: '#6b7280',
}

function gravatarUrl(email: string, size: number) {
  return `https://www.gravatar.com/avatar/${email.trim().toLowerCase()}?s=${size}&d=mp`
}

export function TeamMembersWidget() {
  const team = useRoleStore(s => s.team)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!team?.id || isDevSeed()) {
      setLoading(false)
      return
    }
    apiFetch<{ members: TeamMember[] }>(`/api/teams/${team.id}/members`)
      .then(res => setMembers(res.members ?? []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [team?.id])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg-active)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'var(--color-bg-active)' }} />
              <div style={{ height: 10, width: '40%', borderRadius: 4, background: 'var(--color-bg-active)', marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!team?.id) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
        <i className="bx bx-group" style={{ fontSize: 24, opacity: 0.4, display: 'block', marginBottom: 6 }} />
        Select a team to see members
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
        No team members found
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {members.slice(0, 8).map(m => {
        const roleColor = ROLE_COLORS[m.role] || '#6b7280'
        return (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px', borderRadius: 8,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={m.avatar_url || gravatarUrl(m.email, 64)}
                alt={m.name}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              {m.status && (
                <span style={{
                  position: 'absolute', bottom: -1, right: -1,
                  width: 10, height: 10, borderRadius: '50%',
                  background: m.status === 'online' ? '#22c55e' : m.status === 'away' ? '#f59e0b' : '#6b7280',
                  border: '2px solid var(--color-bg-alt)',
                }} />
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-fg)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{m.name}</div>
              <div style={{
                fontSize: 11, color: 'var(--color-fg-dim)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{m.email}</div>
            </div>
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 4,
              background: `${roleColor}15`, color: roleColor,
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {m.role}
            </span>
          </div>
        )
      })}
      {members.length > 8 && (
        <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', textAlign: 'center', paddingTop: 4 }}>
          +{members.length - 8} more
        </div>
      )}
    </div>
  )
}
