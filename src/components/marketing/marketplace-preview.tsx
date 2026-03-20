'use client'
import Link from 'next/link'

const PACKS = [
  { name: 'Go', icon: 'bxl-go-lang', skills: 4, agents: 2, hooks: 1, cmd: 'orchestra pack install go' },
  { name: 'Rust', icon: 'bx-cog', skills: 4, agents: 2, hooks: 1, cmd: 'orchestra pack install rust' },
  { name: 'React', icon: 'bxl-react', skills: 3, agents: 2, hooks: 1, cmd: 'orchestra pack install react' },
  { name: 'Python', icon: 'bxl-python', skills: 4, agents: 2, hooks: 1, cmd: 'orchestra pack install python' },
  { name: 'Kubernetes', icon: 'bx-cube', skills: 3, agents: 1, hooks: 2, cmd: 'orchestra pack install kubernetes' },
  { name: 'Docker', icon: 'bxl-docker', skills: 3, agents: 1, hooks: 1, cmd: 'orchestra pack install docker' },
]

export function MarketplacePreview() {
  return (
    <section style={{
      padding: '80px 32px',
      borderTop: '1px solid var(--color-border, rgba(255,255,255,0.05))',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 100,
            border: '1px solid rgba(169,0,255,0.3)',
            background: 'rgba(169,0,255,0.06)',
            marginBottom: 20, fontSize: 12, fontWeight: 600,
            color: '#c040ff', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            Plugin Marketplace
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700,
            letterSpacing: '-0.03em', marginBottom: 14,
            color: 'var(--color-fg, #f8f8f8)',
          }}>
            Content packs for every stack
          </h2>
          <p style={{
            fontSize: 16, maxWidth: 500, margin: '0 auto',
            color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
          }}>
            Pre-built skills, agents, and hooks — install in one command.
          </p>
        </div>

        <div className="marketplace-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, maxWidth: 960, margin: '0 auto 40px',
        }}>
          {PACKS.map(p => (
            <div key={p.name} style={{
              padding: '20px', borderRadius: 14,
              border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
              background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <i className={`bx ${p.icon}`} style={{ fontSize: 24, color: '#00e5ff' }} />
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: 'var(--color-fg, #f8f8f8)',
                }}>{p.name}</span>
              </div>
              <div style={{
                display: 'flex', gap: 12, marginBottom: 12,
                fontSize: 12, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
              }}>
                <span>{p.skills} skills</span>
                <span>{p.agents} agents</span>
                <span>{p.hooks} hooks</span>
              </div>
              <div style={{
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(0,0,0,0.2)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))',
              }}>
                $ {p.cmd}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/marketplace" style={{
            fontSize: 14, fontWeight: 600,
            color: '#00e5ff', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Browse Marketplace <i className="bx bx-right-arrow-alt rtl-flip" style={{ fontSize: 18 }} />
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .marketplace-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .marketplace-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
