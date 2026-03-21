'use client'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileCard from '@/components/profile/profile-card'
import PostEmbed from '@/components/profile/post-embed'
import { MarkdownRenderer } from '@orchestra-mcp/editor'

const POST_TYPE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  skill: { color: '#00e5ff', bg: 'rgba(0,229,255,0.1)', label: 'Skill' },
  agent: { color: '#a900ff', bg: 'rgba(169,0,255,0.1)', label: 'Agent' },
  workflow: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Workflow' },
}

function getPostType(tags: string[]): string | null {
  if (tags.includes('workflow')) return 'workflow'
  if (tags.includes('agent')) return 'agent'
  if (tags.includes('skill')) return 'skill'
  return null
}


interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function PostDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  // Extract numeric ID from slug (e.g., "27-lead-quality-planner" → 27)
  const postIdNum = parseInt(slug, 10)

  const { colors } = useProfileTheme()
  const { isEnabled } = useFeatureFlagsStore()
  const { user } = useAuthStore()
  const {
    currentPost, comments, relatedPosts, loading,
    fetchPost, fetchComments, fetchRelatedPosts, addComment, likePost,
  } = useCommunityStore()

  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    fetchPost(postIdNum)
    fetchComments(postIdNum)
    fetchRelatedPosts(postIdNum)
  }, [postIdNum, fetchPost, fetchComments, fetchRelatedPosts])

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await addComment(postIdNum, commentText)
      setCommentText('')
      fetchComments(postIdNum)
    } catch {}
    setSubmitting(false)
  }

  async function handleReply(parentCommentId: number) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await addComment(postIdNum, replyText, parentCommentId)
      setReplyText('')
      setReplyingTo(null)
      fetchComments(postIdNum)
    } catch {}
    setSubmitting(false)
  }

  if (!isEnabled('community')) return null

  if (loading && !currentPost) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-fg-muted)', fontSize: 14 }}>Loading post...</div>
  }

  if (!loading && !currentPost) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <i className="bx bx-error-circle" style={{ fontSize: 48, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 8 }}>Post not found</h2>
        <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 20 }}>This post may have been removed.</p>
        <Link href={`/@${handle}`} style={{ color: '#00e5ff', textDecoration: 'none', fontSize: 13 }}>Back to profile</Link>
      </div>
    )
  }

  if (!currentPost) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Post card */}
      <ProfileCard variant="default" style={{
        padding: '16px',
        overflow: 'hidden',
        ...((() => {
          const type = getPostType(currentPost.tags || [])
          return type && POST_TYPE_STYLES[type] ? { border: `1.5px solid ${POST_TYPE_STYLES[type].color}40` } : {}
        })()),
      }}>
        {/* Type badge + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '0 0 12px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-fg)', margin: 0, letterSpacing: '-0.02em', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
            {currentPost.title}
          </h1>
          {(() => {
            const type = getPostType(currentPost.tags || [])
            if (!type || !POST_TYPE_STYLES[type]) return null
            const s = POST_TYPE_STYLES[type]
            return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: s.bg, color: s.color, fontWeight: 600, flexShrink: 0 }}>{s.label}</span>
          })()}
        </div>

        {/* Author + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
          {currentPost.author_avatar ? (
            <img src={currentPost.author_avatar} alt={currentPost.author_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {(currentPost.author_name || '').split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div>
            <Link href={`/@${currentPost.author_handle}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', textDecoration: 'none' }}>{currentPost.author_name}</Link>
            <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
              <Link href={`/@${currentPost.author_handle}`} style={{ color: 'var(--color-fg-dim)', textDecoration: 'none' }}>@{currentPost.author_handle}</Link> · {new Date(currentPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 16, overflow: 'hidden', maxWidth: '100%' }}>
          <MarkdownRenderer content={currentPost.content} />
        </div>

        {/* Media embeds — only from explicit media field, not content URLs */}
        {(() => {
          const mediaUrls: string[] = currentPost.media ? (() => { try { return JSON.parse(currentPost.media) } catch { return [] } })() : []
          if (mediaUrls.length === 0) return null
          return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, overflow: 'hidden' }}>
              {mediaUrls.map((url: string, i: number) => (
                <PostEmbed key={i} url={url} />
              ))}
            </div>
          )
        })()}

        {/* Tags */}
        {currentPost.tags && currentPost.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {currentPost.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.15)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => { if (user) likePost(currentPost.id) }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, fontSize: 13, color: currentPost.liked_by_me ? '#ff4d6a' : 'var(--color-fg-muted)', cursor: user ? 'pointer' : 'default' }}
          >
            <i className={`bx ${currentPost.liked_by_me ? 'bxs-heart' : 'bx-heart'}`} style={{ fontSize: 18 }} />
            {currentPost.likes_count} {currentPost.likes_count === 1 ? 'Like' : 'Likes'}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--color-fg-muted)' }}>
            <i className="bx bx-chat" style={{ fontSize: 18 }} />
            {currentPost.comments_count} Comments
          </span>
        </div>
      </ProfileCard>

      {/* Comments */}
      <ProfileCard variant="default" style={{ padding: '16px', overflow: 'hidden' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', margin: '0 0 16px' }}>
          Comments ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <i className="bx bx-message-rounded" style={{ fontSize: 28, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 6 }} />
            <p style={{ fontSize: 13, color: 'var(--color-fg-dim)', margin: 0 }}>No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {comments.map((c: any) => (
              <div key={c.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {c.user_avatar ? (
                    <img src={c.user_avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-active)', color: 'var(--color-fg-dim)', fontSize: 11, fontWeight: 700 }}>
                      {(c.user_name || '').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>{c.user_name}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', margin: 0, lineHeight: 1.5 }}>{c.content}</p>
                    {user && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: 'var(--color-fg-dim)', cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}
                      >
                        <i className="bx bx-reply" style={{ fontSize: 14 }} /> Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {c.replies && c.replies.length > 0 && (
                  <div style={{ marginLeft: 32, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.replies.map((r: any) => (
                      <div key={r.id} style={{ display: 'flex', gap: 8 }}>
                        {r.user_avatar ? (
                          <img src={r.user_avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-active)', color: 'var(--color-fg-dim)', fontSize: 9, fontWeight: 700 }}>
                            {(r.user_name || '').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg)' }}>{r.user_name}</span>
                          <span style={{ fontSize: 10, color: 'var(--color-fg-dim)', marginLeft: 6 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                          <p style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === c.id && (
                  <div style={{ marginLeft: 32, marginTop: 8, display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReply(c.id) } }}
                      placeholder={`Reply to ${c.user_name}...`}
                      autoFocus
                      style={{
                        flex: 1, padding: '6px 12px', borderRadius: 20, fontSize: 12,
                        border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)',
                        color: 'var(--color-fg)', outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleReply(c.id)}
                      disabled={submitting || !replyText.trim()}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: '#00e5ff', color: '#000', border: 'none', cursor: 'pointer',
                        opacity: submitting || !replyText.trim() ? 0.4 : 1,
                      }}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        {user && (
          <form onSubmit={handleAddComment}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 13,
                border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)',
                color: 'var(--color-fg)', resize: 'vertical', minHeight: 60, outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" disabled={submitting || !commentText.trim()} style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
                border: 'none', cursor: 'pointer', opacity: submitting || !commentText.trim() ? 0.5 : 1,
              }}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}
      </ProfileCard>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <ProfileCard variant="default" style={{ padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 12 }}>Related Posts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {relatedPosts.slice(0, 5).map((rp: any) => (
              <Link key={rp.id} href={`/@${handle}/post/${rp.id}`} style={{
                display: 'block', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)',
                textDecoration: 'none', transition: 'background 0.15s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 2 }}>{rp.title}</div>
                {rp.content && <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rp.content.slice(0, 80)}</div>}
              </Link>
            ))}
          </div>
        </ProfileCard>
      )}
    </div>
  )
}
