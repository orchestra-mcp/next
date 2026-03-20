'use client'

import { use } from 'react'
import { useAuthStore } from '@/store/auth'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileEditForm from '@/components/profile/profile-edit-form'

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function EditProfilePage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { colors } = useProfileTheme()
  const { user } = useAuthStore()

  if (!user) {
    return (
      <ProfileSection
        title="Edit Profile"
        icon="bx-edit-alt"
      >
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Please log in to edit your profile.
        </p>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection
      title="Edit Profile"
      description={`Update your public profile information for @${handle}`}
      icon="bx-edit-alt"
    >
      <ProfileEditForm
        user={{
          name: user.name,
          username: user.username,
          bio: user.bio,
          avatar_url: user.avatar_url,
          cover_url: user.cover_url,
        }}
      />
    </ProfileSection>
  )
}
