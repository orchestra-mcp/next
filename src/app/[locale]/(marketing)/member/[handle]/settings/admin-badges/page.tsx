'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRoleStore } from '@/store/roles'
import { createClient } from '@/lib/supabase/client'
import ProfileCard from '@/components/profile/profile-card'

interface BadgeDef {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  points_required: number
  auto_award: boolean
  sort_order: number
}

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)', marginBottom: 6, display: 'block' }
const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

export default function AdminBadgesPage() {
  const { can } = useRoleStore()
  const [badges, setBadges] = useState<BadgeDef[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<BadgeDef> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const sb = createClient()
      const { data, error } = await sb
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setBadges(data ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (!can('canViewAdmin')) return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Access denied.</p></ProfileCard>

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const sb = createClient()
      if (editing.id) {
        const { error } = await sb
          .from('badges')
          .update({
            slug: editing.slug,
            name: editing.name,
            description: editing.description,
            icon: editing.icon,
            color: editing.color,
            category: editing.category,
            points_required: editing.points_required,
            auto_award: editing.auto_award,
            sort_order: editing.sort_order,
          })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await sb
          .from('badges')
          .insert({
            slug: editing.slug,
            name: editing.name,
            description: editing.description,
            icon: editing.icon,
            color: editing.color,
            category: editing.category,
            points_required: editing.points_required,
            auto_award: editing.auto_award,
            sort_order: editing.sort_order,
          })
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch {}
    setSaving(false)
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this badge?')) return
    const sb = createClient()
    await sb.from('badges').delete().eq('id', id)
    await load()
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>Admin: Badges</h3>
        <button style={saveBtnSt} onClick={() => setEditing({ slug: '', name: '', description: '', icon: 'bx-medal', color: '#00e5ff', category: 'achievement', points_required: 0, auto_award: false, sort_order: 0 })}>
          <i className="bx bx-plus" style={{ marginInlineEnd: 4 }} /> New Badge
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={labelSt}>Slug</label><input style={inputSt} value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="e.g. bug-hunter" /></div>
            <div><label style={labelSt}>Name</label><input style={inputSt} value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label style={labelSt}>Icon (boxicons class)</label><input style={inputSt} value={editing.icon ?? ''} onChange={e => setEditing({ ...editing, icon: e.target.value })} placeholder="bx-medal" /></div>
            <div><label style={labelSt}>Color</label><input style={inputSt} type="color" value={editing.color ?? '#00e5ff'} onChange={e => setEditing({ ...editing, color: e.target.value })} /></div>
            <div><label style={labelSt}>Category</label>
              <select style={inputSt} value={editing.category ?? 'achievement'} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                <option value="achievement">Achievement</option>
                <option value="streak">Streak</option>
                <option value="points">Points</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div><label style={labelSt}>Points Required</label><input style={inputSt} type="number" value={editing.points_required ?? 0} onChange={e => setEditing({ ...editing, points_required: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><label style={labelSt}>Description</label><textarea style={{ ...inputSt, height: 60, resize: 'vertical' }} value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: 'var(--color-fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={editing.auto_award ?? false} onChange={e => setEditing({ ...editing, auto_award: e.target.checked })} /> Auto-award
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button style={saveBtnSt} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}</button>
            <button style={{ ...saveBtnSt, background: 'var(--color-bg-active)', color: 'var(--color-fg)' }} onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Badges list */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p>
      ) : badges.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>No badges defined yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {badges.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className={`bx ${b.icon}`} style={{ fontSize: 20, color: b.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>{b.category} · {b.auto_award ? 'auto' : 'manual'}{b.points_required > 0 ? ` · ${b.points_required} pts` : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(b)} style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: 13 }}>Edit</button>
                <button onClick={() => remove(b.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
