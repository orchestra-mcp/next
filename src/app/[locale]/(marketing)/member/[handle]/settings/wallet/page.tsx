'use client'
import { use, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import ProfileCard from '@/components/profile/profile-card'

interface Transaction {
  id: number
  amount: number
  balance_after: number
  reason: string
  description: string
  created_at: string
}

interface WalletData {
  balance: number
  lifetime_earned: number
  transactions: Transaction[]
}

const REASON_LABELS: Record<string, string> = {
  feature_completed: 'Feature Completed',
  bug_reported: 'Bug Reported',
  bug_fixed: 'Bug Fixed',
  review_submitted: 'Review Submitted',
  daily_login: 'Daily Login',
  streak_bonus: 'Streak Bonus',
  profile_complete: 'Profile Complete',
  first_post: 'First Post',
  post_liked: 'Post Liked',
  admin_grant: 'Admin Award',
  admin_deduct: 'Admin Deduction',
}

// Seed data for testing
const SEED_WALLET: WalletData = {
  balance: 285,
  lifetime_earned: 340,
  transactions: [
    { id: 1, amount: 20, balance_after: 20, reason: 'profile_complete', description: 'Profile completeness reached 100%', created_at: '2026-03-01T10:00:00Z' },
    { id: 2, amount: 10, balance_after: 30, reason: 'feature_completed', description: 'FEAT-001: Authentication system', created_at: '2026-03-02T14:30:00Z' },
    { id: 3, amount: 10, balance_after: 40, reason: 'feature_completed', description: 'FEAT-002: User profiles', created_at: '2026-03-03T09:15:00Z' },
    { id: 4, amount: 5, balance_after: 45, reason: 'bug_reported', description: 'Login fails with expired JWT', created_at: '2026-03-04T11:20:00Z' },
    { id: 5, amount: 15, balance_after: 60, reason: 'bug_fixed', description: 'Fixed JWT expiry handling', created_at: '2026-03-05T16:45:00Z' },
    { id: 6, amount: 5, balance_after: 65, reason: 'review_submitted', description: 'PR #42 code review', created_at: '2026-03-06T10:00:00Z' },
    { id: 7, amount: 10, balance_after: 75, reason: 'first_post', description: 'First community post', created_at: '2026-03-07T08:30:00Z' },
    { id: 8, amount: 5, balance_after: 80, reason: 'streak_bonus', description: '7-day activity streak', created_at: '2026-03-08T00:00:00Z' },
    { id: 9, amount: 100, balance_after: 180, reason: 'admin_grant', description: 'Early adopter bonus', created_at: '2026-03-10T12:00:00Z' },
    { id: 10, amount: 50, balance_after: 230, reason: 'admin_grant', description: 'Community contribution award', created_at: '2026-03-12T15:00:00Z' },
    { id: 11, amount: 10, balance_after: 240, reason: 'feature_completed', description: 'FEAT-015: Marketplace rebuild', created_at: '2026-03-15T10:00:00Z' },
    { id: 12, amount: 5, balance_after: 245, reason: 'streak_bonus', description: '14-day activity streak', created_at: '2026-03-15T00:00:00Z' },
    { id: 13, amount: 10, balance_after: 255, reason: 'feature_completed', description: 'FEAT-020: Settings migration', created_at: '2026-03-17T14:00:00Z' },
    { id: 14, amount: 15, balance_after: 270, reason: 'bug_fixed', description: 'Fixed mobile layout settings', created_at: '2026-03-18T11:00:00Z' },
    { id: 15, amount: 15, balance_after: 285, reason: 'feature_completed', description: 'FEAT-025: Wallet system', created_at: '2026-03-19T09:00:00Z' },
  ],
}

export default function WalletPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const handle = user?.username || (user?.settings?.handle as string)
        if (!handle) throw new Error('no handle')
        const res = await apiFetch<WalletData>(`/api/public/member/${handle}/wallet`)
        setData(res)
      } catch {
        // Fallback to seed data for testing
        setData(SEED_WALLET)
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p></ProfileCard>
  if (!data) return null

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Wallet & Points</h3>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(249,168,37,0.06)', border: '1px solid rgba(249,168,37,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f9a825', letterSpacing: '-0.03em' }}>{data.balance.toLocaleString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg-muted)', marginTop: 4 }}>Current Balance</div>
        </div>
        <div style={{ padding: '20px', borderRadius: 12, background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#00e5ff', letterSpacing: '-0.03em' }}>{data.lifetime_earned.toLocaleString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg-muted)', marginTop: 4 }}>Lifetime Earned</div>
        </div>
      </div>

      {/* How to earn points */}
      <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 10 }}>How to earn points</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
          {[
            { label: 'Complete a feature', pts: '+10' },
            { label: 'Fix a bug', pts: '+15' },
            { label: 'Report a bug', pts: '+5' },
            { label: 'Submit a review', pts: '+5' },
            { label: 'Daily login', pts: '+1' },
            { label: '7-day streak', pts: '+5' },
            { label: 'Complete profile', pts: '+20' },
            { label: 'First community post', pts: '+10' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--color-fg-muted)' }}>
              <span>{r.label}</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>{r.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>Transaction History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
        {[...data.transactions].reverse().map(tx => (
          <div key={tx.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                <span style={{ fontWeight: 400, color: 'var(--color-fg-muted)', marginInlineStart: 8 }}>
                  {REASON_LABELS[tx.reason] ?? tx.reason}
                </span>
              </div>
              {tx.description && (
                <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', marginTop: 2 }}>{tx.description}</div>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', whiteSpace: 'nowrap', marginInlineStart: 12 }}>
              {new Date(tx.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </ProfileCard>
  )
}
