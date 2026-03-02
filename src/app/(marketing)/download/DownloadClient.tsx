'use client'
import { useThemeStore } from '@/store/theme'

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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 56, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>Download Orchestra</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 480, margin: '0 auto' }}>Available for macOS, Windows, and Linux. Or install via CLI.</p>
      </div>

      <div style={{ marginBottom: 48, padding: '28px 32px', borderRadius: 16, border: '1px solid rgba(0,229,255,0.2)', background: installBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <i className="bx bx-terminal" style={{ fontSize: 20, color: '#00e5ff' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>Install via script (recommended)</span>
        </div>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Works on macOS and Linux. Installs the orchestra binary to /usr/local/bin.</p>
        <div style={{ background: termBg, borderRadius: 10, padding: '14px 18px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#f8f8f8', border: `1px solid ${termBorder}` }}>
          <span style={{ color: promptColor, userSelect: 'none' }}>$ </span>
          <span>{installScript}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
        {platforms.map(p => (
          <div key={p.id} style={{ padding: '28px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      <div style={{ padding: '32px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>Quick start</h2>
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
    </div>
  )
}
