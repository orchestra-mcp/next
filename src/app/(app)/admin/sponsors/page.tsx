'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminSponsor } from '@/store/admin'
import { ConfirmDialog } from '@/components/ConfirmDialog'

type ModalMode = 'create' | 'edit' | null
type TierFilter = 'all' | 'platinum' | 'gold' | 'silver' | 'bronze'

const TIER_COLORS: Record<string, string> = {
  platinum: '#00e5ff',
  gold: '#facc15',
  silver: '#8a8a8a',
  bronze: '#cd7f32',
}

const EMPTY_FORM = {
  name: '',
  logo_url: '',
  website_url: '',
  tier: 'silver' as 'platinum' | 'gold' | 'silver' | 'bronze',
  description: '',
  order: 0,
  status: 'active' as 'active' | 'inactive',
}

export default function AdminSponsorsPage() {
  const router = useRouter()
  const t = useTranslations('admin')
  const { can, roleLoaded } = useRoleStore()
  const { sponsors, loading, error, fetchSponsors, createSponsor, updateSponsor, deleteSponsor, clearError } = useAdminStore()

  const [modal, setModal] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<AdminSponsor | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchSponsors()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const overlayBg = 'rgba(0,0,0,0.5)'
  const modalBg = 'var(--color-bg-contrast)'
  const rowBorder = 'var(--color-bg-alt)'
  const labelColor = 'var(--color-fg-muted)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block',
  }

  const filtered = tierFilter === 'all' ? sponsors : sponsors.filter(s => s.tier === tierFilter)

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setFormError(null)
    setModal('create')
  }

  function openEdit(s: AdminSponsor) {
    setForm({
      name: s.name,
      logo_url: s.logo_url,
      website_url: s.website_url,
      tier: s.tier,
      description: s.description,
      order: s.order,
      status: s.status,
    })
    setEditTarget(s)
    setFormError(null)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setFormError(null)
    setSaving(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Name is required'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (modal === 'edit' && editTarget) {
        await updateSponsor(editTarget.id, form)
      } else {
        await createSponsor(form)
      }
      await fetchSponsors()
      closeModal()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(s: AdminSponsor) {
    setConfirmDialog({
      message: `Delete sponsor "${s.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await deleteSponsor(s.id)
        } catch {
          // error shown via store
        }
      },
    })
  }

  function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
    const color = status === 'active' ? '#22c55e' : 'var(--color-fg-dim)'
    const bg = status === 'active' ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-active)'
    const border = status === 'active' ? 'rgba(34,197,94,0.25)' : 'var(--color-border)'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}`, fontWeight: 600 }}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </span>
    )
  }

  function TierBadge({ tier }: { tier: string }) {
    const color = TIER_COLORS[tier] || '#8a8a8a'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${color}18`, color, border: `1px solid ${color}40`, fontWeight: 600, textTransform: 'capitalize' }}>
        {tier}
      </span>
    )
  }

  const tierFilters: { key: TierFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'platinum', label: 'Platinum' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'bronze', label: 'Bronze' },
  ]

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Back to Admin
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Sponsors</h1>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
              {sponsors.length}
            </span>
          </div>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="bx bx-plus" /> New Sponsor
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>&#x2715;</button>
        </div>
      )}

      {/* Tier filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tierFilters.map(f => {
          const isActive = tierFilter === f.key
          const pillColor = f.key === 'all' ? textMuted : TIER_COLORS[f.key]
          return (
            <button
              key={f.key}
              onClick={() => setTierFilter(f.key)}
              style={{
                padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${isActive ? pillColor : cardBorder}`,
                background: isActive ? `${pillColor}18` : 'transparent',
                color: isActive ? pillColor : textDim,
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 100px 100px 80px 100px 80px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>ID</div>
          <div>Name</div>
          <div>Tier</div>
          <div className="hide-mobile">Website</div>
          <div>Order</div>
          <div>Status</div>
          <div style={{ textAlign: 'end' }}>Actions</div>
        </div>

        {loading && sponsors.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading sponsors...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-buildings" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No sponsors yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Create your first sponsor to get started.</div>
          </div>
        ) : filtered.map((s, idx) => (
          <div key={s.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 100px 100px 80px 100px 80px', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: textDim, fontFamily: 'monospace' }}>{s.id}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
            <div><TierBadge tier={s.tier} /></div>
            <div className="hide-mobile">
              {s.website_url ? (
                <a href={s.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: '#00e5ff', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  Visit
                </a>
              ) : (
                <span style={{ fontSize: 11.5, color: textDim }}>--</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{s.order}</div>
            <div><StatusBadge status={s.status} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <button onClick={() => openEdit(s)} title="Edit" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-pencil" style={{ fontSize: 14 }} />
              </button>
              <button onClick={() => handleDelete(s)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title="Delete Sponsor"
        message={confirmDialog?.message ?? ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* Modal */}
      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: overlayBg, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid var(--color-border)`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                {modal === 'create' ? 'New Sponsor' : 'Edit Sponsor'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>&#x2715;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelSt}>Name</label>
                <input style={inputSt} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sponsor name" />
              </div>
              <div>
                <label style={labelSt}>Logo URL</label>
                <input style={inputSt} value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://example.com/logo.png" />
              </div>
              <div>
                <label style={labelSt}>Website URL</label>
                <input style={inputSt} value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://example.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelSt}>Tier</label>
                  <select style={inputSt} value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as 'platinum' | 'gold' | 'silver' | 'bronze' }))}>
                    <option value="platinum">Platinum</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="bronze">Bronze</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Order</label>
                  <input type="number" style={inputSt} value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} placeholder="0" />
                </div>
              </div>
              <div>
                <label style={labelSt}>Description</label>
                <textarea style={{ ...inputSt, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the sponsor" />
              </div>
              <div>
                <label style={labelSt}>Status</label>
                <select style={inputSt} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {formError && <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : modal === 'create' ? 'Create Sponsor' : 'Save Changes'}
                </button>
                <button onClick={closeModal} style={{ padding: '9px 16px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
