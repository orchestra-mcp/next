'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { uploadUrl } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { useProfileTheme } from './use-profile-theme'
import ProfileCard from './profile-card'
import AvatarUploadModal from './avatar-upload-modal'
import CoverUploadModal from './cover-upload-modal'

interface ProfileEditFormProps {
  user: {
    name: string
    username?: string
    bio?: string
    avatar_url?: string | null
    cover_url?: string | null
  }
}

const SLUG_REGEX = /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/

function validateSlug(value: string): string | null {
  if (!value) return 'Username is required'
  if (value.length < 3) return 'Username must be at least 3 characters'
  if (value.length > 100) return 'Username must be 100 characters or fewer'
  if (!SLUG_REGEX.test(value)) {
    return 'Only lowercase letters, numbers, dots, hyphens, and underscores allowed'
  }
  return null
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const { isDark, colors } = useProfileTheme()
  const authUser = useAuthStore((s) => s.user)

  const [name, setName] = useState(user.name || '')
  const [username, setUsername] = useState(user.username || '')
  const [bio, setBio] = useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || null)
  const [coverUrl, setCoverUrl] = useState(user.cover_url || null)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  useEffect(() => {
    if (authUser) {
      setAvatarUrl(authUser.avatar_url || null)
      setCoverUrl(authUser.cover_url || null)
    }
  }, [authUser?.avatar_url, authUser?.cover_url])

  const handleUsernameChange = useCallback((value: string) => {
    const cleaned = value.replace(/^@/, '').toLowerCase()
    setUsername(cleaned)
    if (cleaned) {
      setUsernameError(validateSlug(cleaned))
    } else {
      setUsernameError(null)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setErrorMessage('Display name is required.')
      return
    }
    if (username) {
      const slugErr = validateSlug(username)
      if (slugErr) {
        setUsernameError(slugErr)
        return
      }
    }

    setSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const sb = createClient()
      const { data: { user: authUser } } = await sb.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      const payload: Record<string, string> = { name: name.trim() }
      if (username) payload.username = username
      if (bio !== undefined) payload.bio = bio.trim()

      const { data: result, error } = await sb.from('users').update(payload).eq('auth_uid', authUser.id).select('name, username, bio').single()
      if (error) throw error

      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              name: result.name || name.trim(),
              username: result.username || username,
              bio: result.bio ?? bio.trim(),
            }
          : null,
      }))

      setSuccessMessage('Profile updated successfully.')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }, [name, username, bio])

  const handleAvatarUploaded = useCallback((newUrl: string) => {
    setAvatarUrl(newUrl)
  }, [])

  const handleCoverUploaded = useCallback((newUrl: string) => {
    setCoverUrl(newUrl)
  }, [])

  const bioLength = bio.length
  const bioMaxLength = 500
  const bioCountColor =
    bioLength > bioMaxLength
      ? colors.danger
      : bioLength > bioMaxLength * 0.9
        ? isDark
          ? 'rgba(255,200,50,0.8)'
          : 'rgba(180,130,0,0.8)'
        : colors.textMuted

  const isDisabled = saving || !!usernameError || !name.trim()

  return (
    <div className="pb-10">
      {/* Cover image area */}
      <div
        onClick={() => setCoverModalOpen(true)}
        className="relative w-full rounded-t-xl overflow-hidden cursor-pointer group"
        style={{ height: 200 }}
      >
        {coverUrl ? (
          <img
            src={uploadUrl(coverUrl)}
            alt="Cover"
            className="w-full h-full object-cover block"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(169,0,255,0.12))'
                : 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(169,0,255,0.08))',
            }}
          />
        )}
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.3)' }}
        >
          <i className="bx bx-camera text-[22px] text-white" />
          <span className="text-sm font-semibold text-white">Change cover</span>
        </div>
        {/* Brand gradient border bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(90deg, #00e5ff, #a900ff)' }}
        />
      </div>

      {/* Avatar overlapping cover */}
      <div className="relative -mt-11 ml-7 w-[88px] h-[88px] z-[2]">
        <div
          onClick={() => setAvatarModalOpen(true)}
          className="w-[88px] h-[88px] rounded-full overflow-hidden cursor-pointer relative group"
          style={{
            border: `3px solid ${isDark ? '#0f0f12' : '#ffffff'}`,
            background: isDark ? '#1a1a1f' : '#f0f0f2',
          }}
        >
          {avatarUrl ? (
            <img
              src={uploadUrl(avatarUrl)}
              alt="Avatar"
              className="w-full h-full object-cover block"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-[28px] font-bold"
              style={{
                color: colors.textMuted,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              }}
            >
              {(user.name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <i className="bx bx-camera text-[22px] text-white" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <ProfileCard variant="default" className="mt-5 p-7">
        {/* Success message */}
        {successMessage && (
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium mb-5"
            style={{
              background: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)',
              border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)'}`,
              color: colors.success,
            }}
          >
            <i className="bx bx-check-circle text-[17px]" />
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium mb-5"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: colors.danger,
            }}
          >
            <i className="bx bx-error-circle text-[17px]" />
            {errorMessage}
          </div>
        )}

        {/* Display Name */}
        <div className="mb-5">
          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: colors.textBody, letterSpacing: '-0.01em' }}>
            <i className="bx bx-user text-sm mr-1 align-[-1px]" />
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={255}
            placeholder="Your display name"
            className="w-full text-sm p-[11px] rounded-[10px] outline-none transition-colors font-[inherit] box-border"
            style={{
              border: `1px solid ${colors.inputBorder}`,
              background: colors.inputBg,
              color: colors.textPrimary,
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.inputFocusBorder }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = colors.inputBorder }}
          />
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: colors.textBody, letterSpacing: '-0.01em' }}>
            <i className="bx bx-at text-sm mr-1 align-[-1px]" />
            Username
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
              style={{ color: colors.textMuted }}
            >
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              maxLength={100}
              placeholder="username"
              className="w-full text-sm p-[11px] pl-7 rounded-[10px] outline-none transition-colors font-[inherit] box-border"
              style={{
                border: `1px solid ${usernameError ? colors.danger : colors.inputBorder}`,
                background: colors.inputBg,
                color: colors.textPrimary,
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = usernameError ? colors.danger : colors.inputFocusBorder }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = usernameError ? colors.danger : colors.inputBorder }}
            />
          </div>
          {usernameError && (
            <div className="flex items-center gap-1 text-xs mt-1" style={{ color: colors.danger }}>
              <i className="bx bx-error text-[13px]" />
              {usernameError}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-[13px] font-semibold mb-1.5" style={{ color: colors.textBody, letterSpacing: '-0.01em' }}>
            <i className="bx bx-message-square-detail text-sm mr-1 align-[-1px]" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={bioMaxLength}
            placeholder="Tell us a bit about yourself..."
            rows={4}
            className="w-full text-sm p-[11px] rounded-[10px] outline-none transition-colors font-[inherit] box-border resize-y min-h-[80px] leading-[1.5]"
            style={{
              border: `1px solid ${colors.inputBorder}`,
              background: colors.inputBg,
              color: colors.textPrimary,
            }}
            onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.inputFocusBorder }}
            onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = colors.inputBorder }}
          />
          <div className="flex justify-end mt-1">
            <span
              className="text-[11px] font-medium tabular-nums"
              style={{ color: bioCountColor }}
            >
              {bioLength}/{bioMaxLength}
            </span>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isDisabled}
          className="w-full py-3 px-5 rounded-[10px] border-none text-sm font-semibold cursor-pointer transition-opacity font-[inherit] tracking-tight"
          style={{
            background: isDisabled
              ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
              : 'linear-gradient(135deg, #00e5ff, #a900ff)',
            color: isDisabled ? colors.textMuted : '#fff',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1'
          }}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <i className="bx bx-loader-alt bx-spin text-base" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <i className="bx bx-check text-lg" />
              Save Changes
            </span>
          )}
        </button>
      </ProfileCard>

      {/* Upload modals */}
      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        onUploaded={handleAvatarUploaded}
      />
      <CoverUploadModal
        open={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        currentCover={coverUrl}
        onUploaded={handleCoverUploaded}
      />
    </div>
  )
}
