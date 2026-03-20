'use client'
import { use, useState, useMemo, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useRoleStore } from '@/store/roles'

interface NavItem {
  slug: string
  label: string
  icon: string
  group?: string
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { slug: 'profile', label: 'Profile', icon: 'bx-user', group: 'Account' },
  { slug: 'password', label: 'Password', icon: 'bx-lock' },
  { slug: 'appearance', label: 'Appearance', icon: 'bx-palette' },
  { slug: 'sponsor', label: 'Sponsors', icon: 'bx-heart' },
  { slug: 'privacy', label: 'Privacy', icon: 'bx-lock-alt', group: 'Privacy' },
  { slug: 'security', label: 'Two-Factor', icon: 'bx-shield-alt-2', group: 'Security' },
  { slug: 'passkeys', label: 'Passkeys', icon: 'bx-fingerprint' },
  { slug: 'sessions', label: 'Sessions', icon: 'bx-devices' },
  { slug: 'api-keys', label: 'API Keys', icon: 'bx-key', group: 'Developer' },
  { slug: 'integrations', label: 'Integrations', icon: 'bx-plug' },
  { slug: 'notifications', label: 'Notifications', icon: 'bx-bell', group: 'Notifications' },
  { slug: 'admin-general', label: 'General', icon: 'bx-cog', group: 'Administration', adminOnly: true },
  { slug: 'admin-features', label: 'Features', icon: 'bx-toggle-left', adminOnly: true },
  { slug: 'admin-homepage', label: 'Homepage', icon: 'bx-home', adminOnly: true },
  { slug: 'admin-agents', label: 'AI Agents', icon: 'bx-bot', adminOnly: true },
  { slug: 'admin-email', label: 'Email', icon: 'bx-envelope', adminOnly: true },
  { slug: 'admin-contact', label: 'Contact', icon: 'bx-message-square', adminOnly: true },
  { slug: 'admin-pricing', label: 'Pricing', icon: 'bx-dollar', adminOnly: true },
  { slug: 'admin-download', label: 'Downloads', icon: 'bx-download', adminOnly: true },
  { slug: 'admin-integrations', label: 'Integrations', icon: 'bx-plug', adminOnly: true },
  { slug: 'admin-seo', label: 'SEO', icon: 'bx-search-alt', adminOnly: true },
  { slug: 'admin-discord', label: 'Discord', icon: 'bxl-discord-alt', adminOnly: true },
  { slug: 'admin-slack', label: 'Slack', icon: 'bxl-slack', adminOnly: true },
  { slug: 'admin-github', label: 'GitHub', icon: 'bxl-github', adminOnly: true },
  { slug: 'admin-social', label: 'Social', icon: 'bx-share-alt', adminOnly: true },
  { slug: 'admin-prompts', label: 'Smart Prompts', icon: 'bx-bot', adminOnly: true },
  { slug: 'admin-notifications', label: 'Notifications', icon: 'bx-bell', adminOnly: true },
]

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}

export default function SettingsLayout({ children, params }: LayoutProps) {
  const { handle } = use(params)
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const { can } = useRoleStore()
  const isAdmin = can('canViewAdmin')
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const isOwner = !!user && (
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )

  // Close dropdown on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setSearch('')
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', onClickOutside)
      // Focus search on open
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [dropdownOpen])

  if (!isOwner) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-fg-muted)', fontSize: 13 }}>
        Settings are only visible to the profile owner.
      </div>
    )
  }

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin)
  const segments = pathname.split('/')
  const activeSlug = segments[segments.length - 1] === 'settings' ? 'profile' : segments[segments.length - 1]
  const activeItem = visibleItems.find(i => i.slug === activeSlug) ?? visibleItems[0]

  const filteredItems = search.trim()
    ? visibleItems.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase()) ||
        (item.group || '').toLowerCase().includes(search.toLowerCase())
      )
    : visibleItems

  function navigate(slug: string) {
    router.push(`/@${handle}/settings/${slug}`)
    setDropdownOpen(false)
    setSearch('')
  }

  // Keyboard navigation
  function onSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setDropdownOpen(false)
      setSearch('')
    }
    if (e.key === 'Enter' && filteredItems.length > 0) {
      navigate(filteredItems[0].slug)
    }
  }

  return (
    <div>
      {/* Header with dropdown navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
              border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              color: 'var(--color-fg, #f8f8f8)',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className={`bx ${activeItem.icon}`} style={{ fontSize: 16, color: 'var(--color-accent, #00e5ff)' }} />
              {activeItem.label}
            </span>
            <i className={`bx bx-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: 18, color: 'var(--color-fg-dim)' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 50,
              marginTop: 4, width: 280,
              borderRadius: 12, overflow: 'hidden',
              background: 'var(--color-bg, #0f0f12)',
              border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}>
              {/* Search */}
              <div style={{ padding: '8px 8px 4px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 10px', borderRadius: 8,
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                }}>
                  <i className="bx bx-search" style={{ fontSize: 14, color: 'var(--color-fg-dim)', flexShrink: 0 }} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder="Search settings..."
                    style={{
                      flex: 1, fontSize: 13, fontWeight: 400,
                      background: 'transparent', border: 'none', outline: 'none',
                      color: 'var(--color-fg, #f8f8f8)',
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <i className="bx bx-x" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ maxHeight: 360, overflowY: 'auto', padding: '0 4px 4px' }}>
                {filteredItems.length === 0 && (
                  <div style={{ padding: '16px 10px', textAlign: 'center', fontSize: 12, color: 'var(--color-fg-dim)' }}>
                    No settings found
                  </div>
                )}
                {(() => {
                  let lastGroup = ''
                  return filteredItems.map(item => {
                    const showGroup = !search.trim() && item.group && item.group !== lastGroup
                    if (item.group) lastGroup = item.group
                    const isActive = activeSlug === item.slug
                    return (
                      <div key={item.slug}>
                        {showGroup && (
                          <div style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.06em', padding: '10px 10px 4px',
                            color: 'var(--color-fg-dim, rgba(255,255,255,0.3))',
                          }}>
                            {item.group}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(item.slug)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                            background: isActive ? 'var(--color-bg-active, rgba(0,229,255,0.06))' : 'transparent',
                            color: isActive ? '#00e5ff' : 'var(--color-fg-muted)',
                            border: 'none', cursor: 'pointer', textAlign: 'start',
                          }}
                        >
                          <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center' }} />
                          {item.label}
                        </button>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
