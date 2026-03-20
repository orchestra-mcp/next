'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import ProfileCard from '@/components/profile/profile-card'

interface Badge {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  points_required: number
  awarded_at?: string
  earned: boolean
}

// Seed badges for engfadymondy (testing)
const SEED_BADGES: Badge[] = [
  { id: 1, slug: 'first-feature', name: 'First Feature', description: 'Completed your first feature', icon: 'bx-check-circle', color: '#22c55e', category: 'achievement', points_required: 0, awarded_at: '2026-03-02T14:30:00Z', earned: true },
  { id: 2, slug: 'ten-features', name: 'Feature Pro', description: 'Completed 10 features', icon: 'bx-trophy', color: '#f59e0b', category: 'achievement', points_required: 0, awarded_at: '2026-03-15T10:00:00Z', earned: true },
  { id: 3, slug: 'first-review', name: 'Reviewer', description: 'Submitted your first code review', icon: 'bx-search-alt', color: '#00e5ff', category: 'achievement', points_required: 0, awarded_at: '2026-03-06T10:00:00Z', earned: true },
  { id: 4, slug: 'bug-hunter', name: 'Bug Hunter', description: 'Reported 5 bugs that were fixed', icon: 'bx-bug', color: '#ef4444', category: 'achievement', points_required: 0, awarded_at: '2026-03-10T12:00:00Z', earned: true },
  { id: 5, slug: 'streak-7', name: 'Week Streak', description: '7-day activity streak', icon: 'bxs-hot', color: '#f97316', category: 'streak', points_required: 0, awarded_at: '2026-03-08T00:00:00Z', earned: true },
  { id: 6, slug: 'streak-30', name: 'Month Streak', description: '30-day activity streak', icon: 'bxs-rocket', color: '#f59e0b', category: 'streak', points_required: 0, awarded_at: '2026-03-19T00:00:00Z', earned: true },
  { id: 7, slug: 'points-100', name: 'Centurion', description: 'Earned 100 points', icon: 'bx-star', color: '#00e5ff', category: 'points', points_required: 100, awarded_at: '2026-03-10T12:00:00Z', earned: true },
  { id: 8, slug: 'early-adopter', name: 'Early Adopter', description: 'Joined during beta', icon: 'bx-rocket', color: '#8b5cf6', category: 'special', points_required: 0, awarded_at: '2026-03-01T00:00:00Z', earned: true },
  { id: 9, slug: 'community-star', name: 'Community Star', description: 'Outstanding community contribution', icon: 'bx-heart', color: '#ef4444', category: 'special', points_required: 0, awarded_at: '2026-03-12T15:00:00Z', earned: true },
  // Not yet earned
  { id: 10, slug: 'fifty-features', name: 'Feature Master', description: 'Completed 50 features', icon: 'bx-crown', color: '#a900ff', category: 'achievement', points_required: 0, earned: false },
  { id: 11, slug: 'points-500', name: 'Elite', description: 'Earned 500 points', icon: 'bx-diamond', color: '#a900ff', category: 'points', points_required: 500, earned: false },
  { id: 12, slug: 'points-1000', name: 'Legend', description: 'Earned 1000 points', icon: 'bxs-crown', color: '#f59e0b', category: 'points', points_required: 1000, earned: false },
]

const CATEGORIES = ['all', 'achievement', 'streak', 'points', 'special']

export default function BadgesPage() {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const handle = user?.username || (user?.settings?.handle as string)
        if (!handle) throw new Error('no handle')
        const res = await apiFetch<{ badges: Badge[] }>(`/api/public/member/${handle}/badges`)
        setBadges(res.badges ?? [])
      } catch {
        setBadges(SEED_BADGES)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = filter === 'all' ? badges : badges.filter(b => b.category === filter)
  const earned = filtered.filter(b => b.earned)
  const locked = filtered.filter(b => !b.earned)

  if (loading) return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p></ProfileCard>

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 6 }}>My Badges</h3>
      <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 20 }}>
        {earned.length} earned · {locked.length} locked
      </p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: filter === c ? 'rgba(0,229,255,0.1)' : 'var(--color-bg-alt)',
              border: `1px solid ${filter === c ? 'rgba(0,229,255,0.3)' : 'var(--color-border)'}`,
              color: filter === c ? '#00e5ff' : 'var(--color-fg-muted)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 10 }}>Earned</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 24 }}>
            {earned.map(b => (
              <div key={b.slug} style={{
                padding: '14px 16px', borderRadius: 12,
                border: `1px solid ${b.color}25`,
                background: `${b.color}08`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${b.color}15`, border: `1px solid ${b.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bx ${b.icon}`} style={{ fontSize: 20, color: b.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.description}</div>
                  {b.awarded_at && (
                    <div style={{ fontSize: 10, color: 'var(--color-fg-dim)', marginTop: 2 }}>
                      Earned {new Date(b.awarded_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg-dim)', marginBottom: 10 }}>Locked</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {locked.map(b => (
              <div key={b.slug} style={{
                padding: '14px 16px', borderRadius: 12,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-alt)',
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: 0.5,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'var(--color-bg-active)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`bx ${b.icon}`} style={{ fontSize: 20, color: 'var(--color-fg-dim)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg-muted)' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>{b.description}</div>
                  {b.points_required > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--color-fg-dim)', marginTop: 2 }}>{b.points_required} points required</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ProfileCard>
  )
}
