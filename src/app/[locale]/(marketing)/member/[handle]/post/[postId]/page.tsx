'use client'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'

interface PageProps {
  params: Promise<{ handle: string; postId: string }>
}

export default function PostDetailPage(props: PageProps) {
  const params = use(props.params)
  const { handle, postId } = params
  const postIdNum = Number(postId)

  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { isEnabled } = useFeatureFlagsStore()
  const { user } = useAuthStore()
  const {
    currentPost, comments, relatedPosts, loading,
    fetchPost, fetchComments, fetchRelatedPosts, addComment, likePost, clearProfile,
  } = useCommunityStore()

  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPost(postIdNum)
    fetchComments(postIdNum)
    fetchRelatedPosts(postIdNum)
    return () => clearProfile()
  }, [postIdNum, fetchPost, fetchComments, fetchRelatedPosts, clearProfile])

  // Theme tokens
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const textBody = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const backColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  function getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return formatDate(iso)
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await addComment(postIdNum, commentText)
      setCommentText('')
      fetchComments(postIdNum)
    } catch { /* store handles error */ }
    setSubmitting(false)
  }

  if (!isEnabled('community')) return null

  // Loading
  if (loading && !currentPost) {
    return (
      <div className="mkt-page" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 32px', textAlign: 'center', color: textMuted, fontSize: 15 }}>
        Loading post...
      </div>
    )
  }

  // Post not found
  if (!loading && !currentPost) {
    return (
      <div className="mkt-page" style={{ maxWidth: 640, margin: '0 auto', padding: '120px 32px', textAlign: 'center' }}>
        <i className="bx bx-error-circle" style={{ fontSize: 56, color: textMuted, display: 'block', marginBottom: 20 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, marginBottom: 10 }}>Post not found</h1>
        <p style={{ fontSize: 15, color: textMuted, marginBottom: 28 }}>This post may have been removed or the link is invalid.</p>
        <Link href={`/@${handle}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
          textDecoration: 'none',
        }}>
          <i className="bx bx-left-arrow-alt" /> Back to @{handle}
        </Link>
      </div>
    )
  }

  if (!currentPost) return null

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px 72px' }}>
      <style>{`
        @media (max-width: 800px) {
          .post-detail-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="post-detail-layout" style={{
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start',
      }}>
        {/* Main content */}
        <div>
          {/* Back link */}
          <Link href={`/@${handle}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, color: backColor, textDecoration: 'none', marginBottom: 32,
          }}>
            <i className="bx bx-left-arrow-alt" /> Back to @{handle}&apos;s profile
          </Link>

          {/* Post title */}
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800,
            letterSpacing: '-0.03em', color: textPrimary, lineHeight: 1.2, marginBottom: 20,
          }}>
            {currentPost.title}
          </h1>

          {/* Author mini-card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${borderColor}`,
          }}>
            {currentPost.author_avatar ? (
              <img
                src={currentPost.author_avatar}
                alt={currentPost.author_name}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 700,
              }}>
                {getInitials(currentPost.author_name)}
              </div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>
                {currentPost.author_name}
              </div>
              <div style={{ fontSize: 12, color: textMuted }}>
                @{currentPost.author_handle} &middot; {formatDate(currentPost.created_at)}
              </div>
            </div>
          </div>

          {/* Post content */}
          <div style={{ marginBottom: 32 }}>
            {currentPost.content.split('\n').map((para, i) => (
              <p key={i} style={{ fontSize: 16, color: textBody, lineHeight: 1.8, marginBottom: 16 }}>
                {para}
              </p>
            ))}
          </div>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {currentPost.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                  background: isDark ? 'rgba(0,229,255,0.08)' : 'rgba(169,0,255,0.06)',
                  color: '#00e5ff',
                  border: `1px solid ${isDark ? 'rgba(0,229,255,0.15)' : 'rgba(169,0,255,0.12)'}`,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20,
            paddingTop: 20, paddingBottom: 20, borderTop: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`, marginBottom: 40,
          }}>
            <button
              onClick={() => { if (user) likePost(currentPost.id) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', padding: '6px 12px', borderRadius: 8,
                color: currentPost.liked_by_me ? '#ff4d6a' : textMuted,
                fontSize: 14, fontWeight: 500,
                cursor: user ? 'pointer' : 'default', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              <i className={currentPost.liked_by_me ? 'bx bxs-heart' : 'bx bx-heart'} style={{ fontSize: 20 }} />
              {currentPost.likes_count} {currentPost.likes_count === 1 ? 'Like' : 'Likes'}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: textMuted, fontSize: 14 }}>
              <i className="bx bx-chat" style={{ fontSize: 20 }} />
              {currentPost.comments_count} {currentPost.comments_count === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>

          {/* Comments section */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 24 }}>
              Comments ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 20px', borderRadius: 14,
                background: cardBg, border: `1px solid ${cardBorder}`, marginBottom: 24,
              }}>
                <i className="bx bx-message-rounded" style={{ fontSize: 32, color: textMuted, display: 'block', marginBottom: 8 }} />
                <p style={{ fontSize: 14, color: textMuted }}>No comments yet. Be the first to share your thoughts.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{
                    display: 'flex', gap: 12, padding: '16px',
                    borderRadius: 14, background: cardBg, border: `1px solid ${cardBorder}`,
                  }}>
                    {comment.user_avatar ? (
                      <img
                        src={comment.user_avatar}
                        alt={comment.user_name}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 13, fontWeight: 700,
                      }}>
                        {getInitials(comment.user_name)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{comment.user_name}</span>
                        <span style={{ fontSize: 12, color: textMuted }}>{relativeTime(comment.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 14, color: textBody, lineHeight: 1.6, margin: 0 }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            {user ? (
              <div style={{
                padding: '20px', borderRadius: 14,
                background: cardBg, border: `1px solid ${cardBorder}`,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: textPrimary, marginBottom: 12 }}>
                  Leave a comment
                </h3>
                <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    placeholder="Write your comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    required
                    rows={3}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10,
                      border: `1px solid ${inputBorder}`, background: inputBg,
                      color: textPrimary, fontSize: 14, outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '10px 22px', borderRadius: 10, border: 'none',
                        fontSize: 14, fontWeight: 600, color: '#fff',
                        background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '24px', borderRadius: 14,
                background: cardBg, border: `1px solid ${cardBorder}`,
              }}>
                <p style={{ fontSize: 14, color: textMuted, marginBottom: 12 }}>
                  Sign in to leave a comment
                </p>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
                  textDecoration: 'none',
                }}>
                  <i className="bx bx-log-in" /> Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Related posts */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>
            Related Posts
          </h3>
          {relatedPosts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '24px', borderRadius: 14,
              background: cardBg, border: `1px solid ${cardBorder}`,
            }}>
              <p style={{ fontSize: 13, color: textMuted }}>No related posts found.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {relatedPosts.slice(0, 5).map(rp => (
                <Link
                  key={rp.id}
                  href={`/@${rp.author_handle}/post/${rp.id}`}
                  style={{
                    display: 'block', padding: '16px', borderRadius: 14,
                    background: cardBg, border: `1px solid ${cardBorder}`,
                    textDecoration: 'none', color: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = cardBorder }}
                >
                  <h4 style={{
                    fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {rp.title}
                  </h4>
                  <p style={{
                    fontSize: 12, color: textMuted, lineHeight: 1.5, marginBottom: 8,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {rp.content}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: textMuted }}>
                    {rp.author_avatar ? (
                      <img src={rp.author_avatar} alt={rp.author_name} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 8, fontWeight: 700,
                      }}>
                        {getInitials(rp.author_name)}
                      </div>
                    )}
                    <span>{rp.author_name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
