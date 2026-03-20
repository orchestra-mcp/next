'use client'
import { THEMES, THEME_GROUPS, getThemesByGroup } from '@orchestra-mcp/theme'
import { useThemeStore } from '@/store/theme'
import ProfileCard from '@/components/profile/profile-card'

export default function AppearanceSettingsPage() {
  const { colorTheme, setColorTheme } = useThemeStore()

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Appearance</h3>

      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 12 }}>Color Theme</div>

      {THEME_GROUPS.map(group => {
        const themes = getThemesByGroup(group)
        if (!themes.length) return null
        return (
          <div key={group} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-fg-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {group}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
              {themes.map(t => {
                const isActive = colorTheme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setColorTheme(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      background: isActive ? 'var(--color-bg-active, rgba(0,229,255,0.06))' : 'var(--color-bg-alt)',
                      border: isActive ? '1.5px solid var(--color-accent, #00e5ff)' : '1px solid var(--color-border)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      background: t.colors.bg,
                      border: `2px solid ${t.colors.accent}`,
                    }} />
                    <div style={{ textAlign: 'start', minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--color-accent)' : 'var(--color-fg-muted)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {t.label}
                      </div>
                      {t.isLight && (
                        <div style={{ fontSize: 9, color: 'var(--color-fg-dim)', marginTop: 1 }}>Light</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </ProfileCard>
  )
}
