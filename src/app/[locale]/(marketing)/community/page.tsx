'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useCommunityStore } from '@/store/community'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { isEnabled } = useFeatureFlagsStore()
  const { members, membersTotal, loading, fetchMembers } = useCommunityStore()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isEnabled('community')) {
      router.replace('/')
    }
  }, [isEnabled, router])

  useEffect(() => {
    fetchMembers(page, search)
  }, [page, search, fetchMembers])

  // Theme tokens
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'

  function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (!isEnabled('community')) return null

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 56, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          background: isDark ? 'rgba(0,229,255,0.06)' : 'rgba(169,0,255,0.06)',
          border: `1px solid ${isDark ? 'rgba(0,229,255,0.15)' : 'rgba(169,0,255,0.15)'}`,
          fontSize: 13, fontWeight: 600, color: '#00e5ff', marginBottom: 20,
        }}>
          <i className="bx bx-group" style={{ fontSize: 16 }} />
          {membersTotal} Members
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 14,
        }}>
          Our Community
        </h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 480, margin: '0 auto' }}>
          Meet the people building with Orchestra
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
        <div style={{ position: 'relative' }}>
          <i className="bx bx-search" style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: textMuted, pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search members by name or handle..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%', padding: '13px 16px 13px 44px', borderRadius: 12,
              border: `1px solid ${inputBorder}`, background: inputBg,
              color: textPrimary, fontSize: 15, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Member grid */}
      {loading && members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted, fontSize: 15 }}>
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted, fontSize: 15 }}>
          No members found.
        </div>
      ) : (
        <div className="community-member-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          <style>{`
            @media (max-width: 900px) {
              .community-member-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 600px) {
              .community-member-grid { grid-template-columns: 1fr !important; }
            }
            .community-member-card:hover {
              border-color: rgba(0,229,255,0.3) !important;
              box-shadow: 0 0 20px rgba(0,229,255,0.06), 0 0 20px rgba(169,0,255,0.06);
            }
          `}</style>
          {members.map(member => (
            <Link
              key={member.id}
              href={`/@${member.handle}`}
              className="community-member-card"
              style={{
                display: 'flex', flexDirection: 'column', gap: 14,
                padding: '24px', borderRadius: 16,
                background: cardBg, border: `1px solid ${cardBorder}`,
                textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Avatar + name row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    style={{
                      width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid transparent',
                      backgroundImage: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>
                    {getInitials(member.name)}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: 13, color: textMuted }}>@{member.handle}</div>
                </div>
              </div>

              {/* Role badge */}
              <div>
                {member.role === 'Core Member' ? (
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 100,
                    background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                    color: '#fff',
                  }}>
                    {member.role}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-block', fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 100,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    color: textMuted,
                  }}>
                    {member.role}
                  </span>
                )}
              </div>

              {/* Bio snippet */}
              <div style={{
                fontSize: 13, color: textMuted, lineHeight: 1.55,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {member.bio}
              </div>

              {/* Footer: join date + post count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto', fontSize: 12, color: textMuted }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-calendar" style={{ fontSize: 14 }} />
                  {formatDate(member.joined_at)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-edit" style={{ fontSize: 14 }} />
                  {member.post_count} {member.post_count === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {members.length > 0 && members.length < membersTotal && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            style={{
              padding: '12px 32px', borderRadius: 10,
              border: `1px solid ${cardBorder}`, background: cardBg,
              color: textPrimary, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
