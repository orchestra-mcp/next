'use client'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { useAdminStore } from '@/store/admin'

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function MemberProfilePage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { isEnabled } = useFeatureFlagsStore()
  const { user } = useAuthStore()
  const {
    profile, posts, loading, error,
    fetchMemberProfile, fetchPosts, clearProfile, likePost, createPost,
  } = useCommunityStore()

  const { fetchSetting } = useAdminStore()
  const [platformDefs, setPlatformDefs] = useState<Record<string, { icon: string; label: string }>>({})
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [publishing, setPublishing] = useState(false)

  const isOwnProfile = user?.settings?.handle === handle

  useEffect(() => {
    fetchMemberProfile(handle)
    fetchPosts(handle)
    return () => clearProfile()
  }, [handle, fetchMemberProfile, fetchPosts, clearProfile])

  useEffect(() => {
    fetchSetting('social_platforms').then(data => {
      const list = data?.platforms
      if (Array.isArray(list)) {
        const map: Record<string, { icon: string; label: string }> = {}
        for (const p of list) map[p.value] = { icon: p.icon, label: p.label }
        setPlatformDefs(map)
      }
    }).catch(() => {})
  }, [])

  // Theme tokens
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const textBody = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'

  function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return formatDate(iso)
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!postTitle.trim() || !postContent.trim()) return
    setPublishing(true)
    try {
      await createPost({ title: postTitle, content: postContent })
      setPostTitle('')
      setPostContent('')
      fetchPosts(handle)
    } catch { /* store handles error */ }
    setPublishing(false)
  }

  if (!isEnabled('community')) return null

  // 404 state
  if (!loading && !profile && error) {
    return (
      <div className="mkt-page" style={{ maxWidth: 640, margin: '0 auto', padding: '120px 32px', textAlign: 'center' }}>
        <i className="bx bx-user-x" style={{ fontSize: 56, color: textMuted, display: 'block', marginBottom: 20 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, marginBottom: 10 }}>Profile not found</h1>
        <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>The member @{handle} does not exist or their profile is private.</p>
        <Link href="/community" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
          textDecoration: 'none',
        }}>
          <i className="bx bx-left-arrow-alt" /> Back to Community
        </Link>
      </div>
    )
  }

  // Loading state
  if (loading && !profile) {
    return (
      <div className="mkt-page" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 32px', textAlign: 'center', color: textMuted, fontSize: 15 }}>
        Loading profile...
      </div>
    )
  }

  if (!profile) return null

  const socialLinks = (Array.isArray(profile.social_links) ? profile.social_links : [])
    .filter(l => l.url)
    .map(l => ({
      key: l.platform,
      icon: platformDefs[l.platform]?.icon || 'bx-link',
      label: platformDefs[l.platform]?.label || l.platform,
      url: l.url,
    }))

  return (
    <div className="mkt-page" style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 72px' }}>
      {/* Cover image */}
      <div style={{
        width: '100%', height: 240, borderRadius: '0 0 20px 20px', overflow: 'hidden',
        background: profile.cover_url
          ? `url(${profile.cover_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #00e5ff 0%, #a900ff 50%, #0f0f12 100%)',
      }} />

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -48 }}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            style={{
              width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
              border: '4px solid',
              borderColor: isDark ? '#0f0f12' : '#f5f5f7',
              boxShadow: '0 0 0 3px rgba(0,229,255,0.3)',
            }}
          />
        ) : (
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 32, fontWeight: 700,
            border: '4px solid',
            borderColor: isDark ? '#0f0f12' : '#f5f5f7',
            boxShadow: '0 0 0 3px rgba(0,229,255,0.3)',
          }}>
            {getInitials(profile.name)}
          </div>
        )}
      </div>

      {/* Profile header */}
      <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em', marginBottom: 4 }}>
          {profile.name}
        </h1>
        <div style={{ fontSize: 15, color: textMuted, marginBottom: 10 }}>@{profile.handle}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {profile.role === 'Core Member' ? (
            <span style={{
              display: 'inline-block', fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 100,
              background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
            }}>
              {profile.role}
            </span>
          ) : (
            <span style={{
              display: 'inline-block', fontSize: 12, fontWeight: 600,
              padding: '4px 12px', borderRadius: 100,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: textMuted,
            }}>
              {profile.role}
            </span>
          )}
          {profile.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: textMuted }}>
              <i className="bx bx-map" style={{ fontSize: 15 }} /> {profile.location}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: textMuted }}>
            <i className="bx bx-calendar" style={{ fontSize: 15 }} /> Member since {formatDate(profile.joined_at)}
          </span>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p style={{ fontSize: 15, color: textBody, lineHeight: 1.7, textAlign: 'center', maxWidth: 560, margin: '0 auto 24px' }}>
          {profile.bio}
        </p>
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          {socialLinks.map(link => (
            <a
              key={link.key}
              href={link.url}
              title={link.label}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: cardBg, border: `1px solid ${cardBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: textMuted, fontSize: 20, textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00e5ff'; (e.currentTarget as HTMLElement).style.color = '#00e5ff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cardBorder; (e.currentTarget as HTMLElement).style.color = textMuted }}
            >
              <i className={`bx ${link.icon}`} />
            </a>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="profile-stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40,
      }}>
        <style>{`
          @media (max-width: 600px) {
            .profile-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        {[
          { label: 'Posts', value: String(profile.stats.posts), icon: 'bx-edit' },
          { label: 'Contributions', value: String(profile.stats.contributions), icon: 'bx-git-merge' },
          { label: 'Completeness', value: `${profile.stats.profile_completeness}%`, icon: 'bx-user-check', bar: true },
          { label: 'Last Active', value: profile.recent_posts.length > 0 ? relativeTime(profile.recent_posts[0].created_at) : 'N/A', icon: 'bx-time-five' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '20px 16px', borderRadius: 14,
            background: cardBg, border: `1px solid ${cardBorder}`,
            textAlign: 'center',
          }}>
            <i className={`bx ${stat.icon}`} style={{ fontSize: 22, color: '#00e5ff', display: 'block', marginBottom: 8 }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: textMuted }}>{stat.label}</div>
            {stat.bar && (
              <div style={{
                marginTop: 8, height: 4, borderRadius: 2,
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${profile.stats.profile_completeness}%`,
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post composer (own profile only) */}
      {isOwnProfile && (
        <div style={{
          padding: '24px', borderRadius: 16,
          background: cardBg, border: `1px solid ${cardBorder}`,
          marginBottom: 32,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>
            Create a Post
          </h3>
          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Post title"
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${inputBorder}`, background: inputBg,
                color: textPrimary, fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
            <textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${inputBorder}`, background: inputBg,
                color: textPrimary, fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={publishing}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  fontSize: 14, fontWeight: 600, color: '#fff',
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  cursor: publishing ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: publishing ? 0.6 : 1,
                }}
              >
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts feed */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 20 }}>
          Posts
        </h2>

        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px', borderRadius: 16,
            background: cardBg, border: `1px solid ${cardBorder}`,
          }}>
            <i className="bx bx-edit" style={{ fontSize: 40, color: textMuted, display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: textMuted }}>No posts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {posts.map(post => (
              <div
                key={post.id}
                style={{
                  padding: '24px', borderRadius: 16,
                  background: cardBg, border: `1px solid ${cardBorder}`,
                  transition: 'border-color 0.2s',
                }}
              >
                <Link
                  href={`/@${handle}/post/${post.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
                    {post.title}
                  </h3>
                  <p style={{
                    fontSize: 14, color: textBody, lineHeight: 1.6, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {post.content}
                  </p>
                </Link>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 100,
                        background: isDark ? 'rgba(0,229,255,0.08)' : 'rgba(169,0,255,0.06)',
                        color: '#00e5ff',
                        border: `1px solid ${isDark ? 'rgba(0,229,255,0.15)' : 'rgba(169,0,255,0.12)'}`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer: date + engagement */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: textMuted }}>
                  <span>{relativeTime(post.created_at)}</span>
                  <button
                    onClick={() => { if (user) likePost(post.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', padding: 0,
                      color: post.liked_by_me ? '#ff4d6a' : textMuted,
                      fontSize: 13, cursor: user ? 'pointer' : 'default', fontFamily: 'inherit',
                    }}
                  >
                    <i className={post.liked_by_me ? 'bx bxs-heart' : 'bx bx-heart'} style={{ fontSize: 16 }} />
                    {post.likes_count}
                  </button>
                  <Link
                    href={`/@${handle}/post/${post.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: textMuted, textDecoration: 'none', fontSize: 13,
                    }}
                  >
                    <i className="bx bx-chat" style={{ fontSize: 16 }} />
                    {post.comments_count}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
