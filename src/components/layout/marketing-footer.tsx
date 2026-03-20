'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function MarketingFooter() {
  const t = useTranslations()
  const cols = [
    { title: t('footer.product'), links: [{ label: t('footer.features'), href: '/#features' }, { label: t('nav.marketplace'), href: '/marketplace' }, { label: t('footer.pricing'), href: '/#pricing' }, { label: t('nav.download'), href: '/download' }, { label: t('footer.changelog'), href: '/blog' }] },
    { title: t('footer.developers'), links: [{ label: t('footer.documentation'), href: '/docs' }, { label: t('footer.apiReference'), href: '/docs/api' }, { label: t('footer.pluginSdk'), href: '/docs/sdk' }, { label: t('footer.reportIssue'), href: '/report' }, { label: t('footer.github'), href: 'https://github.com/orchestra-mcp/framework' }] },
    { title: t('footer.company'), links: [{ label: t('footer.blog'), href: '/blog' }, { label: t('nav.solutions'), href: '/solutions' }, { label: t('footer.contact'), href: '/contact' }, { label: t('footer.about'), href: '/about' }] },
    { title: t('footer.legal'), links: [{ label: t('footer.termsOfService'), href: '/terms' }, { label: t('footer.privacyPolicy'), href: '/privacy' }, { label: t('footer.cookiePolicy'), href: '/privacy#cookies' }] },
  ]

  const bg = 'var(--color-bg)'
  const borderColor = 'var(--color-border)'
  const logoText = 'var(--color-fg)'
  const descText = 'var(--color-fg-dim)'
  const colTitle = 'var(--color-fg-dim)'
  const linkColor = 'var(--color-fg-muted)'
  const linkHover = 'var(--color-fg-bright)'
  const socialBorder = 'var(--color-border)'
  const socialBg = 'var(--color-bg-alt)'
  const copyrightColor = 'var(--color-fg-dim)'

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
              {t('footer.tagline')}
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { icon: 'bxl-github', href: 'https://github.com/orchestra-mcp/framework' },
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
          <p style={{ fontSize: 12, color: copyrightColor }}>&copy; {new Date().getFullYear()} Orchestra MCP. {t('footer.copyright')}</p>
          <div style={{ display: 'flex', gap: 20 }}>
            {[{ label: t('footer.terms'), href: '/terms' }, { label: t('footer.privacy'), href: '/privacy' }].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 12, color: copyrightColor, textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}
