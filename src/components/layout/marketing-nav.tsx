'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/theme'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-provider'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { useTranslations } from 'next-intl'

export function MarketingNav() {
  const t = useTranslations()
  const { token, user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useThemeStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/docs', label: t('nav.docs') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/marketplace', label: t('nav.marketplace') },
    { href: '/solutions', label: t('nav.solutions') },
    { href: '/download', label: t('nav.download') },
  ]

  const isDark = theme === 'dark'
  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  const navBg = isDark ? 'rgba(15,15,18,0.88)' : 'rgba(255,255,255,0.92)'
  const navBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const logoColor = isDark ? '#f8f8f8' : '#0f0f12'
  const linkActive = isDark ? '#f8f8f8' : '#0f0f12'
  const linkMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const linkActiveBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const signInColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  const mobileMenuBg = isDark ? '#1a1520' : '#ffffff'
  const mobileMenuBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const mobileMenuDivider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const mobileLinkColor = isDark ? '#f8f8f8' : '#0f0f12'
  const mobileMutedColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  const hamburgerColor = isDark ? '#f8f8f8' : '#0f0f12'

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .nav-links { display: none !important; } .nav-mobile-btn { display: flex !important; } }
        @media (max-width: 480px) { .marketing-nav { padding: 0 16px !important; } .nav-logo-text { display: none !important; } }
      `}</style>
      <nav className="marketing-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 60,
        background: navBg, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${navBorder}`,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.svg" alt="Orchestra" width={28} height={28} />
          <span className="nav-logo-text" style={{ fontWeight: 700, fontSize: 17, color: logoColor, letterSpacing: '-0.02em' }}>Orchestra</span>
        </Link>

        {/* Nav links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px', borderRadius: 7, fontSize: 14, fontWeight: 500,
              color: pathname === l.href ? linkActive : linkMuted,
              background: pathname === l.href ? linkActiveBg : 'transparent',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { if (pathname !== l.href) (e.currentTarget.style.color = linkActive) }}
            onMouseLeave={e => { if (pathname !== l.href) (e.currentTarget.style.color = linkMuted) }}
            >{l.label}</Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitcher />
          <ThemeToggle size={34} />

          {token && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{
                  display: 'flex', alignItems: 'center', padding: '3px',
                  borderRadius: 50, border: '2px solid rgba(169,0,255,0.3)',
                  background: 'transparent', cursor: 'pointer',
                }}>
                  <Avatar style={{ width: 30, height: 30 }}>
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={initials} />}
                    <AvatarFallback style={{ fontSize: 11, fontWeight: 700 }}>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{ width: 220 }}>
                <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid var(--border, rgba(255,255,255,0.06))` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={initials} />}
                      <AvatarFallback style={{ fontSize: 13, fontWeight: 700 }}>{initials}</AvatarFallback>
                    </Avatar>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <i className="bx bx-grid-alt" style={{ marginInlineEnd: 8 }} /> {t('nav.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <i className="bx bx-cog" style={{ marginInlineEnd: 8 }} /> {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); router.push('/') }} style={{ color: '#ef4444' }}>
                  <i className="bx bx-log-out" style={{ marginInlineEnd: 8 }} /> {t('common.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" style={{ padding: '7px 16px', borderRadius: 7, fontSize: 14, fontWeight: 500, color: signInColor, textDecoration: 'none' }}>{t('common.signIn')}</Link>
              <Link href="/register" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none' }}>{t('common.getStarted')}</Link>
            </>
          )}

          <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', padding: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: hamburgerColor }}>
            <i className={`bx ${mobileOpen ? 'bx-x' : 'bx-menu'}`} style={{ fontSize: 22 }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, background: mobileMenuBg, borderBottom: `1px solid ${mobileMenuBorder}`, padding: '12px 16px', zIndex: 49, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', borderRadius: 8, fontSize: 15, color: mobileLinkColor, textDecoration: 'none' }}>{l.label}</Link>
          ))}
          <div style={{ height: 1, background: mobileMenuDivider, margin: '8px 0' }} />
          {token && user ? (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', fontSize: 15, color: mobileMutedColor, textDecoration: 'none' }}>{t('nav.dashboard')}</Link>
              <button onClick={() => { logout(); router.push('/'); setMobileOpen(false) }} style={{ padding: '10px 14px', fontSize: 15, color: '#ef4444', textAlign: 'start', background: 'none', border: 'none', cursor: 'pointer' }}>{t('common.signOut')}</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', fontSize: 15, color: mobileMutedColor, textDecoration: 'none' }}>{t('common.signIn')}</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} style={{ padding: '10px 14px', fontSize: 15, fontWeight: 600, color: '#00e5ff', textDecoration: 'none' }}>{t('common.getStarted')} &rarr;</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
