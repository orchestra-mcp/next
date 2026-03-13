'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { TunnelSwitcher } from '@/components/tunnel-switcher'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bx-home-alt' },
  { href: '/projects', label: 'Projects', icon: 'bx-folder' },
  { href: '/repos', label: 'Version Control', icon: 'bx-git-branch' },
  { href: '/notes', label: 'Notes', icon: 'bx-note' },
  { href: '/settings', label: 'Settings', icon: 'bx-cog' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  return (
    <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, background: '#1a1520', borderInlineEnd: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Image src="/logo.svg" alt="Orchestra" width={26} height={26} />
        <span style={{ fontWeight: 700, fontSize: 16, color: '#f8f8f8', letterSpacing: '-0.02em' }}>Orchestra</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0 8px 8px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Workspace</div>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: active ? 500 : 400,
              color: active ? '#f8f8f8' : 'rgba(255,255,255,0.45)',
              background: active ? 'rgba(169,0,255,0.15)' : 'transparent',
              /* no left border */
              transition: 'all 0.15s',
            }}>
              <i className={`bx ${item.icon}`} style={{ fontSize: 16 }} />
              {item.label}
            </Link>
          )
        })}

        {/* Tunnel switcher */}
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <TunnelSwitcher />
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
              <Avatar size={28}>{user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}<AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback></Avatar>
              <div style={{ flex: 1, textAlign: 'start', overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#f8f8f8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'User'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email ?? ''}</div>
              </div>
              <i className="bx bx-dots-vertical-rounded" style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <i className="bx bx-cog" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); router.push('/login') }}>
              <i className="bx bx-log-out" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
