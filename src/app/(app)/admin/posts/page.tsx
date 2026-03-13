'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminPost } from '@/store/admin'
import { ContentLocaleTabs } from '@/components/ui/content-locale-tabs'
import { ConfirmDialog } from '@/components/ConfirmDialog'

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
  const t = useTranslations('admin')
  const { can, roleLoaded } = useRoleStore()
  const { posts, loading, error, fetchPosts, createPost, updatePost, deletePost, clearError, contentLocale } = useAdminStore()

  const [modal, setModal] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<AdminPost | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLocale, setFormLocale] = useState('en')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchPosts()
  }, [roleLoaded, contentLocale])

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
    setFormLocale('en')
    setFormError(null)
    setModal('create')
  }

  function openEdit(p: AdminPost) {
    setFormLocale(contentLocale)
    if (contentLocale !== 'en' && p.translations?.[contentLocale]) {
      const tr = p.translations[contentLocale]
      setForm({ title: tr.title || '', excerpt: tr.excerpt || '', content: tr.content || '', status: p.status, published_at: p.published_at ? p.published_at.slice(0, 10) : '' })
    } else {
      setForm({ title: p.title, excerpt: p.excerpt, content: p.content, status: p.status, published_at: p.published_at ? p.published_at.slice(0, 10) : '' })
    }
    setEditTarget(p)
    setFormError(null)
    setModal('edit')
  }

  function handleFormLocaleChange(locale: string) {
    if (!editTarget) { setFormLocale(locale); return }
    setFormLocale(locale)
    if (locale !== 'en' && editTarget.translations?.[locale]) {
      const tr = editTarget.translations[locale]
      setForm(f => ({ ...f, title: tr.title || '', excerpt: tr.excerpt || '', content: tr.content || '' }))
    } else if (locale === 'en') {
      setForm(f => ({ ...f, title: editTarget.title, excerpt: editTarget.excerpt, content: editTarget.content }))
    } else {
      setForm(f => ({ ...f, title: '', excerpt: '', content: '' }))
    }
  }

  function closeModal() {
    setModal(null)
    setEditTarget(null)
    setFormError(null)
    setSaving(false)
  }

  async function handleSave() {
    if (formLocale === 'en' && !form.title.trim()) { setFormError(t('titleRequired')); return }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        ...form,
        published_at: form.published_at || null,
        locale: formLocale,
      }
      if (modal === 'edit' && editTarget) {
        await updatePost(editTarget.id, payload)
      } else {
        await createPost(payload)
      }
      await fetchPosts()
      closeModal()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(p: AdminPost) {
    setConfirmDialog({
      message: t('deletePostConfirm', { title: p.title }),
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await deletePost(p.id)
        } catch {
          // error shown via store
        }
      },
    })
  }

  function StatusBadge({ status }: { status: 'draft' | 'published' }) {
    const color = status === 'published' ? '#22c55e' : 'var(--color-fg-dim)'
    const bg = status === 'published' ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-active)'
    const border = status === 'published' ? 'rgba(34,197,94,0.25)' : 'var(--color-border)'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}`, fontWeight: 600 }}>
        {t(status)}
      </span>
    )
  }

  function fmt(d: string | null) {
    if (!d) return <span style={{ color: textDim, fontStyle: 'italic' }}>{t('draft')}</span>
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('backToAdmin')}
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('posts')}</h1>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
              {posts.length}
            </span>
          </div>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <i className="bx bx-plus" /> {t('newPost')}
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
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2.5fr 100px 140px 72px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>{t('titleColumn')}</div>
          <div>{t('statusColumn')}</div>
          <div className="hide-mobile">{t('publishedColumn')}</div>
          <div style={{ textAlign: 'end' }}>{t('actionsColumn')}</div>
        </div>

        {loading && posts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            {t('loadingPosts')}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-news" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>{t('noPostsYet')}</div>
            <div style={{ fontSize: 12, color: textDim }}>{t('noPostsDesc')}</div>
          </div>
        ) : posts.map((p, idx) => (
          <div key={p.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2.5fr 100px 140px 72px', padding: '13px 20px', borderBottom: idx < posts.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              {p.excerpt && <div style={{ fontSize: 11, color: textDim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.excerpt}</div>}
            </div>
            <div><StatusBadge status={p.status} /></div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textMuted }}>{fmt(p.published_at)}</div>
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

      <ConfirmDialog
        open={!!confirmDialog}
        title={t('deletePost')}
        message={confirmDialog?.message ?? ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* Modal */}
      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: overlayBg, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid var(--color-border)`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                {modal === 'create' ? t('newPost') : t('editPost')}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>

            {modal === 'edit' && <ContentLocaleTabs activeLocale={formLocale} onChange={handleFormLocaleChange} />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelSt}>{t('titleLabel')}{formLocale !== 'en' && <span style={{ fontWeight: 400, color: textDim }}> ({formLocale.toUpperCase()})</span>}</label>
                <input style={inputSt} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={formLocale !== 'en' && editTarget ? editTarget.title : t('postTitlePlaceholder')} />
              </div>
              <div>
                <label style={labelSt}>{t('excerptLabel')}{formLocale !== 'en' && <span style={{ fontWeight: 400, color: textDim }}> ({formLocale.toUpperCase()})</span>}</label>
                <textarea style={{ ...inputSt, height: 72, resize: 'vertical' }} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder={formLocale !== 'en' && editTarget ? editTarget.excerpt : t('excerptPlaceholder')} />
              </div>
              <div>
                <label style={labelSt}>{t('contentLabel')}{formLocale !== 'en' && <span style={{ fontWeight: 400, color: textDim }}> ({formLocale.toUpperCase()})</span>}</label>
                <textarea style={{ ...inputSt, height: 180, resize: 'vertical' }} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder={formLocale !== 'en' && editTarget ? editTarget.content?.slice(0, 100) : t('postContentPlaceholder')} />
              </div>
              <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelSt}>{t('statusLabel')}</label>
                  <select style={inputSt} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))}>
                    <option value="draft">{t('draft')}</option>
                    <option value="published">{t('published')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelSt}>{t('publishedAtLabel')}</label>
                  <input type="date" style={inputSt} value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
                </div>
              </div>
              {formError && <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? t('saving') : modal === 'create' ? t('createPost') : t('saveChanges')}
                </button>
                <button onClick={closeModal} style={{ padding: '9px 16px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
