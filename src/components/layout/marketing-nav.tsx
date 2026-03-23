'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-provider'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { SearchSpotlight } from '@orchestra-mcp/search'
import type { SearchResult } from '@orchestra-mcp/search'
import { useSettingsStore } from '@/store/settings'
import { useTranslations } from 'next-intl'
import { useFeatureFlagsStore } from '@/store/feature-flags'


// Static searchable content for the marketing site
const SEARCH_INDEX: { id: string; title: string; description: string; type: string; url: string; keywords: string }[] = [
  // Blog posts
  { id: 'post-v1-release', type: 'post', title: 'Orchestra v1.0.0 — GA Release', description: '290 tools, 36 plugins, 17 official packs, 5 platforms. Single-process in-process architecture.', url: '/blog/orchestra-v1-release', keywords: 'release launch ga v1 announcement' },
  { id: 'post-in-process', type: 'post', title: 'Why We Switched to In-Process Architecture', description: 'We replaced our QUIC plugin mesh with an in-process single-binary design for local IDE use.', url: '/blog/in-process-architecture', keywords: 'architecture quic binary plugin mesh' },
  { id: 'post-rag-engine', type: 'post', title: 'The RAG Memory Engine', description: 'How Orchestra\'s Rust-powered engine.rag plugin delivers Tree-sitter parsing, Tantivy search, and SQLite vector memory.', url: '/blog/rag-memory-engine', keywords: 'rag memory engine rust tantivy tree-sitter sqlite vector search' },
  { id: 'post-multi-agent', type: 'post', title: 'Multi-Agent Orchestration', description: 'Define agents, run workflows, compare providers. How agent.orchestrator manages Claude, OpenAI, Gemini, and Ollama.', url: '/blog/multi-agent-orchestration', keywords: 'agent orchestration workflow claude openai gemini ollama provider' },
  { id: 'post-introducing', type: 'post', title: 'Introducing Orchestra: The AI-native IDE', description: 'A unified plugin backbone connecting Claude, project trackers, vector databases, and CLI tools via MCP.', url: '/blog/introducing-orchestra', keywords: 'introduction mcp ide plugin backbone' },
  // Documentation
  { id: 'doc-docs', type: 'doc', title: 'Documentation', description: 'Guides, tutorials, and API reference for Orchestra MCP.', url: '/docs', keywords: 'docs documentation guide tutorial api reference' },
  { id: 'doc-marketplace', type: 'doc', title: 'Marketplace', description: 'Browse and install packs — curated skills, agents, and hooks for your workflow.', url: '/marketplace', keywords: 'marketplace packs skills agents hooks install' },
  { id: 'doc-download', type: 'doc', title: 'Download Orchestra', description: 'Get Orchestra for your IDE — Claude Code, Cursor, VS Code, Windsurf, and more.', url: '/download', keywords: 'download install ide claude cursor vscode windsurf' },
  { id: 'doc-solutions', type: 'doc', title: 'Solutions', description: 'Use cases and workflows for teams using Orchestra MCP.', url: '/solutions', keywords: 'solutions use cases workflows teams' },
  // Community pages
  { id: 'page-community', type: 'doc', title: 'Community', description: 'Join the Orchestra community — Discord, GitHub, and more.', url: '/community', keywords: 'community discord github social' },
  { id: 'page-sponsors', type: 'doc', title: 'Sponsors', description: 'Support the Orchestra project and help us build the future of AI development.', url: '/sponsors', keywords: 'sponsors support donate funding' },
  { id: 'page-blog', type: 'doc', title: 'Blog', description: 'Updates, releases, and articles from the Orchestra team.', url: '/blog', keywords: 'blog posts articles updates releases' },
  { id: 'page-contact', type: 'doc', title: 'Contact', description: 'Get in touch with the Orchestra team.', url: '/contact', keywords: 'contact support help email' },
  { id: 'page-privacy', type: 'doc', title: 'Privacy Policy', description: 'Orchestra MCP privacy policy and data handling practices.', url: '/privacy', keywords: 'privacy policy data gdpr' },
  { id: 'page-terms', type: 'doc', title: 'Terms of Service', description: 'Orchestra MCP terms of service and usage conditions.', url: '/terms', keywords: 'terms service legal tos' },
]

const NOTIF_TYPE_META: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'bx-info-circle',  color: '#00e5ff' },
  success: { icon: 'bx-check-circle', color: '#22c55e' },
  warning: { icon: 'bx-error',        color: '#f97316' },
  error:   { icon: 'bx-x-circle',     color: '#ef4444' },
}

function notifTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface NavGroup {
  title: string
  links: { href: string; label: string; icon: string; desc: string }[]
}

export function MarketingNav() {
  const t = useTranslations()
  const { mcpToken: token, user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const { notifications, fetchNotifications, markNotificationRead, markAllRead } = useSettingsStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  // Fetch notifications when logged in
  useEffect(() => {
    if (token && user) fetchNotifications()
  }, [token, user, fetchNotifications])

  // CMD+K shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Track search result URLs
  const searchUrlMapRef = useRef<Record<string, string>>({})

  // Search handler — client-side search across static marketing content
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) { setSearchResults([]); return }
    const q = query.toLowerCase()
    const matched = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    )
    const urlMap: Record<string, string> = {}
    const iconForType = (type: string) =>
      type === 'doc' ? <i className="bx bx-book-open" style={{ fontSize: 14, color: '#f97316' }} /> :
      type === 'post' ? <i className="bx bx-news" style={{ fontSize: 14, color: '#00e5ff' }} /> :
      type === 'pack' ? <i className="bx bx-package" style={{ fontSize: 14, color: '#a900ff' }} /> :
      type === 'profile' ? <i className="bx bx-user" style={{ fontSize: 14, color: '#22c55e' }} /> :
      <i className="bx bx-search" style={{ fontSize: 14, color: '#888' }} />
    setSearchResults(matched.map(r => {
      urlMap[r.id] = r.url
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.type,
        icon: iconForType(r.type),
      }
    }))
    searchUrlMapRef.current = urlMap
  }, [])

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchOpen(false)
    setSearchResults([])
    const url = searchUrlMapRef.current[result.id]
    if (url) router.push(url)
  }, [router])

  // Close notification dropdown on outside click
  const notifRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!notifOpen) return
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const { isEnabled } = useFeatureFlagsStore()

  // Map href paths to feature flag keys
  const hrefToFeature: Record<string, string> = {
    '/docs': 'docs', '/marketplace': 'marketplace', '/download': 'download',
    '/solutions': 'solutions', '/blog': 'blog', '/community': 'community',
    '/sponsors': 'sponsors', '/issues': 'issues', '/contact': 'contact',
  }

  const filterLinks = (links: NavLink[]) => links.filter(l => {
    const feature = hrefToFeature[l.href]
    return !feature || isEnabled(feature)
  })

  const navGroups: NavGroup[] = [
    {
      title: t('footer.product'),
      links: filterLinks([
        { href: '/docs', label: t('nav.docs'), icon: 'bx-book-open', desc: 'Guides, tutorials & API reference' },
        { href: '/marketplace', label: t('nav.marketplace'), icon: 'bx-store', desc: 'Browse & install packs' },
        { href: '/download', label: t('nav.download'), icon: 'bx-download', desc: 'Get Orchestra for your IDE' },
        { href: '/solutions', label: t('nav.solutions'), icon: 'bx-bulb', desc: 'Use cases & workflows' },
      ]),
    },
    {
      title: t('footer.company'),
      links: filterLinks([
        { href: '/blog', label: t('nav.blog'), icon: 'bx-news', desc: 'Updates, releases & articles' },
        { href: '/community', label: t('nav.community'), icon: 'bx-group', desc: 'Join the community' },
        { href: '/sponsors', label: t('nav.sponsors'), icon: 'bx-heart', desc: 'Support the project' },
        { href: '/issues', label: t('nav.issues'), icon: 'bx-bug', desc: 'Report bugs & request features' },
      ]),
    },
  ].filter(g => g.links.length > 0)

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  // Colors — using CSS variables for theme support
  const navBg = 'var(--color-bg)'
  const navBorder = 'var(--color-border)'
  const logoColor = 'var(--color-fg)'
  const overlayBg = 'var(--color-bg)'
  const groupTitle = 'var(--color-fg-dim)'
  const linkColor = 'var(--color-fg)'
  const descColor = 'var(--color-fg-dim)'
  const linkHoverBg = 'var(--color-bg-active)'
  const overlayBorder = 'var(--color-border)'
  const signInColor = 'var(--color-fg-muted)'
  const hamburgerColor = 'var(--color-fg)'
  const activeIndicator = 'var(--color-accent, #00e5ff)'

  // Toggle menu with animation
  const toggleMenu = useCallback(() => {
    if (animating) return
    if (menuOpen) {
      setAnimating(true)
      setTimeout(() => {
        setMenuOpen(false)
        setAnimating(false)
      }, 400)
    } else {
      setMenuOpen(true)
    }
  }, [menuOpen, animating])

  // Close on route change
  useEffect(() => {
    if (menuOpen) {
      setMenuOpen(false)
      setAnimating(false)
    }
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) toggleMenu()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [menuOpen, toggleMenu])

  const isClosing = animating && menuOpen

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes menuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes menuFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes menuLinkReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes menuGroupReveal {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes menuBtnMorph {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(90deg) scale(0.85); }
          100% { transform: rotate(180deg) scale(1); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .menu-link-item:hover { background: var(--menu-link-hover-bg) !important; }
        .menu-link-item:hover .menu-link-icon { color: #00e5ff !important; }
        .menu-btn-bar { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center; }
        .menu-btn-open .menu-btn-bar:nth-child(1) { transform: translateY(5px) rotate(45deg); }
        .menu-btn-open .menu-btn-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .menu-btn-open .menu-btn-bar:nth-child(3) { transform: translateY(-5px) rotate(-45deg); }
        @media (max-width: 480px) {
          .marketing-nav { padding: 0 16px !important; }
          .nav-logo-text { display: none !important; }
          .nav-desktop-actions { display: none !important; }
        }
        @media (max-width: 768px) {
          .menu-overlay-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .menu-overlay-inner {
            padding: 24px 20px 32px !important;
            justify-content: flex-start !important;
          }
          .menu-link-item { padding: 10px 12px !important; }
          .menu-link-item .menu-link-icon-box { width: 36px !important; height: 36px !important; }
          .menu-link-item .menu-link-icon { font-size: 17px !important; }
          .menu-overlay-bottom {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .menu-overlay-bottom > div {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
        }
      `}</style>

      {/* Navbar */}
      <nav className="marketing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: navBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${navBorder}`,
        animation: 'navSlideDown 0.5s ease-out',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', zIndex: 101 }}>
          <Image src="/logo.svg" alt="Orchestra" width={28} height={28} />
          <span className="nav-logo-text" style={{ fontWeight: 700, fontSize: 17, color: logoColor, letterSpacing: '-0.02em' }}>Orchestra</span>
        </Link>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="nav-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher />
            <ThemeToggle size={34} />

            {/* Search button — opens spotlight */}
            <button
              onClick={() => setSearchOpen(true)}
              title={`Search (${typeof navigator !== 'undefined' && navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+K)`}
              style={{
                width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-alt)',
                color: 'var(--color-fg-muted)',
                cursor: 'pointer', padding: 0,
              }}
            >
              <i className="bx bx-search" style={{ fontSize: 16 }} />
            </button>

            {/* Notification bell — dropdown */}
            {token && user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  title="Notifications"
                  style={{
                    width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-alt)',
                    color: 'var(--color-fg-muted)',
                    cursor: 'pointer', padding: 0, position: 'relative',
                  }}
                >
                  <i className="bx bx-bell" style={{ fontSize: 16 }} />
                  {notifications.some(n => !n.read_at) && (
                    <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', border: '1.5px solid var(--color-bg)' }} />
                  )}
                </button>
                {notifOpen && (
                  <div style={{
                    position: 'absolute', top: 42, right: 0, width: 340, zIndex: 200,
                    background: 'var(--color-bg-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', overflow: 'hidden',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: linkColor }}>
                        Notifications
                        {notifications.filter(n => !n.read_at).length > 0 && (
                          <span style={{ marginInlineStart: 8, fontSize: 10, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,229,255,0.15)', color: '#00e5ff', fontWeight: 700 }}>
                            {notifications.filter(n => !n.read_at).length}
                          </span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link href="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 11, color: '#00e5ff', textDecoration: 'none' }}>View all</Link>
                        <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: descColor, cursor: 'pointer', fontSize: 16, display: 'flex' }}>
                          <i className="bx bx-x" />
                        </button>
                      </div>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12.5, color: descColor }}>No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map(n => {
                        const meta = NOTIF_TYPE_META[n.type] ?? NOTIF_TYPE_META['info']
                        return (
                          <div
                            key={n.id}
                            onClick={() => { if (!n.read_at) markNotificationRead(n.id) }}
                            style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-bg-active)', display: 'flex', gap: 10, cursor: !n.read_at ? 'pointer' : 'default', background: !n.read_at ? 'rgba(0,229,255,0.03)' : 'transparent' }}
                          >
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${meta.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                              <i className={`bx ${meta.icon}`} style={{ fontSize: 14, color: meta.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: !n.read_at ? 600 : 500, color: linkColor, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                              <div style={{ fontSize: 11.5, color: descColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                              <span style={{ fontSize: 10.5, color: descColor }}>{notifTimeAgo(n.created_at)}</span>
                              {!n.read_at && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5ff' }} />}
                            </div>
                          </div>
                        )
                      })
                    )}
                    {notifications.some(n => !n.read_at) && (
                      <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <button onClick={() => markAllRead()} style={{ fontSize: 12, color: '#00e5ff', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {token && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: 50, border: '2px solid rgba(169,0,255,0.25)', background: 'transparent', cursor: 'pointer' }}>
                    <Avatar style={{ width: 28, height: 28 }}>
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={initials} />}
                      <AvatarFallback style={{ fontSize: 10, fontWeight: 700 }}>{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} style={{ width: 220 }}>
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={initials} />}
                        <AvatarFallback style={{ fontSize: 13, fontWeight: 700 }}>{initials}</AvatarFallback>
                      </Avatar>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: linkColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name ?? 'User'}</div>
                        <div style={{ fontSize: 11, color: descColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email ?? ''}</div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => {
                    const handle = user.handle || user.username
                    router.push(handle ? `/@${handle}` : '/dashboard')
                  }}>
                    <i className="bx bx-user" style={{ marginInlineEnd: 8 }} /> {t('nav.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); router.push('/') }} style={{ color: '#ff6b6b' }}>
                    <i className="bx bx-log-out" style={{ marginInlineEnd: 8 }} /> {t('common.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: signInColor, textDecoration: 'none' }}>{t('common.signIn')}</Link>
                <Link href="/register" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', backgroundSize: '200% 200%', animation: 'gradientShift 3s ease infinite', color: '#fff', textDecoration: 'none' }}>{t('common.getStarted')}</Link>
              </>
            )}
          </div>

          {/* Menu button (animated hamburger) — matches icon button style */}
          <button
            onClick={toggleMenu}
            className={menuOpen ? 'menu-btn-open' : ''}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 11, padding: 0,
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer', zIndex: 101,
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span className="menu-btn-bar" style={{ width: 14, height: 1.5, borderRadius: 1, background: hamburgerColor, display: 'block', marginBottom: 3.5 }} />
            <span className="menu-btn-bar" style={{ width: 14, height: 1.5, borderRadius: 1, background: hamburgerColor, display: 'block', marginBottom: 3.5 }} />
            <span className="menu-btn-bar" style={{ width: 14, height: 1.5, borderRadius: 1, background: hamburgerColor, display: 'block' }} />
          </button>
        </div>
      </nav>

      {/* Search spotlight (CMD+K) */}
      <SearchSpotlight
        open={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchResults([]) }}
        onSearch={handleSearch}
        results={searchResults}
        onSelect={handleSearchSelect}
        placeholder="Search docs, posts, packs..."
        recentSearches={['RAG engine', 'multi-agent', 'download', 'marketplace']}
        categories={[
          { id: 'doc', label: 'Pages' },
          { id: 'post', label: 'Blog' },
        ]}
      />

      {/* Spacer for fixed nav */}
      <div style={{ height: 64 }} />

      {/* Full-screen overlay menu */}
      {menuOpen && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: overlayBg,
            animation: isClosing ? 'menuFadeOut 0.4s ease-out forwards' : 'menuFadeIn 0.35s ease-out',
            display: 'flex', flexDirection: 'column',
            paddingTop: 64,
          }}
        >
          {/* Gradient accent line */}
          <div style={{
            position: 'absolute', top: 64, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, #00e5ff, #a900ff, transparent)',
            opacity: 0.5,
          }} />

          {/* Menu content */}
          <div className="menu-overlay-inner" style={{
            flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            maxWidth: 1000, width: '100%', margin: '0 auto', padding: '48px 48px',
            overflowY: 'auto',
          }}>
            {/* Nav groups grid */}
            <div className="menu-overlay-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
              marginBottom: 32,
            }}>
              {navGroups.map((group, gi) => (
                <div key={group.title} style={{
                  animation: `menuGroupReveal 0.5s ${0.1 + gi * 0.08}s ease-out both`,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: groupTitle,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    marginBottom: 20, paddingBottom: 10,
                    borderBottom: `1px solid ${overlayBorder}`,
                  }}>
                    {group.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {group.links.map((link, li) => {
                      const isActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="menu-link-item"
                          onClick={() => toggleMenu()}
                          style={{
                            '--menu-link-hover-bg': linkHoverBg,
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '14px 16px', borderRadius: 12,
                            textDecoration: 'none',
                            background: isActive ? linkHoverBg : 'transparent',
                            animation: `menuLinkReveal 0.45s ${0.15 + gi * 0.08 + li * 0.06}s ease-out both`,
                            transition: 'background 0.2s ease',
                          } as React.CSSProperties}
                        >
                          {/* Icon */}
                          <div className="menu-link-icon-box" style={{
                            width: 42, height: 42, borderRadius: 10,
                            background: 'var(--color-bg-active)',
                            border: `1px solid ${overlayBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <i className={`bx ${link.icon} menu-link-icon`} style={{
                              fontSize: 20,
                              color: isActive ? activeIndicator : descColor,
                              transition: 'color 0.2s ease',
                            }} />
                          </div>

                          {/* Label + desc */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 16, fontWeight: 600, color: linkColor,
                              marginBottom: 2,
                              display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                              {link.label}
                              {isActive && (
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: activeIndicator,
                                  display: 'inline-block',
                                }} />
                              )}
                            </div>
                            <div style={{ fontSize: 13, color: descColor, lineHeight: 1.4 }}>
                              {link.desc}
                            </div>
                          </div>

                          {/* Arrow */}
                          <i className="bx bx-chevron-right" style={{
                            fontSize: 18, color: descColor, opacity: 0.5,
                            flexShrink: 0,
                          }} />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom section: auth + social */}
            <div className="menu-overlay-bottom" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 24, borderTop: `1px solid ${overlayBorder}`,
              animation: 'menuLinkReveal 0.5s 0.5s ease-out both',
              flexWrap: 'wrap', gap: 16, flexShrink: 0,
            }}>
              {/* Auth links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {token && user ? (
                  <>
                    <Link href={`/@${user.handle || user.username || ''}`} onClick={() => toggleMenu()} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 20px', borderRadius: 10,
                      background: 'var(--color-bg-active)',
                      border: `1px solid ${overlayBorder}`,
                      textDecoration: 'none', color: linkColor, fontSize: 14, fontWeight: 500,
                    }}>
                      <Avatar style={{ width: 26, height: 26 }}>
                        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={initials} />}
                        <AvatarFallback style={{ fontSize: 10, fontWeight: 700 }}>{initials}</AvatarFallback>
                      </Avatar>
                      {t('nav.profile')}
                    </Link>
                    <button onClick={() => { logout(); router.push('/'); toggleMenu() }} style={{
                      padding: '10px 20px', borderRadius: 10,
                      background: 'transparent', border: `1px solid ${overlayBorder}`,
                      color: '#ef4444', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}>
                      {t('common.signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => toggleMenu()} style={{
                      padding: '10px 20px', borderRadius: 10,
                      background: 'var(--color-bg-active)',
                      border: `1px solid ${overlayBorder}`,
                      textDecoration: 'none', color: linkColor, fontSize: 14, fontWeight: 500,
                    }}>
                      {t('common.signIn')}
                    </Link>
                    <Link href="/register" onClick={() => toggleMenu()} style={{
                      padding: '10px 24px', borderRadius: 10,
                      background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                      textDecoration: 'none', color: '#fff', fontSize: 14, fontWeight: 600,
                    }}>
                      {t('common.getStarted')}
                    </Link>
                  </>
                )}
              </div>

              {/* Social + extras */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LanguageSwitcher />
                <ThemeToggle size={34} />
                {[
                  { icon: 'bxl-github', href: 'https://github.com/orchestra-mcp/framework' },
                  { icon: 'bxl-twitter', href: 'https://twitter.com/orchestramcp' },
                  { icon: 'bxl-discord-alt', href: 'https://discord.gg/orchestra' },
                ].map(s => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener" style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: `1px solid ${overlayBorder}`,
                    background: 'var(--color-bg-alt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: descColor, textDecoration: 'none', fontSize: 17,
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00e5ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = descColor)}
                  >
                    <i className={`bx ${s.icon}`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
