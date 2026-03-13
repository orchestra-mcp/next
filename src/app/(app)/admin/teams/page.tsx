'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { apiFetch } from '@/lib/api'

interface AdminTeam {
  id: string
  name: string
  slug: string
  plan: string
  avatar_url?: string
  member_count: number
  owner_name?: string
  created_at: string
}

export default function AdminTeamsPage() {
  const router = useRouter()
  const { can, roleLoaded, allUsers, fetchAllUsers } = useRoleStore()
  const [allTeams, setAllTeams] = useState<AdminTeam[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    if (allUsers.length === 0) fetchAllUsers()
    // Fetch ALL teams system-wide (admin endpoint)
    setTeamsLoading(true)
    apiFetch<{ teams: AdminTeam[] }>('/api/admin/teams')
      .then(res => setAllTeams(res.teams ?? []))
      .catch(() => setAllTeams([]))
      .finally(() => setTeamsLoading(false))
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const rowBorder = 'var(--color-bg-alt)'

  const planColors: Record<string, string> = {
    free: 'var(--color-fg-muted)',
    pro: '#00e5ff',
    enterprise: '#a900ff',
  }

  if (!roleLoaded || teamsLoading) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 60, borderRadius: 10, background: 'var(--color-bg-alt)', marginBottom: 14 }} />
        ))}
      </div>
    )
  }

  const totalMembers = allTeams.reduce((sum, t) => sum + t.member_count, 0)

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Teams</h1>
            <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{allTeams.length} team{allTeams.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: 'bx-buildings', label: 'Teams', value: String(allTeams.length), color: '#22c55e' },
          { icon: 'bx-group', label: 'Members', value: String(totalMembers), color: '#00e5ff' },
          { icon: 'bx-check-circle', label: 'Active', value: String(allUsers.filter(u => u.status === 'active').length), color: '#22c55e' },
          { icon: 'bx-package', label: 'Plans', value: `${allTeams.filter(t => t.plan === 'pro').length} Pro / ${allTeams.filter(t => t.plan === 'enterprise').length} Ent`, color: '#a900ff' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: textMuted }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: 15, color: s.color }} />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: 26, fontWeight: 700, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1, textTransform: 'capitalize' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Teams list */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Team</div>
          <div className="hide-mobile">Slug</div>
          <div>Plan</div>
          <div className="hide-mobile">Owner</div>
          <div className="hide-mobile">Members</div>
          <div style={{ textAlign: 'end' }}>Actions</div>
        </div>

        {allTeams.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <i className="bx bx-buildings" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: textMuted }}>No teams found</div>
          </div>
        ) : (
          allTeams.map((t, idx) => {
            const pc = planColors[t.plan] ?? 'var(--color-fg-muted)'
            return (
              <div key={t.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: idx < allTeams.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
                {/* Team name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                      {(t.name || 'T')[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{t.name}</div>
                </div>
                {/* Slug */}
                <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{t.slug}</div>
                {/* Plan */}
                <div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${pc}12`, color: pc, border: `1px solid ${pc}30`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {t.plan}
                  </span>
                </div>
                {/* Owner */}
                <div className="hide-mobile" style={{ fontSize: 12, color: textMuted }}>{t.owner_name || '—'}</div>
                {/* Member count */}
                <div className="hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{t.member_count}</div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Link href={`/admin/teams/${t.id}`}
                    style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    title="View team details">
                    <i className="bx bx-show" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
