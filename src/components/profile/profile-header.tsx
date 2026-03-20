'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCommunityStore } from '@/store/community'
import { uploadUrl } from '@/lib/api'
import { useProfileTheme } from './use-profile-theme'
import AvatarUploadModal from './avatar-upload-modal'
import CoverUploadModal from './cover-upload-modal'

const PLATFORM_ICONS: Record<string, string> = {
  website: 'bx-link',
  github: 'bxl-github',
  twitter: 'bxl-twitter',
  linkedin: 'bxl-linkedin',
  youtube: 'bxl-youtube',
  discord: 'bxl-discord-alt',
  mastodon: 'bxl-mastodon',
  bluesky: 'bx-hash',
  instagram: 'bxl-instagram',
  other: 'bx-link-external',
}

interface ProfileHeaderProps {
  handle: string
}

export default function ProfileHeader({ handle }: ProfileHeaderProps) {
  const { isDark, colors } = useProfileTheme()
  const { user } = useAuthStore()
  const { profile, fetchMemberProfile } = useCommunityStore()

  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const router = useRouter()

  const isOwner = !!user && (
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )

  // anime.js stagger entrance
  useEffect(() => {
    if (!profile) return
    import('animejs').then((mod) => {
      const anime = mod.default
      anime({ targets: '.profile-enter-name', opacity: [0, 1], translateY: [20, 0], duration: 600, delay: 200, easing: 'easeOutCubic' })
      anime({ targets: '.profile-enter-handle', opacity: [0, 1], translateY: [12, 0], duration: 500, delay: 300, easing: 'easeOutCubic' })
      anime({ targets: '.profile-enter-bio', opacity: [0, 1], translateY: [16, 0], duration: 600, delay: 400, easing: 'easeOutCubic' })
      anime({ targets: '.profile-enter-meta', opacity: [0, 1], translateY: [12, 0], duration: 500, delay: 500, easing: 'easeOutCubic' })
      anime({ targets: '.profile-enter-socials', opacity: [0, 1], translateY: [12, 0], duration: 500, delay: 600, easing: 'easeOutCubic' })
      anime({ targets: '.profile-enter-badges', opacity: [0, 1], translateY: [12, 0], duration: 500, delay: 700, easing: 'easeOutCubic' })
    })
  }, [profile])

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!profile) return null

  const socialLinks = (Array.isArray(profile.social_links) ? profile.social_links : [])
    .filter((l: { url: string }) => l.url)

  const coverSrc = uploadUrl(profile.cover_url)
  const avatarSrc = uploadUrl(profile.avatar_url)

  return (
    <>

      {/* Cover Image */}
      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{ borderColor: colors.cardBorder }}
      >
        <div
          className="w-full"
          style={{
            height: 'var(--profile-cover-height)',
            background: coverSrc
              ? `url(${coverSrc}) center/cover no-repeat`
              : 'linear-gradient(135deg, var(--color-bg-alt, rgba(255,255,255,0.03)) 0%, var(--color-bg-active, rgba(255,255,255,0.06)) 100%)',
          }}
        />
        {isOwner && (
          <div className="absolute top-3 right-3 sm:bottom-3 sm:top-auto sm:right-4 flex items-center gap-2" style={{ zIndex: 2 }}>
            <button
              onClick={() => router.push(`/@${handle}/settings`)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white cursor-pointer backdrop-blur-md transition-opacity hover:opacity-90"
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <i className="bx bx-cog text-sm" /> <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-white cursor-pointer backdrop-blur-md transition-opacity hover:opacity-90"
              style={{
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <i className="bx bx-camera text-sm" /> <span className="hidden sm:inline">Edit Cover</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-8">
        <div className="flex items-end gap-4 sm:gap-5" style={{ marginTop: 'var(--profile-avatar-overlap)' }}>
          {/* Avatar */}
          <div className="relative flex-shrink-0" style={{ zIndex: 2 }}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile.name}
                className="rounded-[14px] object-cover border"
                style={{
                  width: 'var(--profile-avatar-size)',
                  height: 'var(--profile-avatar-size)',
                  borderColor: colors.cardBorder,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                }}
              />
            ) : (
              <div
                className="rounded-[14px] flex items-center justify-center text-white text-4xl font-bold border"
                style={{
                  width: 'var(--profile-avatar-size)',
                  height: 'var(--profile-avatar-size)',
                  background: colors.accent,
                  borderColor: colors.cardBorder,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                }}
              >
                {(profile.name || '').split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            {isOwner && (
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-white text-sm p-0"
                style={{
                  background: colors.accent,
                  border: '2px solid var(--color-bg, #0a0a0f)',
                }}
              >
                <i className="bx bx-camera" />
              </button>
            )}
          </div>

          {/* Name + handle */}
          <div className="pb-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap profile-enter-name">
              <h1
                className="text-[26px] sm:text-[30px] font-extrabold leading-tight m-0 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  color: colors.textPrimary,
                  letterSpacing: '-0.03em',
                }}
                onClick={() => router.push(`/@${handle}`)}
              >
                {profile.name}
              </h1>
              {/* Verification — show highest priority tier as single icon with tooltip */}
              {(() => {
                const v = (profile.verifications ?? [])[0]
                if (v) return (
                  <span
                    key={v.slug}
                    className="group relative flex items-center justify-center"
                    title={v.badge_text || v.name}
                  >
                    <i
                      className={`bx ${v.icon} text-[22px]`}
                      style={{ color: v.color }}
                    />
                    <span
                      className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ background: 'var(--color-bg-alt, rgba(0,0,0,0.85))', color: v.color, border: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}
                    >
                      {v.badge_text || v.name}
                    </span>
                  </span>
                )
                // Fallback: legacy is_verified
                if (profile.is_verified) return (
                  <span className="relative flex items-center" title="Verified">
                    <i className="bx bxs-badge-check text-[22px]" style={{ color: colors.accent }} />
                  </span>
                )
                return null
              })()}
            </div>
            <div
              className="text-sm mt-0.5 profile-enter-handle cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: colors.textMuted }}
              onClick={() => router.push(`/@${handle}`)}
            >
              @{profile.handle}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            className="profile-enter-bio text-[14.5px] leading-relaxed mt-4 mb-0 max-w-[680px]"
            style={{ color: colors.textSecondary }}
          >
            {profile.bio}
          </p>
        )}

        {/* Location + Joined + Points */}
        <div className="profile-enter-meta flex items-center gap-4 mt-3 flex-wrap">
          {profile.location && (
            <span
              className="inline-flex items-center gap-1.5 text-[13px]"
              style={{ color: colors.textMuted }}
            >
              <i className="bx bx-map text-[15px]" /> {profile.location}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1.5 text-[13px]"
            style={{ color: colors.textMuted }}
          >
            <i className="bx bx-calendar text-[15px]" /> Joined {formatDate(profile.joined_at)}
          </span>
          {profile.show_wallet !== false && profile.stats?.points != null && profile.stats.points > 0 && (
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: '#f9a825' }}
              onClick={() => router.push(`/@${handle}/wallet`)}
              title="View point history"
            >
              <i className="bx bx-star text-[15px]" /> {profile.stats.points.toLocaleString()} pts
            </span>
          )}
        </div>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="profile-enter-socials flex gap-2 mt-3.5">
            {socialLinks.map((link: { url: string; platform: string }, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.platform}
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-lg no-underline transition-all duration-200 hover:scale-110"
                style={{
                  color: colors.textMuted,
                  background: 'var(--color-bg-active, rgba(255,255,255,0.06))',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-accent, #00e5ff)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(0,229,255,0.1)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = colors.textMuted
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--color-bg-active, rgba(255,255,255,0.06))'
                }}
              >
                <i className={`bx ${PLATFORM_ICONS[link.platform] || 'bx-link'}`} />
              </a>
            ))}
          </div>
        )}
        {/* Badges — circular icon grid, GitHub achievements style */}
        {profile.show_badges !== false && (profile.badges ?? []).length > 0 && (
          <div className="profile-enter-badges mt-5">
            <div className="flex flex-wrap gap-2.5">
              {(profile.badges ?? []).map(badge => (
                <div
                  key={badge.slug}
                  className="group relative flex items-center justify-center rounded-full cursor-pointer transition-transform duration-200 hover:scale-110"
                  style={{
                    width: 44,
                    height: 44,
                    background: `${badge.color}15`,
                    border: `1.5px solid ${badge.color}25`,
                  }}
                  title={`${badge.name} — ${badge.description}`}
                  onClick={() => router.push(`/@${handle}/badges`)}
                >
                  <i
                    className={`bx ${badge.icon}`}
                    style={{ fontSize: 20, color: badge.color }}
                  />
                  {/* Tooltip */}
                  <span
                    className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: 'var(--color-bg-alt, rgba(0,0,0,0.85))',
                      color: 'var(--color-fg, #f8f8f8)',
                      border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                    }}
                  >
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push(`/@${handle}/badges`)}
              className="mt-2 text-[12px] font-medium cursor-pointer bg-transparent border-none p-0 transition-opacity hover:opacity-70"
              style={{ color: colors.textMuted }}
            >
              {(profile.badges ?? []).length} badges earned
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AvatarUploadModal
        open={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={profile.avatar_url}
        onUploaded={() => { setShowAvatarModal(false); fetchMemberProfile(handle) }}
      />
      <CoverUploadModal
        open={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        currentCover={profile.cover_url}
        onUploaded={() => { setShowCoverModal(false); fetchMemberProfile(handle) }}
      />
    </>
  )
}
