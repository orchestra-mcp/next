'use client'

import { useState, useEffect } from 'react'
import { apiFetch, uploadUrl } from '@/lib/api'
import { relativeTime } from '@/lib/mcp-parsers'

interface Comment {
  id: number
  body: string
  kind: string
  author_name: string
  avatar_url: string
  user_id: number
  created_at: string
}

interface InlineCommentsProps {
  contentId: number
}

export function InlineComments({ contentId }: InlineCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<'comment' | 'change_request'>('comment')
  const [submitting, setSubmitting] = useState(false)

  function fetchComments() {
    setLoading(true)
    apiFetch<{ comments: Comment[]; count: number }>(
      `/api/community/shares/${contentId}/inline-comments`
    )
      .then((res) => {
        setComments(res.comments)
        setCount(res.count)
      })
      .catch(() => {
        setComments([])
        setCount(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchComments()
  }, [contentId])

  async function handleSubmit() {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    try {
      await apiFetch(`/api/community/shares/${contentId}/inline-comments`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim(), kind }),
      })
      setBody('')
      setKind('comment')
      fetchComments()
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  const containerSt: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }

  const headerSt: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-fg)',
  }

  const emptySt: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    fontSize: 13,
    color: 'var(--color-fg-dim)',
  }

  const formSt: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }

  const textareaSt: React.CSSProperties = {
    width: '100%',
    minHeight: 60,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-alt)',
    color: 'var(--color-fg)',
    padding: '8px 10px',
    fontSize: 13,
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const formRowSt: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const selectSt: React.CSSProperties = {
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-alt)',
    color: 'var(--color-fg)',
    padding: '6px 8px',
    fontSize: 12,
    outline: 'none',
    fontFamily: 'inherit',
  }

  const submitBtnSt: React.CSSProperties = {
    background: '#00e5ff',
    color: '#000',
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    cursor: submitting || !body.trim() ? 'not-allowed' : 'pointer',
    opacity: submitting || !body.trim() ? 0.5 : 1,
    marginLeft: 'auto',
  }

  return (
    <div style={containerSt}>
      {/* Header */}
      <div style={headerSt}>
        <i className="bx bx-chat" style={{ fontSize: 16 }} />
        <span>Comments ({loading ? '...' : count})</span>
      </div>

      {/* Comment list */}
      {loading ? (
        <div style={emptySt}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={emptySt}>No comments yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* New comment form */}
      <div style={formSt}>
        <textarea
          style={textareaSt}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
        />
        <div style={formRowSt}>
          <select
            style={selectSt}
            value={kind}
            onChange={(e) => setKind(e.target.value as 'comment' | 'change_request')}
          >
            <option value="comment">Comment</option>
            <option value="change_request">Change Request</option>
          </select>
          <button
            style={submitBtnSt}
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
          >
            {submitting ? 'Posting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CommentRow({ comment }: { comment: Comment }) {
  const isChangeRequest = comment.kind === 'change_request'

  const rowSt: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    borderLeft: isChangeRequest ? '3px solid #f59e0b' : 'none',
    paddingLeft: isChangeRequest ? 10 : 0,
  }

  const avatarSt: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    background: 'var(--color-bg-alt)',
  }

  const contentSt: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    overflow: 'hidden',
  }

  const authorSt: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-fg)',
  }

  const bodySt: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--color-fg)',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }

  const timeSt: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--color-fg-dim)',
  }

  return (
    <div style={rowSt}>
      <img
        src={uploadUrl(comment.avatar_url)}
        alt={comment.author_name}
        style={avatarSt}
      />
      <div style={contentSt}>
        <span style={authorSt}>{comment.author_name}</span>
        <span style={bodySt}>{comment.body}</span>
        <span style={timeSt}>{relativeTime(comment.created_at)}</span>
      </div>
    </div>
  )
}
