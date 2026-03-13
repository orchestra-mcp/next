'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import { posts } from './posts'

const tagColors: Record<string, { bg: string; border: string; text: string }> = {
  Announcement: { bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.2)',   text: '#00e5ff' },
  Engineering:  { bg: 'rgba(169,0,255,0.08)',   border: 'rgba(169,0,255,0.2)',   text: '#c040ff' },
  Tutorial:     { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  Product:      { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  text: '#fbbf24' },
}

interface Comment {
  id: number
  user_name: string
  avatar_url?: string
  body: string
  created_at: string
}

interface BlogPostClientProps {
  slug: string
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const t = useTranslations()
  const post = posts[slug]
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textBody = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)'
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const backColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  if (!post) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>{t('blog.postNotFound')}</h1>
        <Link href="/blog" style={{ color: '#00e5ff', textDecoration: 'none' }}>{t('blog.backToBlog')}</Link>
      </div>
    )
  }

  return (
    <div className="mkt-page" style={{ maxWidth: 720, margin: '0 auto', padding: '72px 32px' }}>
      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: backColor, textDecoration: 'none', marginBottom: 40 }}>
        <i className="bx bx-left-arrow-alt rtl-flip" /> {t('blog.backToBlog')}
      </Link>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
          {post.tag}
        </span>
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, lineHeight: 1.15, marginBottom: 20 }}>{post.title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>O</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{post.author}</div>
          <div style={{ fontSize: 12, color: textMuted }}>{post.date} &middot; {post.readTime}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {post.content.map((para, i) => (
          <p key={i} style={{ fontSize: 16, color: textBody, lineHeight: 1.8, margin: 0 }}>{para}</p>
        ))}
      </div>
      {/* Share + CTA */}
      <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/blog" style={{ fontSize: 14, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('blog.allPosts')}
        </Link>
        <Link href="/register" style={{ padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none' }}>
          {t('common.getStartedFree')}
        </Link>
      </div>

      {/* Related posts */}
      <RelatedPosts currentSlug={slug} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} borderColor={borderColor} />

      {/* Comments */}
      <CommentsSection slug={slug} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} borderColor={borderColor} />
    </div>
  )
}

/* ─── Related posts ──────────────────────────────────────────── */

function RelatedPosts({ currentSlug, isDark, textPrimary, textMuted, borderColor }: {
  currentSlug: string; isDark: boolean; textPrimary: string; textMuted: string; borderColor: string
}) {
  const related = Object.entries(posts)
    .filter(([s]) => s !== currentSlug)
    .slice(0, 3)

  if (related.length === 0) return null
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'

  return (
    <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${borderColor}` }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 20 }}>Related posts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {related.map(([s, p]) => {
          const tc = tagColors[p.tag] ?? tagColors.Announcement
          return (
            <Link key={s} href={`/blog/${s}`} style={{
              padding: 20, borderRadius: 12, border: `1px solid ${borderColor}`, background: cardBg,
              textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, alignSelf: 'flex-start' }}>
                {p.tag}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary, lineHeight: 1.4 }}>{p.title}</span>
              <span style={{ fontSize: 12, color: textMuted }}>{p.date} &middot; {p.readTime}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Comments ───────────────────────────────────────────────── */

function CommentsSection({ slug, isDark, textPrimary, textMuted, borderColor }: {
  slug: string; isDark: boolean; textPrimary: string; textMuted: string; borderColor: string
}) {
  const { token, user } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Lazy-load comments on first render
  if (!loaded) {
    setLoaded(true)
    apiFetch<Comment[]>(`/api/blog/${slug}/comments`, { skipAuth: true }).then(setComments).catch(() => {})
  }

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    try {
      const c = await apiFetch<Comment>(`/api/blog/${slug}/comments`, { method: 'POST', body: JSON.stringify({ body }) })
      setComments(prev => [c, ...prev])
      setBody('')
    } catch {}
    setSubmitting(false)
  }

  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{ marginTop: 56, paddingTop: 40, borderTop: `1px solid ${borderColor}` }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 20 }}>
        Comments {comments.length > 0 && <span style={{ fontSize: 13, fontWeight: 500, color: textMuted }}>({comments.length})</span>}
      </h2>

      {/* Comment form */}
      {token && user ? (
        <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${inputBorder}`, background: inputBg,
                color: textPrimary, fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || submitting}
              style={{
                marginTop: 8, padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: body.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : inputBg,
                color: body.trim() ? '#fff' : textMuted,
                border: 'none', cursor: body.trim() ? 'pointer' : 'default',
              }}
            >
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 10, background: inputBg, border: `1px solid ${inputBorder}`, textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: textMuted }}>
            <Link href="/login" style={{ color: '#00e5ff', textDecoration: 'none' }}>Sign in</Link> to leave a comment
          </span>
        </div>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p style={{ fontSize: 13, color: textMuted }}>No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {c.user_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{c.user_name}</span>
                  <span style={{ fontSize: 11, color: textMuted }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)', lineHeight: 1.6, margin: 0 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
