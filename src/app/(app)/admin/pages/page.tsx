'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminPage } from '@/store/admin'

type ModalMode = 'create' | 'edit' | null

const EMPTY_FORM = { title: '', content: '', status: 'draft' as 'draft' | 'published' }

export default function AdminPagesPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { pages, loading, error, fetchPages, createPage, updatePage, deletePage, clearError } = useAdminStore()

  const [modal, setModal] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<AdminPage | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchPages()
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

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setFormError(null)
    setModal('create')
  }

  function openEdit(p: AdminPage) {
    setForm({ title: p.title, content: p.content, status: p.status })
    setEditTarget(p)
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
    if (!form.title.trim()) { setFormError('Title is required'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (modal === 'edit' && editTarget) {
        await updatePage(editTarget.id, form)
      } else {
        await createPage(form)
      }
      closeModal()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: AdminPage) {
    if (!window.confirm(`Delete page "${p.title}"? This cannot be undone.`)) return
    try {
      await deletePage(p.id)
    } catch {
      // error shown via store
    }
  }

  function StatusBadge({ status }: { status: 'draft' | 'published' }) {
    const color = status === 'published' ? '#22c55e' : 'var(--color-fg-dim)'
    const bg = status === 'published' ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-active)'
    const border = status === 'published' ? 'rgba(34,197,94,0.25)' : 'var(--color-border)'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}`, fontWeight: 600, textTransform: 'capitalize' }}>
        {status}
      </span>
    )
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Pages</h1>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
              {pages.length}
            </span>
          </div>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="bx bx-plus" /> New Page
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 120px 80px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Title</div>
          <div className="hide-mobile">Slug</div>
          <div>Status</div>
          <div className="hide-mobile">Updated</div>
          <div style={{ textAlign: 'end' }}>Actions</div>
        </div>

        {loading && pages.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading pages…
          </div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-file-blank" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No pages yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Create your first page to get started.</div>
          </div>
        ) : pages.map((p, idx) => (
          <div key={p.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 120px 80px', padding: '13px 20px', borderBottom: idx < pages.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.slug}</div>
            <div><StatusBadge status={p.status} /></div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textMuted }}>{fmt(p.updated_at)}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <button onClick={() => openEdit(p)} title="Edit" style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-pencil" style={{ fontSize: 14 }} />
              </button>
              <button onClick={() => handleDelete(p)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: overlayBg, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid var(--color-border)`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                {modal === 'create' ? 'New Page' : 'Edit Page'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelSt}>Title</label>
                <input style={inputSt} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Page title…" />
              </div>
              <div>
                <label style={labelSt}>Content</label>
                <textarea style={{ ...inputSt, height: 140, resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Page content…" />
              </div>
              <div>
                <label style={labelSt}>Status</label>
                <select style={inputSt} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {formError && <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Page' : 'Save Changes'}
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
