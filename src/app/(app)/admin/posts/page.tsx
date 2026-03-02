'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminPost } from '@/store/admin'

type ModalMode = 'create' | 'edit' | null

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  status: 'draft' as 'draft' | 'published',
  published_at: '',
}

export default function AdminPostsPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { posts, loading, error, fetchPosts, createPost, updatePost, deletePost, clearError } = useAdminStore()

  const [modal, setModal] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<AdminPost | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchPosts()
  }, [roleLoaded])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const overlayBg = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)'
  const modalBg = isDark ? '#1a1520' : '#ffffff'
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'

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

  function openEdit(p: AdminPost) {
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      status: p.status,
      published_at: p.published_at ? p.published_at.slice(0, 10) : '',
    })
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
      const payload = {
        ...form,
        published_at: form.published_at || null,
      }
      if (modal === 'edit' && editTarget) {
        await updatePost(editTarget.id, payload)
      } else {
        await createPost(payload)
      }
      closeModal()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: AdminPost) {
    if (!window.confirm(`Delete post "${p.title}"? This cannot be undone.`)) return
    try {
      await deletePost(p.id)
    } catch {
      // error shown via store
    }
  }

  function StatusBadge({ status }: { status: 'draft' | 'published' }) {
    const color = status === 'published' ? '#22c55e' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
    const bg = status === 'published' ? 'rgba(34,197,94,0.1)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
    const border = status === 'published' ? 'rgba(34,197,94,0.25)' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}`, fontWeight: 600, textTransform: 'capitalize' }}>
        {status}
      </span>
    )
  }

  function fmt(d: string | null) {
    if (!d) return <span style={{ color: textDim, fontStyle: 'italic' }}>Draft</span>
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Posts</h1>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', color: textMuted }}>
              {posts.length}
            </span>
          </div>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="bx bx-plus" /> New Post
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
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 100px 140px 72px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Title</div>
          <div>Status</div>
          <div>Published</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {loading && posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-news" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No posts yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Create your first post to get started.</div>
          </div>
        ) : posts.map((p, idx) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 100px 140px 72px', padding: '13px 20px', borderBottom: idx < posts.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              {p.excerpt && <div style={{ fontSize: 11, color: textDim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.excerpt}</div>}
            </div>
            <div><StatusBadge status={p.status} /></div>
            <div style={{ fontSize: 11.5, color: textMuted }}>{fmt(p.published_at)}</div>
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
          <div onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                {modal === 'create' ? 'New Post' : 'Edit Post'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelSt}>Title</label>
                <input style={inputSt} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title…" />
              </div>
              <div>
                <label style={labelSt}>Excerpt</label>
                <textarea style={{ ...inputSt, height: 72, resize: 'vertical' }} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short description…" />
              </div>
              <div>
                <label style={labelSt}>Content</label>
                <textarea style={{ ...inputSt, height: 180, resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Post content…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelSt}>Status</label>
                  <select style={inputSt} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Published At</label>
                  <input type="date" style={inputSt} value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
                </div>
              </div>
              {formError && <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Post' : 'Save Changes'}
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
