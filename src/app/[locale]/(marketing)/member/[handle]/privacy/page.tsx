'use client'
import { use, useState, useEffect, useCallback } from 'react'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import ProfileToggle from '@/components/profile/profile-toggle'

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function PrivacyPage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { colors } = useProfileTheme()
  const { profile } = useCommunityStore()
  const { user, mcpToken: token } = useAuthStore()

  const [showComments, setShowComments] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setShowComments(profile.show_comments_on_profile !== false)
      setIsPublic(profile.is_public !== false)
    }
  }, [profile])

  const isOwner = !!user && (
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )

  const saveToggle = useCallback(async (key: string, value: boolean) => {
    if (!token) return
    setSaving(true)
    try {
      const base = typeof window !== 'undefined'
        ? (localStorage.getItem('api_base_url') || '')
        : ''
      await fetch(`${base}/api/settings/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: value }),
      })
    } catch { /* ignore */ }
    setSaving(false)
  }, [token])

  if (!isOwner) {
    return (
      <ProfileSection
        title="Privacy"
        icon="bx-lock-alt"
      >
        <p className="text-sm text-center" style={{ color: colors.textMuted }}>
          Privacy settings are only visible to the profile owner.
        </p>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection
      title="Privacy"
      description="Control who can see your profile and activity"
      icon="bx-lock-alt"
    >
      <div className="flex flex-col gap-4">
        {/* Public Profile Toggle */}
        <ProfileCard variant="default" className="px-6 py-5 flex items-center justify-between">
          <div>
            <div
              className="text-[15px] font-semibold mb-1"
              style={{ color: colors.textPrimary }}
            >
              Public Profile
            </div>
            <div
              className="text-[13px]"
              style={{ color: colors.textSecondary }}
            >
              Allow anyone to view your profile page
            </div>
          </div>
          <ProfileToggle
            checked={isPublic}
            onChange={(next) => {
              setIsPublic(next)
              saveToggle('public_profile_enabled', next)
            }}
            disabled={saving}
          />
        </ProfileCard>

        {/* Show Comments Toggle */}
        <ProfileCard variant="default" className="px-6 py-5 flex items-center justify-between">
          <div>
            <div
              className="text-[15px] font-semibold mb-1"
              style={{ color: colors.textPrimary }}
            >
              Show Comments on Profile
            </div>
            <div
              className="text-[13px]"
              style={{ color: colors.textSecondary }}
            >
              Display your comments in the activity feed on your public profile
            </div>
          </div>
          <ProfileToggle
            checked={showComments}
            onChange={(next) => {
              setShowComments(next)
              saveToggle('show_comments_on_profile', next)
            }}
            disabled={saving}
          />
        </ProfileCard>
      </div>
    </ProfileSection>
  )
}
