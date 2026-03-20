'use client'
import { useState } from 'react'
import { useRoleStore } from '@/store/roles'
import { apiFetch } from '@/lib/api'
import ProfileCard from '@/components/profile/profile-card'

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)', marginBottom: 6, display: 'block' }
const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

interface Transaction {
  id: number
  amount: number
  balance_after: number
  reason: string
  description: string
  created_at: string
}

export default function AdminWalletPage() {
  const { can } = useRoleStore()

  // Award/deduct points
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('admin_grant')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // Award badge to user
  const [badgeUserId, setBadgeUserId] = useState('')
  const [badgeId, setBadgeId] = useState('')
  const [badgeNote, setBadgeNote] = useState('')

  // Lookup user transactions
  const [lookupId, setLookupId] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)

  if (!can('canViewAdmin')) return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Access denied.</p></ProfileCard>

  const sendPoints = async () => {
    if (!userId || !amount) return
    setSending(true); setResult(null)
    try {
      await apiFetch(`/api/admin/users/${userId}/points`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount), reason, description }),
      })
      setResult(`${parseInt(amount) > 0 ? 'Added' : 'Deducted'} ${Math.abs(parseInt(amount))} points`)
      setAmount(''); setDescription('')
    } catch (e) { setResult((e as Error).message) }
    setSending(false)
  }

  const awardBadge = async () => {
    if (!badgeUserId || !badgeId) return
    try {
      await apiFetch(`/api/admin/users/${badgeUserId}/badges`, {
        method: 'POST',
        body: JSON.stringify({ badge_id: parseInt(badgeId), note: badgeNote }),
      })
      alert('Badge awarded')
      setBadgeUserId(''); setBadgeId(''); setBadgeNote('')
    } catch (e) { alert((e as Error).message) }
  }

  const lookupTransactions = async () => {
    if (!lookupId) return
    setLookupLoading(true)
    try {
      const res = await apiFetch<{ transactions: Transaction[] }>(`/api/admin/users/${lookupId}/transactions`)
      setTransactions(res.transactions ?? [])
    } catch {}
    setLookupLoading(false)
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Admin: Wallet & Points</h3>

      {/* Award/deduct points */}
      <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(249,168,37,0.2)', background: 'rgba(249,168,37,0.04)', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>Award / Deduct Points</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div><label style={labelSt}>User ID</label><input style={inputSt} value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" /></div>
          <div><label style={labelSt}>Amount (negative to deduct)</label><input style={inputSt} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50 or -20" /></div>
          <div><label style={labelSt}>Reason</label>
            <select style={inputSt} value={reason} onChange={e => setReason(e.target.value)}>
              <option value="admin_grant">Admin Grant</option>
              <option value="admin_deduct">Admin Deduct</option>
              <option value="feature_completed">Feature Completed</option>
              <option value="bug_reported">Bug Reported</option>
              <option value="bug_fixed">Bug Fixed</option>
              <option value="review_submitted">Review Submitted</option>
              <option value="streak_bonus">Streak Bonus</option>
              <option value="profile_complete">Profile Complete</option>
            </select>
          </div>
          <div><label style={labelSt}>Description</label><input style={inputSt} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" /></div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={saveBtnSt} onClick={sendPoints} disabled={sending}>{sending ? 'Sending...' : 'Submit'}</button>
          {result && <span style={{ fontSize: 12, color: result.startsWith('Added') || result.startsWith('Deducted') ? '#22c55e' : '#ef4444' }}>{result}</span>}
        </div>
      </div>

      {/* Award badge to user */}
      <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.04)', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>Award Badge to User</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div><label style={labelSt}>User ID</label><input style={inputSt} value={badgeUserId} onChange={e => setBadgeUserId(e.target.value)} placeholder="User ID" /></div>
          <div><label style={labelSt}>Badge ID</label><input style={inputSt} value={badgeId} onChange={e => setBadgeId(e.target.value)} placeholder="Badge ID" /></div>
          <div><label style={labelSt}>Note</label><input style={inputSt} value={badgeNote} onChange={e => setBadgeNote(e.target.value)} placeholder="Optional" /></div>
        </div>
        <button style={saveBtnSt} onClick={awardBadge}>Award Badge</button>
      </div>

      {/* Transaction lookup */}
      <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>Transaction History</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ ...inputSt, flex: 1 }} value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="User ID" />
          <button style={saveBtnSt} onClick={lookupTransactions}>Lookup</button>
        </div>
        {lookupLoading ? (
          <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p>
        ) : transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }}>
                <div>
                  <span style={{ fontWeight: 600, color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>{tx.amount > 0 ? '+' : ''}{tx.amount}</span>
                  <span style={{ color: 'var(--color-fg-muted)', marginInlineStart: 8 }}>{tx.reason}</span>
                  {tx.description && <span style={{ color: 'var(--color-fg-dim)', marginInlineStart: 6 }}>— {tx.description}</span>}
                </div>
                <span style={{ color: 'var(--color-fg-dim)', fontSize: 11 }}>{new Date(tx.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : lookupId ? (
          <p style={{ fontSize: 12, color: 'var(--color-fg-dim)' }}>No transactions found.</p>
        ) : null}
      </div>
    </ProfileCard>
  )
}
