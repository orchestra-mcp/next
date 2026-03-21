'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCommunityStore } from '@/store/community'
import { uploadUrl, apiFetch } from '@/lib/api'
import { useProfileTheme } from './use-profile-theme'
import AvatarUploadModal from './avatar-upload-modal'
import CoverUploadModal from './cover-upload-modal'

const CONTENT_SECTIONS = [
  { type: 'doc',            label: 'Docs',   icon: 'bx-file',       color: '#00c853', path: 'docs' },
  { type: 'api_collection', label: 'APIs',   icon: 'bx-collection', color: '#3b82f6', path: 'apis' },
  { type: 'presentation',   label: 'Slides', icon: 'bx-slideshow',  color: '#a900ff', path: 'slides' },
]

const PLATFORM_ICONS: Record<string, string> = {
  website: 'bx-link', github: 'bxl-github', twitter: 'bxl-twitter',
  linkedin: 'bxl-linkedin', youtube: 'bxl-youtube', discord: 'bxl-discord-alt',
  mastodon: 'bxl-mastodon', bluesky: 'bx-hash', instagram: 'bxl-instagram',
  other: 'bx-link-external',
}

const VERIFICATION_COLORS: Record<string, string> = {
  verified: '#00e5ff', contributor: '#22c55e', sponsor: '#f59e0b', enterprise: '#a900ff',
}

interface ProfileSidebarProps { handle: string }

const cardSt: React.CSSProperties = {
  borderRadius: 14,
  border: '1px solid var(--color-border, rgba(255,255,255,0.06))',
  background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
}

