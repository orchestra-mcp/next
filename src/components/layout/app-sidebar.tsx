'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRoleStore } from '@/store/roles'

// ── Static nav items for Settings ────────────────────────────

interface StaticNavItem {
  id: string
  label: string
  icon: string
  href: string
  color?: string
  group?: string
  adminOnly?: boolean
}

const SETTINGS_NAV: StaticNavItem[] = [
  // ── Account ──
  { id: 'profile', label: 'Profile', icon: 'bx-user', href: '/settings?tab=profile' },
  { id: 'password', label: 'Password', icon: 'bx-lock', href: '/settings?tab=password' },
  { id: 'appearance', label: 'Appearance', icon: 'bx-palette', href: '/settings?tab=appearance' },
  // ── Security ──
  { id: '2fa', label: 'Two-Factor Auth', icon: 'bx-shield-alt-2', href: '/settings?tab=2fa', group: 'Security' },
  { id: 'passkeys', label: 'Passkeys', icon: 'bx-fingerprint', href: '/settings?tab=passkeys' },
  { id: 'sessions', label: 'Sessions', icon: 'bx-devices', href: '/settings?tab=sessions' },
  // ── Developer ──
  { id: 'apitokens', label: 'API Tokens', icon: 'bx-key', href: '/settings?tab=apitokens', group: 'Developer' },
  { id: 'integrations', label: 'Integrations', icon: 'bx-plug', href: '/settings?tab=integrations' },
  // ── Notifications ──
  { id: 'push', label: 'Notifications', icon: 'bx-bell', href: '/settings?tab=push', group: 'Notifications' },
  // ── Administration (admin only) ──
  { id: 'admin-general', label: 'General', icon: 'bx-cog', href: '/settings?tab=admin-general', group: 'Administration', adminOnly: true },
  { id: 'admin-features', label: 'Features', icon: 'bx-toggle-left', href: '/settings?tab=admin-features', adminOnly: true },
  { id: 'admin-homepage', label: 'Homepage', icon: 'bx-home', href: '/settings?tab=admin-homepage', adminOnly: true },
  { id: 'admin-agents', label: 'AI Agents', icon: 'bx-bot', href: '/settings?tab=admin-agents', adminOnly: true },
  { id: 'admin-email', label: 'Email', icon: 'bx-envelope', href: '/settings?tab=admin-email', adminOnly: true },
  { id: 'admin-contact', label: 'Contact', icon: 'bx-message-square', href: '/settings?tab=admin-contact', adminOnly: true },
  { id: 'admin-pricing', label: 'Pricing', icon: 'bx-dollar', href: '/settings?tab=admin-pricing', adminOnly: true },
  { id: 'admin-download', label: 'Downloads', icon: 'bx-download', href: '/settings?tab=admin-download', adminOnly: true },
  { id: 'admin-integrations', label: 'Integrations', icon: 'bx-plug', href: '/settings?tab=admin-integrations', adminOnly: true },
  { id: 'admin-seo', label: 'SEO', icon: 'bx-search', href: '/settings?tab=admin-seo', adminOnly: true },
  { id: 'admin-discord', label: 'Discord', icon: 'bxl-discord', href: '/settings?tab=admin-discord', adminOnly: true },
  { id: 'admin-slack', label: 'Slack', icon: 'bxl-slack', href: '/settings?tab=admin-slack', adminOnly: true },
  { id: 'admin-github', label: 'GitHub', icon: 'bxl-github', href: '/settings?tab=admin-github', adminOnly: true },
  { id: 'admin-social', label: 'Social', icon: 'bx-share-alt', href: '/settings?tab=admin-social', adminOnly: true },
]

// ── Component ────────────────────────────────────────────────

export interface AppSidebarProps {
  section: string
}

export function AppSidebar({ section }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { can } = useRoleStore()
  const isAdmin = can('canViewAdmin')

  if (section !== 'settings') return null

  const activeTab = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('tab') ?? ''
    : ''

  const isActive = (item: StaticNavItem) => {
    const url = new URL(item.href, 'http://x')
    const tab = url.searchParams.get('tab') ?? ''
    if (tab) return activeTab === tab
    return pathname === url.pathname
  }

  const visibleItems = SETTINGS_NAV.filter(item => !item.adminOnly || isAdmin)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--color-bg-sidebar, var(--color-bg-alt))',
      borderRight: '1px solid var(--color-border)',
      width: 220,
    }}>
      <div style={{
        padding: '12px 10px 6px',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--color-fg-dim)',
      }}>
        Settings
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '2px 8px 12px' }}>
        {visibleItems.map(item => {
          const active = isActive(item)
          return (
            <div key={item.id}>
              {item.group && (
                <div style={{
                  padding: '10px 10px 4px',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--color-fg-dim)',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: 6, marginBottom: 2,
                }}>
                  {item.group}
                </div>
              )}
              <button
                type="button"
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 10px', borderRadius: 7, border: 'none',
                  background: active ? 'var(--color-bg-active, rgba(169,0,255,0.08))' : 'transparent',
                  color: active ? (item.color ?? '#a900ff') : 'var(--color-fg-muted)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.12s, color 0.12s',
                  marginBottom: 1,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-bg-hover, rgba(255,255,255,0.05))' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <i className={`bx ${item.icon}`} style={{
                  fontSize: 16, flexShrink: 0,
                  color: active ? (item.color ?? '#a900ff') : 'var(--color-fg-dim)',
                }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </button>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
