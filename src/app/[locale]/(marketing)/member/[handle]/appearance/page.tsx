'use client'
import { use, useState, useEffect, useCallback } from 'react'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#00e5ff' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Purple', value: '#a900ff' },
  { name: 'Pink', value: '#ec4899' },
]

const PROFILE_THEMES = [
  { name: 'Dark', value: 'dark' },
  { name: 'Light', value: 'light' },
  { name: 'System', value: 'system' },
]

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function AppearancePage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { isDark, colors } = useProfileTheme()
  const { profile } = useCommunityStore()
  const { user, token } = useAuthStore()

  const [profileTheme, setProfileTheme] = useState('system')
  const [accentColor, setAccentColor] = useState('#00e5ff')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.appearance) {
      setProfileTheme(profile.appearance.theme || 'system')
      setAccentColor(profile.appearance.accent || '#00e5ff')
    }
  }, [profile])

  const isOwner = !!user && (
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )

  const saveAppearance = useCallback(async (key: string, value: string) => {
    if (!token) return
    setSaving(true)
    try {
      const base = typeof window !== 'undefined'
        ? (localStorage.getItem('api_base_url') || '')
        : ''
      const current = profile?.appearance || {}
      await fetch(`${base}/api/settings/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          appearance: { ...current, [key]: value },
        }),
      })
    } catch { /* ignore */ }
    setSaving(false)
  }, [token, profile])

  if (!isOwner) {
    return (
      <div className="px-8 py-10 text-center">
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Appearance settings are only visible to the profile owner.
        </p>
      </div>
    )
  }

  return (
    <ProfileSection
      title="Appearance"
      description="Customize how your profile looks to visitors"
      icon="bx-palette"
    >
      <div className="flex flex-col gap-6">
        {/* Profile Theme */}
        <ProfileCard variant="default" className="px-6 py-5">
          <div
            className="text-[15px] font-semibold mb-1"
            style={{ color: colors.textPrimary }}
          >
            Profile Theme
          </div>
          <div
            className="text-[13px] mb-4"
            style={{ color: colors.textSecondary }}
          >
            Choose the theme visitors see on your profile page
          </div>
          <div className="flex gap-2.5">
            {PROFILE_THEMES.map(t => {
              const isSelected = profileTheme === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setProfileTheme(t.value)
                    saveAppearance('theme', t.value)
                  }}
                  disabled={saving}
                  className={[
                    'px-5 py-2 rounded-lg text-[13px] font-semibold',
                    'border-2 transition-all duration-150',
                    saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    isSelected
                      ? (isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]')
                      : 'bg-transparent',
                  ].join(' ')}
                  style={{
                    borderColor: isSelected ? accentColor : colors.cardBorder,
                    color: isSelected ? accentColor : colors.textMuted,
                  }}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </ProfileCard>

        {/* Accent Color */}
        <ProfileCard variant="default" className="px-6 py-5">
          <div
            className="text-[15px] font-semibold mb-1"
            style={{ color: colors.textPrimary }}
          >
            Accent Color
          </div>
          <div
            className="text-[13px] mb-4"
            style={{ color: colors.textSecondary }}
          >
            Choose the accent color for your profile page
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {ACCENT_COLORS.map(c => {
              const isSelected = accentColor === c.value
              return (
                <button
                  key={c.value}
                  onClick={() => {
                    setAccentColor(c.value)
                    saveAppearance('accent', c.value)
                  }}
                  disabled={saving}
                  title={c.name}
                  className={[
                    'w-9 h-9 rounded-[10px] border-none transition-all duration-150',
                    saving ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  ].join(' ')}
                  style={{
                    background: c.value,
                    outline: isSelected ? `3px solid ${c.value}` : 'none',
                    outlineOffset: isSelected ? 3 : 0,
                  }}
                />
              )
            })}
          </div>
        </ProfileCard>
      </div>
    </ProfileSection>
  )
}
