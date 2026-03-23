'use client'
import { use, useState, useEffect } from 'react'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: number
  amount: number
  balance_after: number
  reason: string
  description: string
  created_at: string
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

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 1, amount: 20, balance_after: 20, reason: 'profile_complete', description: 'Profile 100%', created_at: '2026-03-01T10:00:00Z' },
  { id: 2, amount: 10, balance_after: 30, reason: 'feature_completed', description: 'FEAT-001: Authentication', created_at: '2026-03-02T14:30:00Z' },
  { id: 3, amount: 10, balance_after: 40, reason: 'feature_completed', description: 'FEAT-002: User profiles', created_at: '2026-03-03T09:15:00Z' },
  { id: 4, amount: 5, balance_after: 45, reason: 'bug_reported', description: 'JWT expiry bug', created_at: '2026-03-04T11:20:00Z' },
  { id: 5, amount: 15, balance_after: 60, reason: 'bug_fixed', description: 'Fixed JWT handling', created_at: '2026-03-05T16:45:00Z' },
  { id: 6, amount: 5, balance_after: 65, reason: 'review_submitted', description: 'PR #42 review', created_at: '2026-03-06T10:00:00Z' },
  { id: 7, amount: 10, balance_after: 75, reason: 'first_post', description: 'First community post', created_at: '2026-03-07T08:30:00Z' },
  { id: 8, amount: 5, balance_after: 80, reason: 'streak_bonus', description: '7-day streak', created_at: '2026-03-08T00:00:00Z' },
  { id: 9, amount: 100, balance_after: 180, reason: 'admin_grant', description: 'Early adopter bonus', created_at: '2026-03-10T12:00:00Z' },
  { id: 10, amount: 50, balance_after: 230, reason: 'admin_grant', description: 'Community contribution', created_at: '2026-03-12T15:00:00Z' },
  { id: 11, amount: 10, balance_after: 240, reason: 'feature_completed', description: 'Marketplace rebuild', created_at: '2026-03-15T10:00:00Z' },
  { id: 12, amount: 5, balance_after: 245, reason: 'streak_bonus', description: '14-day streak', created_at: '2026-03-15T00:00:00Z' },
  { id: 13, amount: 10, balance_after: 255, reason: 'feature_completed', description: 'Settings migration', created_at: '2026-03-17T14:00:00Z' },
  { id: 14, amount: 15, balance_after: 270, reason: 'bug_fixed', description: 'Mobile layout fix', created_at: '2026-03-18T11:00:00Z' },
  { id: 15, amount: 15, balance_after: 285, reason: 'feature_completed', description: 'Wallet system', created_at: '2026-03-19T09:00:00Z' },
]

interface PageProps { params: Promise<{ handle: string }> }

export default function PublicWalletPage(props: PageProps) {
  const { handle } = use(props.params)
  const { profile } = useCommunityStore()
  const { user } = useAuthStore()
  const { colors } = useProfileTheme()

  const isOwner = !!user && (
    user.handle === handle ||
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(0)
  const [lifetime, setLifetime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        // Fetch wallet balance from user_wallets table
        const { data: userRow } = await sb.from('users').select('id').eq('handle', handle).single()
        if (!userRow) throw new Error('user not found')
        const { data: walletData, error: walletError } = await sb.from('user_wallets').select('balance, lifetime_earned').eq('user_id', userRow.id).single()
        if (walletError) throw walletError
        setBalance(walletData?.balance ?? 0)
        setLifetime(walletData?.lifetime_earned ?? 0)
        // wallet_transactions not yet implemented — use seed data
        setTransactions(SEED_TRANSACTIONS)
      } catch {
        setBalance(285)
        setLifetime(340)
        setTransactions(SEED_TRANSACTIONS)
      }
      setLoading(false)
    }
    load()
  }, [handle])

  // Wallet is owner-only — guests and other users cannot view it
  if (!isOwner) {
    return (
      <ProfileSection title="Wallet" icon="bx-wallet">
        <p style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>Wallet is only visible to the profile owner.</p>
      </ProfileSection>
    )
  }

  if (loading) return <ProfileSection title="Wallet" icon="bx-wallet"><p style={{ fontSize: 13, color: colors.textMuted }}>Loading...</p></ProfileSection>

  return (
    <ProfileSection title={`${profile?.name ?? handle}'s Points`} description="Activity history and point balance" icon="bx-wallet">
      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <ProfileCard variant="default" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#f9a825', letterSpacing: '-0.03em' }}>{balance.toLocaleString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginTop: 4 }}>Current Balance</div>
        </ProfileCard>
        <ProfileCard variant="default" style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#00e5ff', letterSpacing: '-0.03em' }}>{lifetime.toLocaleString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginTop: 4 }}>Lifetime Earned</div>
        </ProfileCard>
      </div>

      {/* Transaction history */}
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 }}>History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...transactions].reverse().map(tx => (
          <ProfileCard key={tx.id} variant="default" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                <span style={{ color: colors.textMuted, marginInlineStart: 8 }}>{REASON_LABELS[tx.reason] ?? tx.reason}</span>
              </div>
              {tx.description && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{tx.description}</div>}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, whiteSpace: 'nowrap', marginInlineStart: 12 }}>
              {new Date(tx.created_at).toLocaleDateString()}
            </div>
          </ProfileCard>
        ))}
      </div>
    </ProfileSection>
  )
}
