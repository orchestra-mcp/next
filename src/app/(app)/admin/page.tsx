'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { useThemeStore } from '@/store/theme'
import { apiFetch } from '@/lib/api'

const ROLES: Role[] = ['admin', 'team_owner', 'team_manager', 'user']

export default function AdminPage() {
  const router = useRouter()
  const { can, roleLoaded, allUsers, team, fetchAllUsers, fetchTeam } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [devPanel, setDevPanel] = useState(false)
  const [comingSoon, setComingSoon] = useState(false)
  const [comingSoonLoading, setComingSoonLoading] = useState(false)

  useEffect(() => {
    setDevPanel(localStorage.getItem('show_dev_panel') === 'true')
  }, [])

  useEffect(() => {
    apiFetch<{ value: { enabled: boolean } }>('/api/admin/settings/coming_soon')
      .then(res => setComingSoon(res?.value?.enabled === true))
      .catch(() => {})
  }, [])

  const toggleComingSoon = async () => {
    const next = !comingSoon
    setComingSoonLoading(true)
    try {
      await apiFetch('/api/admin/settings/coming_soon', {
        method: 'PATCH',
        body: JSON.stringify({ enabled: next, message: "We're putting the finishing touches on something amazing. Stay tuned!", title: 'Coming Soon' }),
      })
      setComingSoon(next)
    } catch {}
    setComingSoonLoading(false)
  }

  const toggleDevPanel = () => {
    const next = !devPanel
    localStorage.setItem('show_dev_panel', String(next))
    setDevPanel(next)
  }

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    if (allUsers.length === 0) fetchAllUsers()
    if (!team) fetchTeam()
  }, [roleLoaded])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'

  // Computed stats
  const totalUsers = allUsers.length
  const activeUsers = allUsers.filter(u => u.status === 'active').length
  const invitedUsers = allUsers.filter(u => u.status === 'invited').length
  const suspendedUsers = allUsers.filter(u => u.status === 'suspended').length

  const stats = [
    { icon: 'bx-group', label: 'Total Users', value: String(totalUsers), color: '#00e5ff' },
    { icon: 'bx-check-circle', label: 'Active', value: String(activeUsers), color: '#22c55e' },
    { icon: 'bx-envelope', label: 'Invited', value: String(invitedUsers), color: '#f97316' },
    { icon: 'bx-block', label: 'Suspended', value: String(suspendedUsers), color: '#ef4444' },
  ]

  const tools = [
    { href: '/admin/users', icon: 'bx-group', label: 'Users', desc: 'View, search, edit roles, suspend accounts', color: '#00e5ff' },
    { href: '/admin/roles', icon: 'bx-key', label: 'Roles & Permissions', desc: 'Full permission matrix for all 4 roles', color: '#a900ff' },
    { href: '/admin/teams', icon: 'bx-buildings', label: 'Teams', desc: 'Manage teams, members, plan and settings', color: '#22c55e' },
    { href: '/settings', icon: 'bx-cog', label: 'System Settings', desc: 'API tokens, integrations, configuration', color: '#f97316' },
  ]

  // Show loading skeleton while role hasn't been confirmed yet
  if (!roleLoaded) {
    return (
      <div style={{ padding: '28px 32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 60, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', marginBottom: 14 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bx bx-shield-alt-2" style={{ fontSize: 18, color: '#ef4444' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Admin Panel</h1>
        </div>
        <p style={{ fontSize: 13, color: textMuted }}>System overview — users, roles, teams, and settings.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: textMuted }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: 15, color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left: Admin tools + Teams + Users preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Admin tools grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>Admin Tools</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {tools.map(s => (
                <Link key={s.href} href={s.href} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 20px', textDecoration: 'none', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bx ${s.icon}`} style={{ fontSize: 19, color: s.color }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: textMuted, lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                  <i className="bx bx-right-arrow-alt" style={{ fontSize: 16, color: textDim, flexShrink: 0, alignSelf: 'center' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent users table */}
          {allUsers.length > 0 && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${cardBorder}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Users</div>
                <Link href="/admin/users" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none' }}>View all</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '9px 18px', borderBottom: `1px solid ${divider}`, fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <div>Name</div><div>Email</div><div>Role</div><div>Status</div>
              </div>
              {allUsers.slice(0, 6).map((u, idx) => {
                const c = ROLE_COLORS[u.role]
                const statusColor = u.status === 'active' ? '#22c55e' : u.status === 'invited' ? '#f97316' : '#ef4444'
                return (
                  <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '11px 18px', borderBottom: idx < 5 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                        {u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    <div>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: statusColor }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column: Team info + Roles breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Team card */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${cardBorder}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Team</div>
              <Link href="/team" style={{ fontSize: 12, color: '#22c55e', textDecoration: 'none' }}>Manage</Link>
            </div>
            {team ? (
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                    {(team.name || 'T')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 2 }}>{team.name}</div>
                    <div style={{ fontSize: 11, color: textDim, fontFamily: 'monospace' }}>{team.slug}</div>
                  </div>
                </div>
                {team.description && <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5, marginBottom: 14 }}>{team.description}</div>}
                <div style={{ display: 'flex', gap: 14, paddingTop: 12, borderTop: `1px solid ${divider}` }}>
                  {[
                    { label: 'Members', value: team.member_count },
                    { label: 'Plan', value: team.plan.charAt(0).toUpperCase() + team.plan.slice(1) },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 18px', textAlign: 'center', color: textDim, fontSize: 13 }}>
                {allUsers.length === 0 ? 'No team data' : 'Loading…'}
              </div>
            )}
          </div>

          {/* Role breakdown */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${cardBorder}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Roles</div>
              <Link href="/admin/roles" style={{ fontSize: 12, color: '#a900ff', textDecoration: 'none' }}>Permissions</Link>
            </div>
            {ROLES.map((role, idx) => {
              const c = ROLE_COLORS[role]
              const count = allUsers.filter(u => u.role === role).length
              const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0
              return (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: idx < ROLES.length - 1 ? `1px solid ${rowBorder}` : 'none' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700, flexShrink: 0, minWidth: 88, textAlign: 'center' }}>
                    {ROLE_LABELS[role]}
                  </span>
                  <div style={{ flex: 1, height: 5, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: c.color, width: `${pct}%`, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary, flexShrink: 0, minWidth: 16, textAlign: 'right' }}>{count}</span>
                </div>
              )
            })}
          </div>
          {/* Coming soon toggle */}
          <div style={{ background: cardBg, border: `1px solid ${comingSoon ? 'rgba(249,115,22,0.3)' : cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bx bx-time-five" style={{ fontSize: 14, color: comingSoon ? '#f97316' : textMuted }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Coming Soon</span>
              {comingSoon && (
                <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)', fontWeight: 600 }}>
                  ACTIVE
                </span>
              )}
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 2 }}>Coming Soon Mode</div>
                <div style={{ fontSize: 11.5, color: textMuted }}>
                  {comingSoon ? 'All visitors see the coming soon page. Admins bypass it.' : 'Site is publicly accessible.'}
                </div>
              </div>
              <button
                onClick={toggleComingSoon}
                disabled={comingSoonLoading}
                style={{
                  width: 40, height: 22, borderRadius: 100, border: 'none', cursor: comingSoonLoading ? 'not-allowed' : 'pointer', flexShrink: 0,
                  background: comingSoon ? '#f97316' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                  position: 'relative', transition: 'background 0.2s', opacity: comingSoonLoading ? 0.6 : 1,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: comingSoon ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', display: 'block',
                }} />
              </button>
            </div>
          </div>

          {/* Dev panel toggle */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bx bx-code-alt" style={{ fontSize: 14, color: isDark ? 'rgba(255,229,0,0.6)' : 'rgba(160,130,0,0.8)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Developer</span>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 2 }}>Dev Quick Access</div>
                <div style={{ fontSize: 11.5, color: textMuted }}>Show seed login shortcuts on the login page</div>
              </div>
              <button
                onClick={toggleDevPanel}
                style={{
                  width: 40, height: 22, borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: devPanel ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'),
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: devPanel ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', display: 'block',
                }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
