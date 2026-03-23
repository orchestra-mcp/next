'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRoleStore } from '@/store/roles'
import { createClient } from '@/lib/supabase/client'
import ProfileCard from '@/components/profile/profile-card'

interface Tier {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  color: string
  badge_text: string
  sort_order: number
}

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)', marginBottom: 6, display: 'block' }
const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

export default function AdminVerificationPage() {
  const { can } = useRoleStore()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Tier> | null>(null)
  const [saving, setSaving] = useState(false)

  // User verification management
  const [userId, setUserId] = useState('')
  const [selectedTier, setSelectedTier] = useState('')
  const [verifyNote, setVerifyNote] = useState('')

  const load = useCallback(async () => {
    try {
      const sb = createClient()
      const { data, error } = await sb
        .from('verification_tiers')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setTiers(data ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (!can('canViewAdmin')) return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Access denied.</p></ProfileCard>

  const saveTier = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const sb = createClient()
      if (editing.id) {
        const { error } = await sb
          .from('verification_tiers')
          .update({
            slug: editing.slug,
            name: editing.name,
            description: editing.description,
            icon: editing.icon,
            color: editing.color,
            badge_text: editing.badge_text,
            sort_order: editing.sort_order,
          })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await sb
          .from('verification_tiers')
          .insert({
            slug: editing.slug,
            name: editing.name,
            description: editing.description,
            icon: editing.icon,
            color: editing.color,
            badge_text: editing.badge_text,
            sort_order: editing.sort_order,
          })
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch {}
    setSaving(false)
  }

  const removeTier = async (id: number) => {
    if (!confirm('Delete this verification tier?')) return
    const sb = createClient()
    await sb.from('verification_tiers').delete().eq('id', id)
    await load()
  }

  const verifyUser = async () => {
    if (!userId || !selectedTier) return
    try {
      const sb = createClient()
      const { error } = await sb
        .from('verifications')
        .insert({
          user_id: parseInt(userId),
          tier_id: parseInt(selectedTier),
          note: verifyNote || null,
        })
      if (error) throw new Error(error.message)
      setUserId(''); setSelectedTier(''); setVerifyNote('')
      alert('User verified successfully')
    } catch (e) { alert((e as Error).message) }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Admin: Verification Tiers</h3>

      {/* Verify a user */}
      <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.04)', marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>Verify a User</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div><label style={labelSt}>User ID</label><input style={inputSt} value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" /></div>
          <div><label style={labelSt}>Tier</label>
            <select style={inputSt} value={selectedTier} onChange={e => setSelectedTier(e.target.value)}>
              <option value="">Select tier</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label style={labelSt}>Note</label><input style={inputSt} value={verifyNote} onChange={e => setVerifyNote(e.target.value)} placeholder="Optional" /></div>
        </div>
        <button style={saveBtnSt} onClick={verifyUser}>Verify User</button>
      </div>

      {/* Tier management */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>Tier Definitions</div>
        <button style={saveBtnSt} onClick={() => setEditing({ slug: '', name: '', description: '', icon: 'bxs-badge-check', color: '#00e5ff', badge_text: '', sort_order: 0 })}>
          <i className="bx bx-plus" style={{ marginInlineEnd: 4 }} /> New Tier
        </button>
      </div>

      {editing && (
        <div style={{ padding: 16, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={labelSt}>Slug</label><input style={inputSt} value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div><label style={labelSt}>Name</label><input style={inputSt} value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label style={labelSt}>Icon</label><input style={inputSt} value={editing.icon ?? ''} onChange={e => setEditing({ ...editing, icon: e.target.value })} /></div>
            <div><label style={labelSt}>Color</label><input style={inputSt} type="color" value={editing.color ?? '#00e5ff'} onChange={e => setEditing({ ...editing, color: e.target.value })} /></div>
            <div><label style={labelSt}>Badge Text</label><input style={inputSt} value={editing.badge_text ?? ''} onChange={e => setEditing({ ...editing, badge_text: e.target.value })} /></div>
            <div><label style={labelSt}>Sort Order</label><input style={inputSt} type="number" value={editing.sort_order ?? 0} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><label style={labelSt}>Description</label><textarea style={{ ...inputSt, height: 50, resize: 'vertical' }} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button style={saveBtnSt} onClick={saveTier} disabled={saving}>{saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}</button>
            <button style={{ ...saveBtnSt, background: 'var(--color-bg-active)', color: 'var(--color-fg)' }} onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p>
      ) : tiers.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>No verification tiers defined.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tiers.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className={`bx ${t.icon}`} style={{ fontSize: 20, color: t.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>{t.badge_text || t.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(t)} style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: 13 }}>Edit</button>
                <button onClick={() => removeTier(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
