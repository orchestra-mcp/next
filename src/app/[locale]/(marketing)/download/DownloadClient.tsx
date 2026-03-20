'use client'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'
import { useScrollReveal, revealStyle } from '@/hooks/useScrollReveal'

interface PlatformInfo {
  url?: string
  version?: string
  release_date?: string
  arch?: string
  desc?: string
  file?: string
}

interface DownloadData {
  version?: string
  release_date?: string
  install_script?: string
  macos?: PlatformInfo
  windows?: PlatformInfo
  linux?: PlatformInfo
}

export default function DownloadClient({ data }: { data: DownloadData }) {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textDim = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const installBg = isDark ? 'rgba(0,229,255,0.04)' : 'rgba(0,229,255,0.05)'
  const termBg = isDark ? 'rgba(15,15,18,0.8)' : '#1e1e2e'
  const termBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
  const promptColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'
  const dlPrimaryBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const dlPrimaryBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const dlSecondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const dlSecondaryBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const commentColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cmdBg = isDark ? 'rgba(15,15,18,0.6)' : '#1e1e2e'
  const cmdBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'

  const version = `v${data.version ?? '1.0.0'}`
  const installScript = data.install_script ?? 'curl -fsSL https://orchestra-mcp.dev/install.sh | sh'
  const releaseUrl = 'https://github.com/orchestra-mcp/orchestra/releases/latest'

  const platforms = [
    {
      id: 'macos',
      icon: 'bxl-apple',
      label: 'macOS',
      version,
      desc: data.macos?.desc ?? `Universal binary (${data.macos?.arch ?? 'Apple Silicon + Intel'}). Requires macOS 13+.`,
      color: '#f8f8f8',
      downloads: [
        { label: `Download for macOS (${data.macos?.file ?? '.dmg'})`, href: data.macos?.url || releaseUrl, primary: true },
      ],
    },
    {
      id: 'windows',
      icon: 'bxl-windows',
      label: 'Windows',
      version,
      desc: data.windows?.desc ?? `MSIX installer for Windows 10/11 (${data.windows?.arch ?? 'x64'}). Requires Windows 10 19041+.`,
      color: '#00aff0',
      downloads: [
        { label: `Download for Windows (${data.windows?.file ?? '.msix'})`, href: data.windows?.url || releaseUrl, primary: true },
      ],
    },
    {
      id: 'linux',
      icon: 'bxl-tux',
      label: 'Linux',
      version,
      desc: data.linux?.desc ?? `Flatpak (recommended), .deb, .rpm, and AppImage. (${data.linux?.arch ?? 'x64 + arm64'})`,
      color: '#fbbf24',
      downloads: [
        { label: 'Flatpak (recommended)', href: data.linux?.url || releaseUrl, primary: true },
        { label: '.deb package', href: data.linux?.url || releaseUrl, primary: false },
        { label: '.rpm package', href: data.linux?.url || releaseUrl, primary: false },
      ],
    },
  ]

  const headerReveal = useScrollReveal({ threshold: 0.2 })
  const installReveal = useScrollReveal({ threshold: 0.15 })
  const gridReveal = useScrollReveal({ threshold: 0.1 })
  const quickstartReveal = useScrollReveal({ threshold: 0.15 })
  const mcpReveal = useScrollReveal({ threshold: 0.15 })

  return (
    <div className="mkt-page" style={{ maxWidth: 900, margin: '0 auto', padding: '72px 32px' }}>
      <div ref={headerReveal.ref} style={{ marginBottom: 56, textAlign: 'center', ...revealStyle(headerReveal.isVisible) }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>{t('download.title')}</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 480, margin: '0 auto' }}>{t('download.subtitle')}</p>
      </div>

      <div ref={installReveal.ref} style={{ marginBottom: 48, padding: '28px 32px', borderRadius: 16, border: '1px solid rgba(0,229,255,0.2)', background: installBg, ...revealStyle(installReveal.isVisible, 100) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <i className="bx bx-terminal" style={{ fontSize: 20, color: '#00e5ff' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{t('download.installViaScript')}</span>
        </div>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>{t('download.installScriptDesc')}</p>
        <div style={{ background: termBg, borderRadius: 10, padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#f8f8f8', border: `1px solid ${termBorder}` }}>
          <span style={{ color: promptColor, userSelect: 'none' }}>$ </span>
          <span>{installScript}</span>
        </div>
      </div>

      <div ref={gridReveal.ref} className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
        {platforms.map((p, pi) => (
          <div key={p.id} style={{ padding: '28px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, display: 'flex', flexDirection: 'column', gap: 16, ...revealStyle(gridReveal.isVisible, pi * 80) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className={`bx ${p.icon}`} style={{ fontSize: 28, color: p.color === '#f8f8f8' ? (isDark ? '#f8f8f8' : '#0f0f12') : p.color }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>{p.label}</div>
                <div style={{ fontSize: 12, color: textDim }}>{p.version}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              {p.downloads.map(d => (
                <a key={d.label} href={d.href} target="_blank" rel="noopener" style={{ padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' as const, background: d.primary ? dlPrimaryBg : 'transparent', color: d.primary ? textPrimary : dlSecondaryColor, border: d.primary ? `1px solid ${dlPrimaryBorder}` : `1px solid ${dlSecondaryBorder}` }}>
                  {d.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={quickstartReveal.ref} style={{ padding: '32px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, ...revealStyle(quickstartReveal.isVisible) }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>{t('download.quickStart')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
          {[
            { comment: '# Initialize Orchestra in your project', cmd: 'orchestra init' },
            { comment: '# Start the plugin server', cmd: 'orchestra serve' },
            { comment: '# Install a pack', cmd: 'orchestra pack install go-backend' },
            { comment: '# Check version', cmd: `orchestra version  # ${version}` },
          ].map((line, i) => (
            <div key={i}>
              <div style={{ color: commentColor }}>{line.comment}</div>
              <div style={{ background: cmdBg, borderRadius: 8, padding: '8px 14px', border: `1px solid ${cmdBorder}`, color: '#f8f8f8', marginBottom: 4 }}>
                <span style={{ color: promptColor }}>$ </span>{line.cmd}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cloud MCP — Add to Claude Desktop ── */}
      <div ref={mcpReveal.ref} style={{ marginTop: 32, padding: '32px', borderRadius: 16, border: '1px solid rgba(0,229,255,0.2)', background: installBg, ...revealStyle(mcpReveal.isVisible) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <i className="bx bx-bot" style={{ fontSize: 22, color: '#00e5ff' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: 0 }}>Use Orchestra from Claude Desktop</h2>
        </div>
        <p style={{ fontSize: 14, color: textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          No local install required. Connect Claude Desktop directly to Orchestra Cloud MCP — install Orchestra, browse packs, and manage your profile from any Claude chat.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {/* Anonymous — no account */}
          <div style={{ padding: '20px', borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>Without account</div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 14, lineHeight: 1.5 }}>Install tools, check status — no sign-in needed.</div>
            <a
              href={`claude://install-mcp?name=orchestra-cloud&type=sse&url=${encodeURIComponent('https://orchestra-mcp.dev/mcp')}`}
              style={{ display: 'block', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', background: dlPrimaryBg, color: textPrimary, border: `1px solid ${dlPrimaryBorder}` }}
            >
              <i className="bx bx-plus" style={{ marginRight: 6 }} />
              Add to Claude Desktop
            </a>
          </div>

          {/* Authenticated — with account */}
          <div style={{ padding: '20px', borderRadius: 12, border: '1px solid rgba(0,229,255,0.25)', background: isDark ? 'rgba(0,229,255,0.03)' : 'rgba(0,229,255,0.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>With your account</div>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 14, lineHeight: 1.5 }}>Profile access, marketplace, and permission controls.</div>
            <a
              href="/settings?tab=mcp"
              style={{ display: 'block', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}
            >
              <i className="bx bx-key" style={{ marginRight: 6 }} />
              Get my MCP token
            </a>
          </div>
        </div>

        <div style={{ fontSize: 12, color: textDim, marginBottom: 12 }}>Or add manually to your Claude Desktop config:</div>
        <div style={{ background: termBg, borderRadius: 10, padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#f8f8f8', border: `1px solid ${termBorder}`, whiteSpace: 'pre' }}>{`{
  "mcpServers": {
    "orchestra-cloud": {
      "type": "sse",
      "url": "https://orchestra-mcp.dev/mcp"
    }
  }
}`}</div>
      </div>
    </div>
  )
}
