'use client'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useCommunityStore } from '@/store/community'
import type { BadgeItem } from '@/store/community'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import { createClient } from '@/lib/supabase/client'

interface FullBadge extends BadgeItem {
  earned: boolean
  points_required?: number
}

const SEED_ALL: FullBadge[] = [
  { id: 1, slug: 'first-feature', name: 'First Feature', description: 'Completed your first feature', icon: 'bx-check-circle', color: '#22c55e', category: 'achievement', awarded_at: '2026-03-02T14:30:00Z', earned: true },
  { id: 2, slug: 'ten-features', name: 'Feature Pro', description: 'Completed 10 features', icon: 'bx-trophy', color: '#f59e0b', category: 'achievement', awarded_at: '2026-03-15T10:00:00Z', earned: true },
  { id: 3, slug: 'first-review', name: 'Reviewer', description: 'First code review', icon: 'bx-search-alt', color: '#00e5ff', category: 'achievement', awarded_at: '2026-03-06T10:00:00Z', earned: true },
  { id: 4, slug: 'bug-hunter', name: 'Bug Hunter', description: 'Reported 5 bugs that were fixed', icon: 'bx-bug', color: '#ef4444', category: 'achievement', awarded_at: '2026-03-10T12:00:00Z', earned: true },
  { id: 5, slug: 'streak-7', name: 'Week Streak', description: '7-day activity streak', icon: 'bxs-hot', color: '#f97316', category: 'streak', awarded_at: '2026-03-08T00:00:00Z', earned: true },
  { id: 6, slug: 'streak-30', name: 'Month Streak', description: '30-day activity streak', icon: 'bxs-rocket', color: '#f59e0b', category: 'streak', awarded_at: '2026-03-19T00:00:00Z', earned: true },
  { id: 7, slug: 'points-100', name: 'Centurion', description: 'Earned 100 points', icon: 'bx-star', color: '#00e5ff', category: 'points', awarded_at: '2026-03-10T12:00:00Z', earned: true, points_required: 100 },
  { id: 8, slug: 'early-adopter', name: 'Early Adopter', description: 'Joined during beta', icon: 'bx-rocket', color: '#8b5cf6', category: 'special', awarded_at: '2026-03-01T00:00:00Z', earned: true },
  { id: 9, slug: 'community-star', name: 'Community Star', description: 'Outstanding community contribution', icon: 'bx-heart', color: '#ef4444', category: 'special', awarded_at: '2026-03-12T15:00:00Z', earned: true },
  { id: 10, slug: 'fifty-features', name: 'Feature Master', description: 'Completed 50 features', icon: 'bx-crown', color: '#a900ff', category: 'achievement', awarded_at: '', earned: false },
  { id: 11, slug: 'points-500', name: 'Elite', description: 'Earned 500 points', icon: 'bx-diamond', color: '#a900ff', category: 'points', awarded_at: '', earned: false, points_required: 500 },
  { id: 12, slug: 'points-1000', name: 'Legend', description: 'Earned 1000 points', icon: 'bxs-crown', color: '#f59e0b', category: 'points', awarded_at: '', earned: false, points_required: 1000 },
]

const CATEGORIES = ['all', 'achievement', 'streak', 'points', 'special']

interface PageProps { params: Promise<{ handle: string }> }

export default function PublicBadgesPage(props: PageProps) {
  const { handle } = use(props.params)
  const { profile } = useCommunityStore()
  const { colors } = useProfileTheme()
  const [badges, setBadges] = useState<FullBadge[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        // Fetch user's badges with badge details via join
        const { data: userData, error: userError } = await sb.from('users').select('id').eq('handle', handle).single()
        if (userError) throw userError
        const userId = userData.id
        const { data, error } = await sb.from('user_badges').select('*, badge:badges(*)').eq('user_id', userId)
        if (error) throw error
        // Map the joined data to FullBadge format
        const mapped: FullBadge[] = (data ?? []).map((ub: any) => ({
          id: ub.badge?.id ?? ub.id,
          slug: ub.badge?.slug ?? '',
          name: ub.badge?.name ?? '',
          description: ub.badge?.description ?? '',
          icon: ub.badge?.icon ?? '',
          color: ub.badge?.color ?? '',
          category: ub.badge?.category ?? '',
          awarded_at: ub.awarded_at ?? '',
          earned: true,
          points_required: ub.badge?.points_required,
        }))
        setBadges(mapped)
      } catch {
        setBadges(SEED_ALL)
      }
      setLoading(false)
    }
    load()
  }, [handle])

  // Privacy check
  if (profile && profile.show_badges === false) {
    return (
      <ProfileSection title="Badges" icon="bx-medal">
        <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>This user has hidden their badges.</p>
      </ProfileSection>
    )
  }

  const filtered = filter === 'all' ? badges : badges.filter(b => b.category === filter)
  const earned = filtered.filter(b => b.earned)
  const locked = filtered.filter(b => !b.earned)

  if (loading) return <ProfileSection title="Badges" icon="bx-medal"><p style={{ fontSize: 13, color: colors.textMuted }}>Loading...</p></ProfileSection>

  return (
    <ProfileSection title={`${profile?.name ?? handle}'s Badges`} description={`${earned.length} earned · ${locked.length} locked`} icon="bx-medal">
      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: filter === c ? 'rgba(0,229,255,0.1)' : colors.cardBg,
            border: `1px solid ${filter === c ? 'rgba(0,229,255,0.3)' : colors.cardBorder}`,
            color: filter === c ? '#00e5ff' : colors.textMuted,
            cursor: 'pointer', textTransform: 'capitalize',
          }}>{c}</button>
        ))}
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 10 }}>Earned</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {earned.map(b => (
              <Link key={b.slug} href={`/@${handle}/badges/${b.slug}`} style={{ textDecoration: 'none' }}>
                <ProfileCard variant="default" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${b.color}15`, border: `1px solid ${b.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bx ${b.icon}`} style={{ fontSize: 20, color: b.color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</div>
                    {b.awarded_at && <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>Earned {new Date(b.awarded_at).toLocaleDateString()}</div>}
                  </div>
                </ProfileCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 10 }}>Locked</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {locked.map(b => (
              <ProfileCard key={b.slug} variant="default" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.45 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: colors.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bx ${b.icon}`} style={{ fontSize: 20, color: colors.textMuted }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>{b.description}</div>
                  {b.points_required ? <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{b.points_required} pts required</div> : null}
                </div>
              </ProfileCard>
            ))}
          </div>
        </div>
      )}
    </ProfileSection>
  )
}