export default function ProfileSidebar({ handle }: ProfileSidebarProps) {
  const { colors } = useProfileTheme()
  const { user } = useAuthStore()
  const { profile, fetchMemberProfile } = useCommunityStore()
  const router = useRouter()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [contentShares, setContentShares] = useState<{ entity_type: string; visibility: string }[]>([])
  const isOwner = !!user && (
    user.username === handle || (user.settings?.handle as string) === handle
  )

  useEffect(() => {
    async function loadShares() {
      try {
        const endpoint = isOwner
          ? '/api/community/shares'
          : `/api/public/community/shares/${handle}`
        const res = await apiFetch<{ shares: { entity_type: string; visibility: string }[] }>(
          endpoint, isOwner ? undefined : { skipAuth: true }
        )
        setContentShares(res.shares ?? [])
      } catch { setContentShares([]) }
    }
    loadShares()
  }, [handle, isOwner])

  useEffect(() => {
    if (!profile) return
    import('animejs').then((mod) => {
      const anime = mod.default
      anime({ targets: '.sb-card', opacity: [0, 1], translateY: [10, 0], duration: 420, delay: anime.stagger(60, { start: 120 }), easing: 'easeOutCubic' })
    })
  }, [profile])

  if (!profile) return null

  const socialLinks = (Array.isArray(profile.social_links) ? profile.social_links : []).filter((l: { url: string }) => l.url)
  const avatarSrc = uploadUrl(profile.avatar_url)
  const coverSrc = uploadUrl(profile.cover_url)
  const verification = (profile.verifications ?? [])[0]
  const badges = profile.badges ?? []

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Card 1: Identity ── */}
        <div className="sb-card" style={{ ...cardSt, overflow: 'hidden' }}>
          {/* Mini cover */}
          <div style={{
            height: 80, width: '100%', position: 'relative',
            background: coverSrc
              ? `url(${coverSrc}) center/cover no-repeat`
              : 'linear-gradient(135deg, var(--color-bg-active, rgba(255,255,255,0.06)), var(--color-bg-alt, rgba(255,255,255,0.03)))',
          }}>
            {isOwner && (
              <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 5 }}>
                <button onClick={() => router.push(`/@${handle}/settings/profile`)} style={{
                  height: 26, padding: '0 8px', borderRadius: 7,
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}>
                  <i className="bx bx-pencil" style={{ fontSize: 12 }} />
                  Edit
                </button>
                <button onClick={() => setShowCoverModal(true)} style={{
                  width: 26, height: 26, borderRadius: 7,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 12, padding: 0,
                }}><i className="bx bx-camera" /></button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -36, position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'relative' }}>
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile.name} style={{
                  width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid var(--color-bg, #0a0a0f)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }} />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.accent, color: '#fff', fontSize: 24, fontWeight: 800,
                  border: '3px solid var(--color-bg, #0a0a0f)',
                }}>
                  {(profile.name || '').split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              {isOwner && (
                <button onClick={() => setShowAvatarModal(true)} style={{
                  position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: colors.accent, color: '#fff', border: '2px solid var(--color-bg)', cursor: 'pointer', fontSize: 11, padding: 0,
                }}><i className="bx bx-camera" /></button>
              )}
            </div>
          </div>

          {/* Name + handle + bio + meta */}
          <div style={{ padding: '10px 16px 16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-fg)', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={() => router.push(`/@${handle}`)}>
                {profile.name}
              </span>
              {verification && (
                <span className="group" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <i className="bx bxs-badge-check" style={{ fontSize: 17, color: VERIFICATION_COLORS[verification.slug] ?? verification.color }} />
                  <span className="group-hover:!opacity-100" style={{
                    position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap', borderRadius: 5, padding: '2px 7px', fontSize: 9, fontWeight: 700,
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                    background: 'var(--color-bg)', color: VERIFICATION_COLORS[verification.slug] ?? verification.color,
                    border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10,
                  }}>{verification.badge_text || verification.name}</span>
                </span>
              )}
              {!verification && profile.is_verified && (
                <i className="bx bxs-badge-check" style={{ fontSize: 17, color: '#00e5ff' }} title="Verified" />
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-fg-dim)', marginTop: 1, cursor: 'pointer' }} onClick={() => router.push(`/@${handle}`)}>@{profile.handle}</div>
            {profile.bio && (
              <p
                onClick={() => router.push(`/@${handle}/about`)}
                title="Read full bio"
                style={{
                  fontSize: 12, lineHeight: 1.5, margin: '8px 0 0', color: 'var(--color-fg-muted)',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >{profile.bio}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, color: 'var(--color-fg-dim)', marginTop: 8, flexWrap: 'wrap' }}>
              {profile.location && (<><i className="bx bx-map" style={{ fontSize: 13 }} /><span>{profile.location}</span></>)}
              {profile.location && profile.joined_at && <span style={{ opacity: 0.4 }}>·</span>}
              {profile.joined_at && (<><i className="bx bx-calendar" style={{ fontSize: 13 }} /><span>Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></>)}
            </div>
          </div>
        </div>

        {/* ── Content shortcuts: Docs / APIs / Slides ── */}
        <div className="sb-card" style={{ ...cardSt, padding: '14px 12px', display: 'flex', justifyContent: 'space-around', gap: 8 }}>
          {CONTENT_SECTIONS.map(sec => {
            const items = contentShares.filter(s => s.entity_type === sec.type)
            const count = isOwner ? items.length : items.filter(s => s.visibility === 'public').length
            return (
              <button
                key={sec.type}
                onClick={() => router.push(`/@${handle}/${sec.path}`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${sec.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${sec.color}35` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${sec.color}20` }}
                >
                  <i className={`bx ${sec.icon}`} style={{ fontSize: 22, color: sec.color }} />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Card 2: Badges ── */}
        {profile.show_badges !== false && badges.length > 0 && (
          <div className="sb-card" style={{ ...cardSt, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Badges</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {badges.slice(0, 12).map((badge: { id: number; name: string; icon?: string; color?: string }) => (
                <div key={badge.id} className="group" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/@${handle}/badges`)}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${badge.color ?? '#a900ff'}20`,
                    color: badge.color ?? '#a900ff', fontSize: 16,
                  }}>
                    <i className={`bx ${badge.icon ?? 'bx-medal'}`} />
                  </div>
                  <span className="group-hover:!opacity-100" style={{
                    position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 600,
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                    background: 'var(--color-bg)', color: 'var(--color-fg)', border: '1px solid var(--color-border)', zIndex: 10,
                  }}>{badge.name}</span>
                </div>
              ))}
              {badges.length > 12 && (
                <div
                  onClick={() => router.push(`/@${handle}/badges`)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-bg-active, rgba(255,255,255,0.06))',
                    color: 'var(--color-fg-dim)', fontSize: 10, fontWeight: 700,
                  }}
                >+{badges.length - 12}</div>
              )}
            </div>
          </div>
        )}

        {/* ── Card 3: Social Links ── */}
        {socialLinks.length > 0 && (
          <div className="sb-card" style={{ ...cardSt, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {socialLinks.map((link: { url: string; platform: string }, i: number) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 6px', margin: '0 -6px', borderRadius: 6,
                color: 'var(--color-fg-muted)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-active)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-fg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-muted)' }}
              >
                <i className={`bx ${PLATFORM_ICONS[link.platform] || 'bx-link'}`} style={{ fontSize: 15, width: 16, textAlign: 'center', color: 'var(--color-fg-dim)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </span>
              </a>
            ))}
          </div>
        )}

        {/* ── Card 4: Teams ── */}

        {profile.teams && profile.teams.length > 0 && (
          <div className="sb-card" style={{ ...cardSt, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Teams</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.teams.map(team => (
                <div key={team.slug} className="group" style={{ position: 'relative', cursor: 'pointer' }}>
                  {team.avatar_url ? (
                    <img src={team.avatar_url} alt={team.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--color-bg-active, rgba(255,255,255,0.06))',
                      color: 'var(--color-fg-dim)', fontSize: 12, fontWeight: 700,
                    }}>
                      {team.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <span className="group-hover:!opacity-100" style={{
                    position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 600,
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                    background: 'var(--color-bg)', color: 'var(--color-fg)', border: '1px solid var(--color-border)', zIndex: 10,
                  }}>{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Card 6: Sponsors ── */}
        {profile.sponsors && profile.sponsors.length > 0 && (
          <div className="sb-card" style={{ ...cardSt, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-fg-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sponsors</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[...profile.sponsors].sort((a, b) => a.order - b.order).map(sponsor => (
                <a
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  style={{ position: 'relative', display: 'inline-block', textDecoration: 'none' }}
                >
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', opacity: 0.85, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                  />
                  <span className="group-hover:!opacity-100" style={{
                    position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 600,
                    pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                    background: 'var(--color-bg)', color: 'var(--color-fg)', border: '1px solid var(--color-border)', zIndex: 10,
                  }}>{sponsor.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <AvatarUploadModal open={showAvatarModal} onClose={() => setShowAvatarModal(false)} currentAvatar={profile.avatar_url} onUploaded={() => { setShowAvatarModal(false); fetchMemberProfile(handle) }} />
      <CoverUploadModal open={showCoverModal} onClose={() => setShowCoverModal(false)} currentCover={profile.cover_url} onUploaded={() => { setShowCoverModal(false); fetchMemberProfile(handle) }} />
    </>
  )
}
