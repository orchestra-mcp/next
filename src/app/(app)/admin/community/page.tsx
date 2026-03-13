'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminCommunityPost } from '@/store/admin'
import { ConfirmDialog } from '@/components/ConfirmDialog'

type StatusFilter = 'all' | 'published' | 'draft'

export default function AdminCommunityPage() {
  const router = useRouter()
  const t = useTranslations('admin')
  const { can, roleLoaded } = useRoleStore()
  const { communityPosts, loading, error, fetchCommunityPosts, updateCommunityPost, deleteCommunityPost, clearError } = useAdminStore()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchCommunityPosts()
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
  const pillActiveBg = 'var(--color-border)'
  const pillInactiveBg = 'var(--color-bg-alt)'

  const filtered = communityPosts.filter(p => {
    return statusFilter === 'all' || p.status === statusFilter
  })

  const statusPills: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ]

  function StatusBadge({ status }: { status: 'published' | 'draft' }) {
    const color = status === 'published' ? '#22c55e' : 'var(--color-fg-dim)'
    const bg = status === 'published' ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-active)'
    const border = status === 'published' ? 'rgba(34,197,94,0.25)' : 'var(--color-border)'
    return (
      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: bg, color, border: `1px solid ${border}`, fontWeight: 600 }}>
        {status === 'published' ? 'Published' : 'Draft'}
      </span>
    )
  }

  async function handleToggleStatus(post: AdminCommunityPost) {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      await updateCommunityPost(post.id, { status: newStatus })
    } catch {
      // error shown via store
    }
  }

  function handleDelete(post: AdminCommunityPost) {
    setConfirmDialog({
      message: `Are you sure you want to delete "${post.title}"?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await deleteCommunityPost(post.id)
        } catch {
          // error shown via store
        }
      },
    })
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bx bx-group" style={{ fontSize: 22, color: textPrimary }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Community Posts</h1>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
            {communityPosts.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginInlineEnd: 3 }}>Status:</span>
          {statusPills.map(p => (
            <button key={p.value} onClick={() => setStatusFilter(p.value)} style={{ padding: '5px 11px', borderRadius: 100, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: statusFilter === p.value ? pillActiveBg : pillInactiveBg, color: statusFilter === p.value ? textPrimary : textMuted, transition: 'background 0.15s' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>&#x2715;</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 80px 80px 100px 100px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>#</div>
          <div>Title</div>
          <div>Author</div>
          <div>Likes</div>
          <div>Comments</div>
          <div>Status</div>
          <div style={{ textAlign: 'end' }}>Actions</div>
        </div>

        {loading && communityPosts.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading community posts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-message-square-dots" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No community posts yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Community posts will appear here once users start sharing.</div>
          </div>
        ) : filtered.map((post, idx) => (
          <div key={post.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 80px 80px 100px 100px', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, fontFamily: 'monospace' }}>#{post.id}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingInlineEnd: 12 }}>{post.title}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.author_name}</div>
              <div style={{ fontSize: 11, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{post.author_handle}</div>
            </div>
            <div style={{ fontSize: 12, color: textMuted, fontWeight: 500 }}>{post.likes_count}</div>
            <div style={{ fontSize: 12, color: textMuted, fontWeight: 500 }}>{post.comments_count}</div>
            <div><StatusBadge status={post.status} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <button
                onClick={() => handleToggleStatus(post)}
                title={post.status === 'published' ? 'Make Draft' : 'Make Published'}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className={post.status === 'published' ? 'bx bx-hide' : 'bx bx-show'} style={{ fontSize: 14 }} />
              </button>
              <button
                onClick={() => handleDelete(post)}
                title="Delete"
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title="Delete Post"
        message={confirmDialog?.message ?? ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
