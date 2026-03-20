'use client'

const IDE_LIST = [
  { name: 'Claude Code', icon: 'bx bx-terminal' },
  { name: 'Cursor', icon: 'bx bx-code-curly' },
  { name: 'VS Code', icon: 'bx bxl-visual-studio' },
  { name: 'Cline', icon: 'bx bx-code-block' },
  { name: 'Windsurf', icon: 'bx bx-wind' },
  { name: 'Codex', icon: 'bx bx-bot' },
  { name: 'Gemini', icon: 'bx bx-diamond' },
  { name: 'Zed', icon: 'bx bx-bolt-circle' },
  { name: 'Continue.dev', icon: 'bx bx-extension' },
]

export function IdeGrid() {
  return (
    <section style={{ padding: '0 32px 60px', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.05))' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: 12, fontWeight: 600,
          color: 'var(--color-fg-dim, rgba(255,255,255,0.2))',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Works with your favorite IDE
        </p>
        <div className="ide-grid-row" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 32, flexWrap: 'wrap',
        }}>
          {IDE_LIST.map(ide => (
            <div key={ide.name} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 600,
              color: 'var(--color-fg-dim, rgba(255,255,255,0.25))',
              transition: 'color 0.2s',
            }}>
              <i className={ide.icon} style={{ fontSize: 18 }} />
              <span>{ide.name}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .ide-grid-row > div:hover { color: var(--color-fg-muted, rgba(255,255,255,0.5)) !important; }
        @media (max-width: 640px) {
          .ide-grid-row { gap: 16px !important; }
          .ide-grid-row > div { font-size: 12px !important; }
        }
      `}</style>
    </section>
  )
}
