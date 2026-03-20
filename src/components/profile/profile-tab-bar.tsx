'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfileTheme } from './use-profile-theme'

interface TabItem {
  label: string
  href: string
  icon: string
  exact?: boolean
}

interface ProfileTabBarProps {
  handle: string
  items?: TabItem[]
}

const DEFAULT_ITEMS = (basePath: string): TabItem[] => [
  { label: 'Profile',      href: basePath,                 icon: 'bx-user',       exact: true },
  { label: 'Edit Profile', href: `${basePath}/edit`,       icon: 'bx-edit-alt' },
  { label: 'Social Links', href: `${basePath}/social`,     icon: 'bx-link' },
  { label: 'Settings',     href: `${basePath}/settings`,   icon: 'bx-cog' },
  { label: 'Appearance',   href: `${basePath}/appearance`, icon: 'bx-palette' },
  { label: 'Privacy',      href: `${basePath}/privacy`,    icon: 'bx-lock-alt' },
  { label: 'Sponsor',      href: `${basePath}/sponsor`,    icon: 'bx-heart' },
]

export default function ProfileTabBar({ handle, items }: ProfileTabBarProps) {
  const pathname = usePathname()
  const { isDark, colors } = useProfileTheme()

  const basePath = `/@${handle}`
  const navItems = items || DEFAULT_ITEMS(basePath)

  function isActive(item: TabItem): boolean {
    const cleaned = pathname.replace(/^\/(en|ar)/, '')
    const rewrittenBase = `/member/${handle}`
    const normalizedPath = cleaned.startsWith(rewrittenBase)
      ? cleaned.replace(rewrittenBase, basePath)
      : cleaned
    if (item.exact) return normalizedPath === item.href
    return normalizedPath.startsWith(item.href)
  }

  return (
    <nav
      className="flex items-center overflow-x-auto scrollbar-none"
      style={{
        borderBottom: `1px solid ${colors.cardBorder}`,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {navItems.map(item => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative inline-flex items-center gap-[7px] px-4 py-3 text-[13.5px] font-medium whitespace-nowrap no-underline flex-shrink-0 transition-colors duration-150 hover:bg-white/5"
            style={{
              color: active ? colors.textPrimary : colors.textMuted,
              fontWeight: active ? 600 : 500,
              borderBottom: active
                ? `2px solid ${colors.accent}`
                : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            <i
              className={`bx ${item.icon}`}
              style={{
                fontSize: 16,
                color: active ? colors.accent : colors.textMuted,
              }}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
