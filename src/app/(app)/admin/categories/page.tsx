'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminCategory } from '@/store/admin'

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { categories, loading, error, fetchCategories, createCategory, deleteCategory, clearError } = useAdminStore()

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchCategories()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const rowBorder = 'var(--color-bg-alt)'

  async function handleAdd() {
    if (!newName.trim()) { setAddError('Name is required'); return }
    setAdding(true)
    setAddError(null)
    try {
      await createCategory(newName.trim())
      setNewName('')
    } catch (e) {
      setAddError((e as Error).message)
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(c: AdminCategory) {
    if (!window.confirm(`Delete category "${c.name}"?`)) return
    try {
      await deleteCategory(c.id)
    } catch {
      // error shown via store
    }
  }

  function TypeBadge({ type }: { type: string }) {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      blog: { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: 'rgba(0,229,255,0.2)' },
      docs: { bg: 'rgba(169,0,255,0.08)', color: '#a900ff', border: 'rgba(169,0,255,0.2)' },
      project: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
    }
    const c = colors[type] ?? { bg: 'var(--color-bg-active)', color: textMuted, border: inputBorder }
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600, textTransform: 'capitalize' }}>
        {type}
      </span>
    )
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Categories</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{categories.length} total categories</p>
      </div>

      {/* Inline add form */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Add Category</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              value={newName}
              onChange={e => { setNewName(e.target.value); setAddError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Category name…"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${addError ? 'rgba(239,68,68,0.4)' : inputBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
            {addError && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>{addError}</div>}
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {adding ? 'Adding…' : 'Add'}
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
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 60px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Name</div>
          <div className="hide-mobile">Slug</div>
          <div>Type</div>
          <div style={{ textAlign: 'end' }}>Actions</div>
        </div>

        {loading && categories.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-category" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No categories yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Add your first category using the form above.</div>
          </div>
        ) : categories.map((c, idx) => (
          <div key={c.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 60px', padding: '13px 20px', borderBottom: idx < categories.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{c.name}</div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textMuted, fontFamily: 'monospace' }}>{c.slug}</div>
            <div><TypeBadge type={c.type} /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => handleDelete(c)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
