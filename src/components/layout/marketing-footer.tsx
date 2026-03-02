'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useThemeStore } from '@/store/theme'

const cols = [
  { title: 'Product', links: [{ label: 'Features', href: '/#features' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Pricing', href: '/#pricing' }, { label: 'Download', href: '/download' }, { label: 'Changelog', href: '/blog' }] },
  { title: 'Developers', links: [{ label: 'Documentation', href: '/docs' }, { label: 'API Reference', href: '/docs/api' }, { label: 'Plugin SDK', href: '/docs/sdk' }, { label: 'Report Issue', href: '/report' }, { label: 'GitHub', href: 'https://github.com/orchestra-mcp' }] },
  { title: 'Company', links: [{ label: 'Blog', href: '/blog' }, { label: 'Solutions', href: '/solutions' }, { label: 'Contact', href: '/contact' }, { label: 'About', href: '/about' }] },
  { title: 'Legal', links: [{ label: 'Terms of Service', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Cookie Policy', href: '/privacy#cookies' }] },
]

export function MarketingFooter() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const bg = isDark ? '#0a0a0d' : '#f0f0f3'
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const logoText = isDark ? '#f8f8f8' : '#0f0f12'
  const descText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const colTitle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const linkColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const linkHover = isDark ? '#f8f8f8' : '#0f0f12'
  const socialBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const socialBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  const copyrightColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .footer-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 28px !important; }
        .footer-brand { grid-column: 1 / -1 !important; }
      }
      @media (max-width: 480px) {
        .footer-wrap { padding: 40px 20px 24px !important; }
        .footer-grid { grid-template-columns: 1fr 1fr !important; }
        .footer-bottom { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
      }
    `}</style>
    <footer className="footer-wrap" style={{ background: bg, borderTop: `1px solid ${borderColor}`, padding: '56px 32px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top: brand + columns */}
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '240px repeat(4, 1fr)', gap: 32, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Image src="/logo.svg" alt="Orchestra" width={24} height={24} />
              <span style={{ fontWeight: 700, fontSize: 16, color: logoText }}>Orchestra</span>
            </div>
            <p style={{ fontSize: 13, color: descText, lineHeight: 1.7, marginBottom: 20 }}>
              The AI-native IDE for every platform. 131 tools, 5 platforms, one protocol.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: 'bxl-github', href: 'https://github.com/orchestra-mcp' },
                { icon: 'bxl-twitter', href: 'https://twitter.com/orchestramcp' },
                { icon: 'bxl-discord-alt', href: 'https://discord.gg/orchestra' },
              ].map(s => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${socialBorder}`, background: socialBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: linkColor, textDecoration: 'none', fontSize: 16 }}>
                  <i className={`bx ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colTitle, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => (
                  <Link key={l.href} href={l.href} style={{ fontSize: 13, color: linkColor, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = linkHover)}
                    onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
                  >{l.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="footer-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: `1px solid ${borderColor}` }}>
          <p style={{ fontSize: 12, color: copyrightColor }}>© {new Date().getFullYear()} Orchestra MCP. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 12, color: copyrightColor, textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}
