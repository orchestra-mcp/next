'use client'
import { useState, useMemo } from 'react'

interface Comment {
  id: number
  author_handle: string
  author_name: string
  author_avatar: string
  content: string
  created_at: string
  parent_id?: number | null
}

interface Props {
  comments: Comment[]
  onReply: (content: string, parentId?: number) => Promise<void>
}

export function ThreadedComments({ comments, onReply }: Props) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const tree = useMemo(() => {
    const topLevel = comments.filter(c => !c.parent_id)
    const replies = comments.filter(c => c.parent_id)
    const replyMap = new Map<number, Comment[]>()
    for (const r of replies) {
      const pid = r.parent_id!
      if (!replyMap.has(pid)) replyMap.set(pid, [])
      replyMap.get(pid)!.push(r)
    }
    return { topLevel, replyMap }
  }, [comments])

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim()) return
    setSubmitting(true)
    try {
      await onReply(replyContent.trim(), parentId)
      setReplyContent('')
      setReplyingTo(null)
    } finally {
      setSubmitting(false)
    }
  }

  const renderComment = (comment: Comment, depth: number) => (
    <div key={comment.id} style={{ marginLeft: depth * 24, marginBottom: 8 }}>
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: depth > 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
        borderLeft: depth > 0 ? '2px solid var(--color-border, rgba(255,255,255,0.07))' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {comment.author_avatar ? (
            <img src={comment.author_avatar.startsWith('http') ? comment.author_avatar : `/uploads/${comment.author_avatar}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
              {(comment.author_name || '?')[0].toUpperCase()}
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg, #f8f8f8)' }}>
            {comment.author_name || comment.author_handle}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.25))' }}>
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.6))', margin: '4px 0 0 32px' }}>
          {comment.content}
        </p>
        {depth < 2 && (
          <button
            type="button"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            style={{
              marginLeft: 32, marginTop: 4, fontSize: 11, color: '#00e5ff',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            Reply
          </button>
        )}
      </div>

      {replyingTo === comment.id && (
        <div style={{ marginLeft: 32, marginTop: 6, display: 'flex', gap: 8 }}>
          <input
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            style={{
              flex: 1, padding: '6px 12px', borderRadius: 8, fontSize: 13,
              background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
              border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              color: 'var(--color-fg, #f8f8f8)', outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(comment.id) } }}
          />
          <button
            onClick={() => handleReply(comment.id)}
            disabled={submitting || !replyContent.trim()}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#00e5ff', color: '#000', border: 'none', cursor: 'pointer',
            }}
          >
            {submitting ? '...' : 'Send'}
          </button>
        </div>
      )}

      {tree.replyMap.get(comment.id)?.map(reply => renderComment(reply, depth + 1))}
    </div>
  )

  return (
    <div>
      {tree.topLevel.map(c => renderComment(c, 0))}
    </div>
  )
}
