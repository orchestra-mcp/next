'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useThemeStore } from '@/store/theme'

export default function AdminTeamsPage() {
  const router = useRouter()
  const { can, roleLoaded, team, members, allUsers, fetchTeam, fetchMembers, fetchAllUsers } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    if (!team) fetchTeam()
    if (members.length === 0) fetchMembers()
    if (allUsers.length === 0) fetchAllUsers()
  }, [roleLoaded])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'

  const planColors: Record<string, string> = {
    free: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
    pro: '#00e5ff',
    enterprise: '#a900ff',
  }

  if (!roleLoaded) {
    return (
      <div style={{ padding: '28px 32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 60, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', marginBottom: 14 }} />
        ))}
      </div>
    )
  }

  // In a real app this would list all teams; here we show the current team as a demo
  const teams = team ? [team] : []

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Teams</h1>
            <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{teams.length} team{teams.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: 'bx-buildings', label: 'Teams', value: String(teams.length), color: '#22c55e' },
          { icon: 'bx-group', label: 'Members', value: String(allUsers.length), color: '#00e5ff' },
          { icon: 'bx-check-circle', label: 'Active', value: String(allUsers.filter(u => u.status === 'active').length), color: '#22c55e' },
          { icon: 'bx-package', label: 'Plan', value: team?.plan ?? '—', color: planColors[team?.plan ?? 'free'] },
        ].map(s => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: textMuted }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: 15, color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1, textTransform: 'capitalize' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Teams list */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Team</div>
          <div>Slug</div>
          <div>Plan</div>
          <div>Members</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {teams.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <i className="bx bx-buildings" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: textMuted }}>No teams found</div>
          </div>
        ) : (
          teams.map((t, idx) => {
            const pc = planColors[t.plan]
            return (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: idx < teams.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
                {/* Team name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                    {(t.name || 'T')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{t.name}</div>
                    {t.description && <div style={{ fontSize: 11, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{t.description}</div>}
                  </div>
                </div>
                {/* Slug */}
                <div style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{t.slug}</div>
                {/* Plan */}
                <div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${pc}12`, color: pc, border: `1px solid ${pc}30`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {t.plan}
                  </span>
                </div>
                {/* Member count */}
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{t.member_count}</div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Link href="/team/settings"
                    style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    title="Edit team">
                    <i className="bx bx-edit-alt" />
                  </Link>
                  <Link href="/team/members"
                    style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid rgba(0,229,255,0.3)`, background: 'rgba(0,229,255,0.06)', color: '#00e5ff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    title="View members">
                    <i className="bx bx-group" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Members breakdown for this team */}
      {members.length > 0 && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${cardBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Team Members</div>
            <Link href="/team/members" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none' }}>Manage</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: divider }}>
            {members.map(m => {
              const statusColor = m.status === 'active' ? '#22c55e' : m.status === 'invited' ? '#f97316' : '#ef4444'
              return (
                <div key={m.id} style={{ background: cardBg, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                    {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                  </div>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, flexShrink: 0 }} title={m.status} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
