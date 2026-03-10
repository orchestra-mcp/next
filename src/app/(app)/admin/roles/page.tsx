'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'

const PERMISSIONS = [
  { key: 'canManageUsers', label: 'Manage Users', desc: 'View, edit, suspend, delete any user' },
  { key: 'canManageRoles', label: 'Manage Roles', desc: 'Assign and change roles for any user' },
  { key: 'canManageTeam', label: 'Manage Team', desc: 'Edit team name, description, settings' },
  { key: 'canViewAdmin', label: 'Access Admin Panel', desc: 'View the admin dashboard and tools' },
  { key: 'canInviteMembers', label: 'Invite Members', desc: 'Send email invitations to join the team' },
  { key: 'canRemoveMembers', label: 'Remove Members', desc: 'Remove members from the team' },
  { key: 'canChangeRoles', label: 'Change Member Roles', desc: 'Update roles within the team' },
  { key: 'canViewBilling', label: 'View Billing', desc: 'View invoices and billing information' },
  { key: 'canManageBilling', label: 'Manage Billing', desc: 'Update payment methods, change plan' },
  { key: 'canDeleteTeam', label: 'Delete Team', desc: 'Permanently delete the team' },
] as const

const ROLES: Role[] = ['admin', 'team_owner', 'team_manager', 'user']

import { ROLE_PERMISSIONS } from '@/store/roles'

export default function AdminRolesPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const rowEven = 'var(--color-bg-alt)'
  const checkColor = '#22c55e'
  const crossColor = 'var(--color-border)'

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Roles & Permissions</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Permission matrix for all {ROLES.length} roles</p>
      </div>

      {/* Role cards row */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {ROLES.map(role => {
          const c = ROLE_COLORS[role]
          const perms = ROLE_PERMISSIONS[role]
          const grantedCount = Object.values(perms).filter(Boolean).length
          return (
            <div key={role} className="stat-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700, letterSpacing: '0.02em' }}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
              <div className="stat-value" style={{ fontSize: 24, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>{grantedCount}</div>
              <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>of {PERMISSIONS.length} permissions</div>
              <div style={{ marginTop: 12, height: 4, borderRadius: 100, background: 'var(--color-bg-active)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 100, background: c.color, width: `${(grantedCount / PERMISSIONS.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Permission matrix table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', overflowX: 'auto' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', padding: '12px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 500 }}>
          <div>Permission</div>
          {ROLES.map(r => {
            const c = ROLE_COLORS[r]
            return (
              <div key={r} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700 }}>
                  {ROLE_LABELS[r]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Rows */}
        {PERMISSIONS.map((perm, idx) => (
          <div
            key={perm.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr repeat(4, 1fr)',
              padding: '13px 20px',
              minWidth: 500,
              borderBottom: idx < PERMISSIONS.length - 1 ? `1px solid var(--color-bg-alt)` : 'none',
              alignItems: 'center',
              background: idx % 2 === 1 ? rowEven : 'transparent',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 2 }}>{perm.label}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{perm.desc}</div>
            </div>
            {ROLES.map(role => {
              const granted = ROLE_PERMISSIONS[role][perm.key]
              return (
                <div key={role} style={{ textAlign: 'center' }}>
                  {granted ? (
                    <i className="bx bx-check-circle" style={{ fontSize: 18, color: checkColor }} />
                  ) : (
                    <i className="bx bx-minus" style={{ fontSize: 16, color: crossColor }} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 12, color: textMuted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="bx bx-check-circle" style={{ color: checkColor, fontSize: 15 }} /> Permission granted
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <i className="bx bx-minus" style={{ color: crossColor, fontSize: 14 }} /> Not granted
        </span>
      </div>
    </div>
  )
}
