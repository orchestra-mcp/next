'use client'

const PLATFORMS = [
  {
    icon: 'bxl-apple',
    name: 'macOS',
    stack: 'Swift + WidgetKit',
    desc: 'Native menu bar app with floating bubble, global hotkey, and Spotlight integration.',
  },
  {
    icon: 'bxl-windows',
    name: 'Windows',
    stack: 'C# + WinUI 3',
    desc: 'Desktop, Xbox, and HoloLens support with CompactOverlay and system tray.',
  },
  {
    icon: 'bxl-tux',
    name: 'Linux',
    stack: 'Vala + GTK4',
    desc: 'GNOME, KDE, and tiling WM support with Flatpak and deb packaging.',
  },
  {
    icon: 'bx-mobile-alt',
    name: 'iOS & Android',
    stack: 'Flutter',
    desc: 'Cross-platform mobile with offline-first sync, push notifications, and native UI.',
  },
  {
    icon: 'bx-globe',
    name: 'Web',
    stack: 'Next.js',
    desc: 'Full dashboard with real-time sync, theming, and internationalization.',
  },
  {
    icon: 'bxl-chrome',
    name: 'Chrome Extension',
    stack: 'Manifest V3',
    desc: 'Browser-native sidebar with page context awareness and MCP bridge.',
  },
]

export function PlatformGrid() {
  return (
    <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 100,
        border: '1px solid rgba(0,229,255,0.25)',
        background: 'rgba(0,229,255,0.06)',
        marginBottom: 20, fontSize: 12, fontWeight: 600,
        color: '#00e5ff', letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        6 Platforms
      </div>
      <h2 style={{
        fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700,
        letterSpacing: '-0.03em', marginBottom: 14,
        color: 'var(--color-fg, #f8f8f8)',
      }}>
        One framework, every platform
      </h2>
      <p style={{
        fontSize: 16, maxWidth: 500, margin: '0 auto 48px',
        color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
      }}>
        Native apps for desktop, mobile, web, and browser — powered by the same plugin backbone.
      </p>

      <div className="platform-grid-6" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, maxWidth: 960, margin: '0 auto',
      }}>
        {PLATFORMS.map(p => (
          <div key={p.name} style={{
            padding: '28px 20px', borderRadius: 16, textAlign: 'start',
            border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
            background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
          }}>
            <i className={`bx ${p.icon}`} style={{ fontSize: 28, color: '#00e5ff', marginBottom: 12, display: 'block' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>{p.name}</span>
              <span style={{
                fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                background: 'rgba(169,0,255,0.1)', color: '#c040ff',
              }}>{p.stack}</span>
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.6, margin: 0,
              color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
            }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .platform-grid-6 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .platform-grid-6 { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>
    </section>
  )
}
