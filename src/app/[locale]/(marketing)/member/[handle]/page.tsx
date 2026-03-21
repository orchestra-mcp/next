'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useCommunityStore } from '@/store/community'
import { useAuthStore } from '@/store/auth'
import { apiFetch, uploadUrl } from '@/lib/api'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileCard from '@/components/profile/profile-card'
import PostEmbed from '@/components/profile/post-embed'
import { MarkdownRenderer } from '@orchestra-mcp/editor'
import { ConfirmDialog } from '@/components/ConfirmDialog'

function postSlug(post: { id: number; title?: string; slug?: string }): string {
  if (post.slug) return post.slug
  const base = (post.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50)
  return base ? `${post.id}-${base}` : `${post.id}`
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function MemberProfilePage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { colors } = useProfileTheme()
  const { isEnabled } = useFeatureFlagsStore()
  const { user } = useAuthStore()
  const {
    profile, posts, loading, error, activity,
    fetchPosts, likePost, createPost, updatePost, deletePost, fetchActivity,
  } = useCommunityStore()

  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postIcon, setPostIcon] = useState('')
  const [postMedia, setPostMedia] = useState<string[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [mediaInput, setMediaInput] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editIconColor, setEditIconColor] = useState('')
  const [editIconPickerOpen, setEditIconPickerOpen] = useState(false)
  const [editPostType, setEditPostType] = useState<'post' | 'skill' | 'agent' | 'workflow'>('post')
  const editContentRef = useRef<HTMLTextAreaElement>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [allPosts, setAllPosts] = useState<typeof posts>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [inlineComments, setInlineComments] = useState<Record<number, any[]>>({})
  const [inlineCommentText, setInlineCommentText] = useState<Record<number, string>>({})
  const [commentSubmitting, setCommentSubmitting] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [postIconColor, setPostIconColor] = useState('')
  const [postType, setPostType] = useState<'post' | 'skill' | 'agent' | 'workflow'>('post')
  const [publishToMarketplace, setPublishToMarketplace] = useState(false)
  const [feedFilter, setFeedFilter] = useState<'all' | 'post' | 'skill' | 'agent' | 'workflow'>('all')
  const [feedView, setFeedView] = useState<'posts' | 'activity'>('posts')
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const isOwner = !!user && (
    user.username === handle ||
    (user.settings?.handle as string) === handle
  )

  // Initial fetch
  useEffect(() => {
    setPage(1)
    setAllPosts([])
    setHasMore(true)
    fetchPosts(handle, 1)
  }, [handle, fetchPosts])

  // Accumulate posts when store updates
  useEffect(() => {
    if (!posts.length) return
    if (page === 1) {
      setAllPosts(posts)
    } else {
      setAllPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const newPosts = posts.filter(p => !existingIds.has(p.id))
        return [...prev, ...newPosts]
      })
    }
    if (posts.length < 10) setHasMore(false)
    setLoadingMore(false)
  }, [posts, page])

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(handle, nextPage)
  }, [loadingMore, hasMore, loading, page, handle, fetchPosts])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  // Posts render immediately — no animation needed (sidebar handles its own animations)

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    if (!postTitle.trim() || !postContent.trim()) return
    setPublishing(true)
    setPublishError(null)
    setPublishSuccess(false)
    try {
      const tags: string[] = []
      if (postType !== 'post') tags.push(postType)
      if (publishToMarketplace && postType !== 'post') tags.push('marketplace')
      await createPost({
        title: postTitle, content: postContent,
        icon: postIcon || undefined, color: postIconColor || undefined,
        media: postMedia.length > 0 ? JSON.stringify(postMedia) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      })
    } catch (err) {
      setPublishError((err as Error).message || 'Failed to publish post')
      setPublishing(false)
      return
    }
    setPostTitle('')
    setPostContent('')
    setPostIcon('')
    setPostIconColor('')
    setPostMedia([])
    setPostType('post')
    setPublishToMarketplace(false)
    setComposerOpen(false)
    setPublishSuccess(true)
    setTimeout(() => setPublishSuccess(false), 3000)
    // Refresh first page to include new post
    setPage(1)
    setAllPosts([])
    try { await fetchPosts(handle, 1) } catch { /* refresh failed but post was saved */ }
    setPublishing(false)
  }

  function insertFormat(prefix: string, suffix: string) {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = postContent
    const selected = text.slice(start, end) || 'text'
    const newText = text.slice(0, start) + prefix + selected + suffix + text.slice(end)
    setPostContent(newText)
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = start + prefix.length + selected.length + suffix.length
      ta.setSelectionRange(cursor, cursor)
    })
  }

  function insertEditFormat(prefix: string, suffix: string) {
    const ta = editContentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = editContent.slice(start, end) || 'text'
    const newText = editContent.slice(0, start) + prefix + selected + suffix + editContent.slice(end)
    setEditContent(newText)
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = start + prefix.length + selected.length + suffix.length
      ta.setSelectionRange(cursor, cursor)
    })
  }

  function startEdit(post: typeof posts[0]) {
    setEditingId(post.id)
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditIcon(post.icon || '')
    setEditIconColor(post.color || '')
    setEditPostType((getPostTypeFromTags(post.tags || []) || 'post') as 'post' | 'skill' | 'agent' | 'workflow')
    setEditIconPickerOpen(false)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditIcon('')
    setEditIconColor('')
    setEditPostType('post')
    setEditIconPickerOpen(false)
    setEditError(null)
  }

  async function handleSaveEdit() {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return
    setEditSaving(true)
    setEditError(null)
    try {
      const editTags: string[] = []
      if (editPostType !== 'post') editTags.push(editPostType)
      await updatePost(editingId, { title: editTitle.trim(), content: editContent.trim(), icon: editIcon || undefined, color: editIconColor || undefined, tags: editTags })
      setAllPosts(prev => prev.map(p => p.id === editingId ? { ...p, title: editTitle.trim(), content: editContent.trim(), icon: editIcon, color: editIconColor, tags: editTags } : p))
      cancelEdit()
    } catch (err) {
      setEditError((err as Error).message || 'Failed to save edit')
    }
    setEditSaving(false)
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return
    setDeleteLoading(true)
    try {
      await deletePost(deleteConfirmId)
      setAllPosts(prev => prev.filter(p => p.id !== deleteConfirmId))
    } catch { /* error shown via store */ }
    setDeleteLoading(false)
    setDeleteConfirmId(null)
  }

  const POST_TYPE_STYLES: Record<string, { color: string; bg: string; label: string; icon: string; borderColor: string }> = {
    post:     { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)', label: 'Post',     icon: 'bx-edit',     borderColor: 'rgba(255,255,255,0.15)' },
    skill:    { color: '#00e5ff',               bg: 'rgba(0,229,255,0.1)',    label: 'Skill',    icon: 'bx-code-alt', borderColor: 'rgba(0,229,255,0.35)' },
    agent:    { color: '#a900ff',               bg: 'rgba(169,0,255,0.1)',    label: 'Agent',    icon: 'bx-bot',      borderColor: 'rgba(169,0,255,0.35)' },
    workflow: { color: '#22c55e',               bg: 'rgba(34,197,94,0.1)',    label: 'Workflow', icon: 'bx-git-merge',borderColor: 'rgba(34,197,94,0.35)' },
  }

  function getPostTypeFromTags(tags: string[]): string | null {
    if (tags.includes('workflow')) return 'workflow'
    if (tags.includes('agent')) return 'agent'
    if (tags.includes('skill')) return 'skill'
    return null
  }

  function getPostTypeBorderStyle(post: typeof posts[0]): React.CSSProperties {
    const type = getPostTypeFromTags(post.tags || [])
    if (!type || !POST_TYPE_STYLES[type]) return {}
    return { border: `1.5px solid ${POST_TYPE_STYLES[type].borderColor}` }
  }

  function getPostTypeBadge(post: typeof posts[0]) {
    const type = getPostTypeFromTags(post.tags || [])
    if (!type || !POST_TYPE_STYLES[type]) return null
    const s = POST_TYPE_STYLES[type]
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, padding: '1px 7px', borderRadius: 4, background: s.bg, color: s.color, fontWeight: 600, marginLeft: 8 }}>
        <i className={`bx ${s.icon}`} style={{ fontSize: 10 }} />
        {s.label}
      </span>
    )
  }

  async function toggleComments(postId: number) {
    const next = new Set(expandedComments)
    if (next.has(postId)) {
      next.delete(postId)
    } else {
      next.add(postId)
      if (!inlineComments[postId]) {
        try {
          const res = await apiFetch<{ comments: any[] }>(`/api/public/community/posts/${postId}/comments`, { skipAuth: true })
          setInlineComments(prev => ({ ...prev, [postId]: res.comments || [] }))
        } catch {}
      }
    }
    setExpandedComments(next)
  }

  async function submitInlineComment(postId: number) {
    const text = inlineCommentText[postId]?.trim()
    if (!text) return
    setCommentSubmitting(postId)
    try {
      await addComment(postId, text)
      setInlineCommentText(prev => ({ ...prev, [postId]: '' }))
      const res = await apiFetch<{ comments: any[] }>(`/api/public/community/posts/${postId}/comments`, { skipAuth: true })
      setInlineComments(prev => ({ ...prev, [postId]: res.comments || [] }))
    } catch {}
    setCommentSubmitting(null)
  }

  if (!isEnabled('community')) return null

  if (!loading && !profile && error) {
    const isPrivate = error.toLowerCase().includes('private')
    return (
      <div className="mx-auto max-w-[640px] px-8 pt-[120px] text-center">
        <i
          className={`bx ${isPrivate ? 'bx-lock-alt' : 'bx-user-x'} block mb-5 text-[56px]`}
          style={{ color: colors.textMuted }}
        />
        <h1
          className="text-[28px] font-bold mb-2.5 tracking-tight"
          style={{ color: colors.textPrimary }}
        >
          {isPrivate ? 'Profile is private' : 'Profile not found'}
        </h1>
        <p className="text-[15px] mb-7" style={{ color: colors.textMuted }}>
          {isPrivate
            ? `@${handle} has chosen to keep their profile private.`
            : `The member @${handle} does not exist.`
          }
        </p>
        <Link
          href="/community"
          className="btn-gradient inline-flex items-center gap-1.5 px-6 py-2.5 rounded-[10px] text-sm font-semibold text-white no-underline transition-all"
        >
          <i className="bx bx-left-arrow-alt" /> Back to Community
        </Link>
      </div>
    )
  }

  if (loading && !profile) {
    return (
      <div
        className="mx-auto max-w-[800px] px-8 pt-[120px] text-center text-[15px]"
        style={{ color: colors.textMuted }}
      >
        Loading profile...
      </div>
    )
  }

  if (!profile) return null

  const rawPosts = allPosts.length > 0 ? allPosts : posts
  const displayPosts = feedFilter === 'all'
    ? rawPosts
    : rawPosts.filter(p => {
        const tags = (p as any).tags as string[] | undefined
        if (!tags) return feedFilter === 'post'
        if (feedFilter === 'post') return !tags.some((t: string) => ['skill', 'agent', 'workflow'].includes(t))
        return tags.includes(feedFilter)
      })

  // Counts for filter tabs.
  const feedCounts = {
    all: rawPosts.length,
    post: rawPosts.filter(p => { const t = (p as any).tags as string[] | undefined; return !t || !t.some((x: string) => ['skill', 'agent', 'workflow'].includes(x)) }).length,
    skill: rawPosts.filter(p => ((p as any).tags as string[] | undefined)?.includes('skill')).length,
    agent: rawPosts.filter(p => ((p as any).tags as string[] | undefined)?.includes('agent')).length,
    workflow: rawPosts.filter(p => ((p as any).tags as string[] | undefined)?.includes('workflow')).length,
  }

  return (
    <div>
      {/* ── Composer Card (own profile only) ── */}
      {isOwner && (
        <ProfileCard style={{ marginBottom: 12 }}>
          {!composerOpen ? (
            /* ── Collapsed ── */
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left font-inherit"
            >
              {profile?.avatar_url ? (
                <img src={uploadUrl(profile.avatar_url)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: colors.accent, color: '#fff' }}>
                  {(profile?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0 px-4 py-2 rounded-full text-sm" style={{ background: 'var(--color-bg-active, rgba(255,255,255,0.06))', color: colors.textMuted }}>
                What&apos;s on your mind, {profile?.name?.split(' ')[0] || handle}?
              </div>
            </button>
          ) : (
            /* ── Expanded: FB-style ── */
            <form onSubmit={handlePublish} className="flex flex-col">
              {/* Header: avatar + name + close */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: `1px solid var(--color-border, rgba(255,255,255,0.07))` }}>
                {profile?.avatar_url ? (
                  <img src={uploadUrl(profile.avatar_url)} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: colors.accent, color: '#fff' }}>
                    {(profile?.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{profile?.name || handle}</div>
                  {/* Type selector — icon-only circles with tooltip */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
                    {(['post', 'skill', 'agent', 'workflow'] as const).map(type => {
                      const s = POST_TYPE_STYLES[type]
                      const active = postType === type
                      return (
                        <button key={type} type="button" onClick={() => setPostType(type)} title={s.label} style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? s.bg : 'transparent',
                          border: `1.5px solid ${active ? s.color : 'var(--color-border, rgba(255,255,255,0.12))'}`,
                          color: active ? s.color : 'var(--color-fg-muted, rgba(255,255,255,0.35))',
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}>
                          <i className={`bx ${s.icon}`} style={{ fontSize: 12 }} />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button type="button" onClick={() => { setComposerOpen(false); setShowIconPicker(false) }}
                  className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer shrink-0"
                  style={{ background: 'var(--color-bg-active, rgba(255,255,255,0.08))', color: colors.textMuted, fontSize: 18 }}>
                  <i className="bx bx-x" />
                </button>
              </div>

              {/* Title input */}
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button type="button" onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer shrink-0"
                      style={{ background: postIconColor ? `${postIconColor}15` : 'var(--color-bg-active, rgba(255,255,255,0.06))', borderColor: colors.cardBorder, color: postIconColor || colors.textMuted }}
                      title="Pick icon">
                      <i className={`bx ${postIcon || 'bx-notepad'}`} style={{ fontSize: 16 }} />
                    </button>
                    {showIconPicker && (
                      <div className="absolute top-full left-0 mt-1 p-3 rounded-xl border shadow-xl z-20" style={{ background: 'var(--color-bg)', borderColor: colors.cardBorder, width: 232 }}>
                        <div className="flex gap-1.5 mb-3 pb-2.5 flex-wrap" style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                          {['#a900ff','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4','#f97316','#14b8a6'].map(c => (
                            <button key={c} type="button" onClick={() => setPostIconColor(postIconColor === c ? '' : c)}
                              className="w-5 h-5 rounded-full border-2 cursor-pointer"
                              style={{ background: c, borderColor: postIconColor === c ? 'var(--color-fg,#fff)' : 'transparent' }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {['bx-notepad','bx-star','bx-bulb','bx-code-alt','bx-bug','bx-rocket','bx-heart','bx-book','bx-music','bx-camera','bx-trophy','bx-paint-roll','bx-world','bx-coffee','bx-flag','bx-zap','bx-bell','bx-shield','bx-wrench','bx-terminal','bx-chip'].map(icon => (
                            <button key={icon} type="button" onClick={() => { setPostIcon(icon === 'bx-notepad' ? '' : icon); setShowIconPicker(false) }}
                              className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer"
                              style={{ background: (postIcon||'bx-notepad')===icon ? 'var(--color-bg-active,rgba(255,255,255,0.1))' : 'transparent', color: postIconColor||colors.textPrimary }}>
                              <i className={`bx ${icon} text-base`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="text" placeholder="Title (optional)" value={postTitle} onChange={e => setPostTitle(e.target.value)} autoFocus
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border text-sm font-inherit outline-none"
                    style={{ background: 'transparent', borderColor: colors.inputBorder, color: colors.textPrimary }} />
                </div>
              </div>

              {/* Large textarea — FB style */}
              <div className="px-4 pt-2 pb-1">
                <textarea ref={contentRef} placeholder={`What's on your mind, ${profile?.name?.split(' ')[0] || handle}?`}
                  value={postContent} onChange={e => setPostContent(e.target.value)} rows={5} required
                  className="w-full border-none text-base font-inherit outline-none resize-none"
                  style={{ background: 'transparent', color: colors.textPrimary, minHeight: 100, lineHeight: 1.6 }} />
              </div>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-0.5 px-3 py-1 overflow-x-auto" style={{ borderTop: `1px solid var(--color-border, rgba(255,255,255,0.06))` }}>
                {[
                  { icon: 'bx-bold', title: 'Bold', pre: '**', suf: '**' },
                  { icon: 'bx-italic', title: 'Italic', pre: '_', suf: '_' },
                  { icon: 'bx-strikethrough', title: 'Strike', pre: '~~', suf: '~~' },
                  { icon: 'bx-heading', title: 'Heading', pre: '## ', suf: '' },
                  { icon: 'bx-link', title: 'Link', pre: '[', suf: '](url)' },
                  { icon: 'bx-code', title: 'Code', pre: '`', suf: '`' },
                  { icon: 'bx-list-ul', title: 'List', pre: '- ', suf: '' },
                  { icon: 'bx-code-block', title: 'Code block', pre: '```\n', suf: '\n```' },
                  { icon: 'bx-quote-left', title: 'Quote', pre: '> ', suf: '' },
                ].map(a => (
                  <button key={a.icon} type="button" title={a.title} onClick={() => insertFormat(a.pre, a.suf)}
                    className="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer shrink-0"
                    style={{ color: 'var(--color-fg-muted,rgba(255,255,255,0.45))', fontSize: 15 }}
                    onMouseEnter={e => { e.currentTarget.style.color='var(--color-fg-bright,rgba(255,255,255,0.85))'; e.currentTarget.style.background='var(--color-bg-active,rgba(255,255,255,0.06))' }}
                    onMouseLeave={e => { e.currentTarget.style.color='var(--color-fg-muted,rgba(255,255,255,0.45))'; e.currentTarget.style.background='transparent' }}>
                    <i className={`bx ${a.icon}`} />
                  </button>
                ))}
              </div>

              {publishError && (
                <div className="mx-4 mb-2 text-[13px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{publishError}</div>
              )}
              {publishSuccess && (
                <div className="mx-4 mb-2 text-[13px] px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Posted!</div>
              )}

              {/* Marketplace toggle */}
              {postType !== 'post' && (
                <div className="mx-4 mb-2 flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--color-bg-active)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg)' }}>Publish to Marketplace</div>
                    <div style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>Requires admin approval</div>
                  </div>
                  <button type="button" onClick={() => setPublishToMarketplace(!publishToMarketplace)} style={{
                    width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    background: publishToMarketplace ? '#00e5ff' : 'var(--color-border)',
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s', left: publishToMarketplace ? 18 : 2 }} />
                  </button>
                </div>
              )}

              {/* Publish button — full width like FB */}
              <div className="px-4 pb-4 pt-1">
                <button type="submit" disabled={publishing || !postContent.trim()}
                  className="w-full py-2.5 rounded-lg border-none text-sm font-semibold font-inherit transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: colors.accent, color: '#fff' }}>
                  {publishing ? 'Publishing...' : 'Post'}
                </button>
              </div>
            </form>
          )}
        </ProfileCard>
      )}

      {/* ── Feed header: view toggle + filter chips ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        {/* Left: Posts / Activity pill toggle */}
        <div style={{ display: 'flex', background: 'var(--color-bg-active, rgba(255,255,255,0.05))', borderRadius: 9, padding: 3, gap: 2 }}>
          {([
            { view: 'posts', icon: 'bx-grid-alt', label: 'Posts' },
            { view: 'activity', icon: 'bx-time-five', label: 'Activity' },
          ] as const).map(({ view, icon, label }) => (
            <button key={view} type="button" onClick={() => { setFeedView(view); if (view === 'activity' && activity.length === 0 && handle) fetchActivity(handle) }} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: 'none',
              background: feedView === view ? 'var(--color-bg, rgba(0,0,0,0.4))' : 'transparent',
              color: feedView === view ? 'var(--color-fg, rgba(255,255,255,0.9))' : 'var(--color-fg-muted, rgba(255,255,255,0.4))',
              boxShadow: feedView === view ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.15s',
            }}>
              <i className={`bx ${icon}`} style={{ fontSize: 13 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Right: filter — icon-only circles with tooltip */}
        {feedView === 'posts' && (
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'post', 'skill', 'agent', 'workflow'] as const).map(f => {
              const chipMeta: Record<string, { label: string; color: string; icon: string }> = {
                all:      { label: 'All',       color: 'rgba(255,255,255,0.7)', icon: 'bx-grid-alt' },
                post:     { label: 'Posts',     color: 'rgba(255,255,255,0.7)', icon: 'bx-edit' },
                skill:    { label: 'Skills',    color: '#00e5ff',               icon: 'bx-code-alt' },
                agent:    { label: 'Agents',    color: '#a900ff',               icon: 'bx-bot' },
                workflow: { label: 'Workflows', color: '#22c55e',               icon: 'bx-git-merge' },
              }
              const { label, color, icon } = chipMeta[f]
              const active = feedFilter === f
              return (
                <button key={f} type="button" onClick={() => setFeedFilter(f)} title={label} style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${color}18` : 'transparent',
                  border: `1.5px solid ${active ? color : 'var(--color-border, rgba(255,255,255,0.12))'}`,
                  color: active ? color : 'var(--color-fg-muted, rgba(255,255,255,0.35))',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <i className={`bx ${icon}`} style={{ fontSize: 13 }} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {feedView === 'posts' && (
      <>

      {/* ── Post Cards ── */}
      {displayPosts.length === 0 && !loading ? (
        <ProfileCard style={{ marginBottom: 12 }}>
          <div className="py-12 px-5 text-center">
            <i
              className="bx bx-edit block mb-2.5 text-4xl"
              style={{ color: colors.textMuted }}
            />
            <p className="text-sm m-0" style={{ color: colors.textMuted }}>
              No activity yet
            </p>
          </div>
        </ProfileCard>
      ) : (
        displayPosts.filter(Boolean).map((post) => (
          <ProfileCard key={post.id} className="profile-enter-post" style={{ marginBottom: 12, ...getPostTypeBorderStyle(post) }}>
            <div style={{ padding: '16px', overflow: 'hidden' }}>
              {editingId === post.id ? (
                /* ── Edit mode — matches create composer style ── */
                <div className="flex flex-col gap-2.5">
                  {/* Type selector — icon-only circles with tooltip */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['post', 'skill', 'agent', 'workflow'] as const).map(type => {
                      const s = POST_TYPE_STYLES[type]
                      const active = editPostType === type
                      return (
                        <button key={type} type="button" onClick={() => setEditPostType(type)} title={s.label} style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? s.bg : 'transparent',
                          border: `1.5px solid ${active ? s.color : 'var(--color-border, rgba(255,255,255,0.12))'}`,
                          color: active ? s.color : 'var(--color-fg-muted, rgba(255,255,255,0.35))',
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}>
                          <i className={`bx ${s.icon}`} style={{ fontSize: 12 }} />
                        </button>
                      )
                    })}
                  </div>

                  {/* Icon + title row */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button type="button" onClick={() => setEditIconPickerOpen(!editIconPickerOpen)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer shrink-0"
                        style={{ background: editIconColor ? `${editIconColor}15` : 'var(--color-bg-active,rgba(255,255,255,0.06))', borderColor: colors.cardBorder, color: editIconColor || colors.textMuted }}>
                        <i className={`bx ${editIcon || 'bx-notepad'}`} style={{ fontSize: 15 }} />
                      </button>
                      {editIconPickerOpen && (
                        <div className="absolute top-full left-0 mt-1 p-3 rounded-xl border shadow-xl z-20" style={{ background: 'var(--color-bg)', borderColor: colors.cardBorder, width: 232 }}>
                          <div className="flex gap-1.5 mb-3 pb-2.5 flex-wrap" style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                            {['#a900ff','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#8b5cf6','#06b6d4','#f97316','#14b8a6'].map(c => (
                              <button key={c} type="button" onClick={() => setEditIconColor(editIconColor === c ? '' : c)}
                                className="w-5 h-5 rounded-full border-2 cursor-pointer"
                                style={{ background: c, borderColor: editIconColor === c ? 'var(--color-fg,#fff)' : 'transparent' }} />
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {['bx-notepad','bx-star','bx-bulb','bx-code-alt','bx-bug','bx-rocket','bx-heart','bx-book','bx-music','bx-camera','bx-trophy','bx-paint-roll','bx-world','bx-coffee','bx-flag','bx-zap','bx-bell','bx-shield','bx-wrench','bx-terminal','bx-chip'].map(icon => (
                              <button key={icon} type="button" onClick={() => { setEditIcon(icon === 'bx-notepad' ? '' : icon); setEditIconPickerOpen(false) }}
                                className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer"
                                style={{ background: (editIcon||'bx-notepad')===icon ? 'var(--color-bg-active,rgba(255,255,255,0.1))' : 'transparent', color: editIconColor||colors.textPrimary }}>
                                <i className={`bx ${icon} text-base`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus placeholder="Title"
                      className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border text-sm font-inherit outline-none"
                      style={{ background: 'transparent', borderColor: colors.inputBorder, color: colors.textPrimary }} />
                  </div>

                  {/* Textarea */}
                  <textarea ref={editContentRef} value={editContent} onChange={e => setEditContent(e.target.value)}
                    rows={4} placeholder="Edit your post..."
                    className="w-full px-0 py-2 border-none text-sm font-inherit outline-none resize-none"
                    style={{ background: 'transparent', color: colors.textPrimary, minHeight: 90, lineHeight: 1.6 }} />

                  {/* Toolbar */}
                  <div className="flex items-center gap-0.5 overflow-x-auto py-1" style={{ borderTop: `1px solid var(--color-border,rgba(255,255,255,0.06))` }}>
                    {[
                      { icon: 'bx-bold', title: 'Bold', pre: '**', suf: '**' },
                      { icon: 'bx-italic', title: 'Italic', pre: '_', suf: '_' },
                      { icon: 'bx-strikethrough', title: 'Strike', pre: '~~', suf: '~~' },
                      { icon: 'bx-heading', title: 'Heading', pre: '## ', suf: '' },
                      { icon: 'bx-link', title: 'Link', pre: '[', suf: '](url)' },
                      { icon: 'bx-code', title: 'Code', pre: '`', suf: '`' },
                      { icon: 'bx-list-ul', title: 'List', pre: '- ', suf: '' },
                      { icon: 'bx-code-block', title: 'Code block', pre: '```\n', suf: '\n```' },
                      { icon: 'bx-quote-left', title: 'Quote', pre: '> ', suf: '' },
                    ].map(a => (
                      <button key={a.icon} type="button" title={a.title} onClick={() => insertEditFormat(a.pre, a.suf)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer shrink-0"
                        style={{ color: 'var(--color-fg-muted,rgba(255,255,255,0.45))', fontSize: 15 }}
                        onMouseEnter={e => { e.currentTarget.style.color='var(--color-fg-bright,rgba(255,255,255,0.85))'; e.currentTarget.style.background='var(--color-bg-active,rgba(255,255,255,0.06))' }}
                        onMouseLeave={e => { e.currentTarget.style.color='var(--color-fg-muted,rgba(255,255,255,0.45))'; e.currentTarget.style.background='transparent' }}>
                        <i className={`bx ${a.icon}`} />
                      </button>
                    ))}
                  </div>

                  {editError && (
                    <div className="text-[13px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{editError}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={cancelEdit} disabled={editSaving}
                      className="flex-1 py-2 rounded-lg border text-[13px] font-semibold font-inherit cursor-pointer disabled:opacity-40"
                      style={{ background: 'transparent', borderColor: colors.cardBorder, color: colors.textMuted }}>
                      Cancel
                    </button>
                    <button type="button" onClick={handleSaveEdit} disabled={editSaving || !editContent.trim()}
                      className="flex-1 py-2 rounded-lg border-none text-[13px] font-semibold text-white font-inherit cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: colors.accent }}>
                      {editSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      background: `${(post.color || colors.accent)}12`,
                    }}
                  >
                    <i
                      className={`bx ${post.icon || 'bx-notepad'} text-base`}
                      style={{ color: post.color || colors.accent }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {post.title ? (
                          <Link
                            href={`/@${handle}/post/${postSlug(post)}`}
                            className="no-underline text-inherit"
                          >
                            <h4
                              className="text-[15px] font-bold leading-snug m-0 mb-1 inline"
                              style={{ color: colors.textPrimary }}
                            >
                              {post.title}
                            </h4>
                            {getPostTypeBadge(post)}
                          </Link>
                        ) : (
                          getPostTypeBadge(post)
                        )}
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent cursor-pointer transition-colors hover:opacity-80"
                          style={{ color: colors.textMuted }}
                          title="Edit post"
                        >
                          <i className="bx bx-pencil text-sm" />
                        </button>
                      )}
                    </div>
                    <div
                      className="text-xs mb-2"
                      style={{ color: colors.textMuted }}
                    >
                      {relativeTime(post.created_at)}
                    </div>
                    {/* Content with truncation for long posts */}
                    <div style={{ overflow: 'hidden', maxWidth: '100%' }}>
                    {post.content.length > 500 ? (
                      <div>
                        <div style={{ maxHeight: 200, overflow: 'hidden', position: 'relative' }}>
                          <MarkdownRenderer content={post.content.slice(0, 500) + '...'} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--color-bg-alt, rgba(255,255,255,0.03)))' }} />
                        </div>
                        <Link
                          href={`/@${handle}/post/${postSlug(post)}`}
                          className="no-underline"
                          style={{ fontSize: 13, fontWeight: 600, color: '#00e5ff', display: 'inline-block', marginTop: 4 }}
                        >
                          Show more
                        </Link>
                      </div>
                    ) : (
                      <MarkdownRenderer content={post.content} />
                    )}
                    </div>

                    {/* Media embeds */}
                    {post.media && (() => {
                      try {
                        const items: string[] = JSON.parse(post.media)
                        if (!Array.isArray(items) || items.length === 0) return null
                        return (
                          <div className="flex flex-col gap-2 mt-2">
                            {items.map((url, mi) => (
                              <PostEmbed key={mi} url={url} />
                            ))}
                          </div>
                        )
                      } catch { return null }
                    })()}

                    {/* Actions row */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => { if (user) likePost(post.id) }}
                        className="flex items-center gap-1.5 bg-transparent border-none p-0 text-[13px] font-inherit transition-colors hover:opacity-80"
                        style={{
                          color: post.liked_by_me ? colors.danger : colors.textMuted,
                          cursor: user ? 'pointer' : 'default',
                        }}
                      >
                        <i className={`${post.liked_by_me ? 'bx bxs-heart' : 'bx bx-heart'} text-base`} />
                        Like
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 bg-transparent border-none p-0 text-[13px] font-inherit transition-colors hover:opacity-80"
                        style={{ color: expandedComments.has(post.id) ? colors.accent : colors.textMuted, cursor: 'pointer' }}
                      >
                        <i className="bx bx-comment text-base" />
                        {post.comments_count || 0}
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => setDeleteConfirmId(post.id)}
                          className="flex items-center gap-1.5 bg-transparent border-none p-0 text-[13px] font-inherit transition-colors hover:opacity-80"
                          style={{ color: colors.textMuted, cursor: 'pointer' }}
                        >
                          <i className="bx bx-trash text-base" />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Inline comments section */}
                    {expandedComments.has(post.id) && (
                      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.cardBorder || 'var(--color-border)'}` }}>
                        {(inlineComments[post.id] || []).slice(0, 3).map((c: any) => (
                          <div key={c.id} className="flex gap-2 mb-2.5">
                            {c.user_avatar ? (
                              <img src={c.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[9px] font-bold" style={{ background: 'var(--color-bg-active)', color: colors.textMuted }}>
                                {(c.user_name || '').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold" style={{ color: colors.textPrimary }}>{c.user_name}</span>
                              <span className="text-[10px] ml-1.5" style={{ color: colors.textMuted }}>{new Date(c.created_at).toLocaleDateString()}</span>
                              <p className="text-xs m-0 mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>{c.content}</p>
                            </div>
                          </div>
                        ))}
                        {(inlineComments[post.id] || []).length > 3 && (
                          <Link href={`/@${handle}/post/${postSlug(post)}`} className="text-[11px] no-underline" style={{ color: colors.accent }}>
                            View all {post.comments_count} comments
                          </Link>
                        )}
                        {user && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={inlineCommentText[post.id] || ''}
                              onChange={e => setInlineCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInlineComment(post.id) } }}
                              placeholder="Write a comment..."
                              className="flex-1 px-3 py-1.5 rounded-full text-xs outline-none"
                              style={{ background: 'var(--color-bg-active)', border: '1px solid var(--color-border)', color: colors.textPrimary }}
                            />
                            <button
                              onClick={() => submitInlineComment(post.id)}
                              disabled={commentSubmitting === post.id || !(inlineCommentText[post.id] || '').trim()}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer disabled:opacity-40"
                              style={{ background: colors.accent, color: '#fff' }}
                            >
                              <i className="bx bx-send" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ProfileCard>
        ))
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 text-center">
          <span className="text-xs" style={{ color: colors.textMuted }}>
            {loadingMore ? 'Loading more...' : ''}
          </span>
        </div>
      )}
      </>
      )}

      {/* ── Activity Timeline ── */}
      {feedView === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activity.length === 0 ? (
            <ProfileCard style={{ marginBottom: 12 }}>
              <div className="py-12 px-5 text-center">
                <i className="bx bx-time-five block mb-2.5 text-4xl" style={{ color: colors.textMuted }} />
                <p className="text-sm m-0" style={{ color: colors.textMuted }}>No activity yet</p>
              </div>
            </ProfileCard>
          ) : (() => {
            const ACTIVITY_ICONS: Record<string, { icon: string; color: string; label: string }> = {
              post: { icon: 'bx-edit', color: '#00e5ff', label: 'Published a post' },
              comment: { icon: 'bx-comment', color: '#a900ff', label: 'Left a comment' },
              shared_note: { icon: 'bx-note', color: '#22c55e', label: 'Shared a note' },
              shared_skill: { icon: 'bx-code-alt', color: '#00e5ff', label: 'Shared a skill' },
              shared_agent: { icon: 'bx-bot', color: '#f59e0b', label: 'Shared an agent' },
              shared_workflow: { icon: 'bx-git-merge', color: '#8b5cf6', label: 'Shared a workflow' },
            }

            // Group by date
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const yesterday = new Date(today.getTime() - 86400000)
            const weekAgo = new Date(today.getTime() - 7 * 86400000)

            function dateGroup(d: string): string {
              const date = new Date(d)
              if (date >= today) return 'Today'
              if (date >= yesterday) return 'Yesterday'
              if (date >= weekAgo) return 'This Week'
              return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }

            const groups: Record<string, typeof activity> = {}
            for (const item of activity) {
              const g = dateGroup(item.created_at)
              if (!groups[g]) groups[g] = []
              groups[g].push(item)
            }

            return Object.entries(groups).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 0', marginBottom: 4 }}>
                  {group}
                </div>
                {items.map(item => {
                  const meta = ACTIVITY_ICONS[item.type] || { icon: 'bx-radio-circle', color: colors.textMuted, label: item.type }
                  const href = item.type === 'post' ? `/@${handle}/post/${item.id}` :
                    item.type === 'comment' && item.parent_id ? `/@${handle}/post/${item.parent_id}` :
                    item.slug ? `/@${handle}/shared/${item.entity_type}/${item.slug}` : undefined
                  const Wrapper = href ? Link : 'div'
                  return (
                    <Wrapper key={`${item.type}-${item.id}`} {...(href ? { href } : {})} style={{
                      display: 'flex', gap: 12, padding: '10px 12px', marginBottom: 2, borderRadius: 10,
                      textDecoration: 'none', transition: 'background 0.15s', cursor: href ? 'pointer' : 'default',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.background = 'var(--color-bg-active)' }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${meta.color}12`, color: meta.color,
                      }}>
                        <i className={`bx ${meta.icon}`} style={{ fontSize: 16 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{meta.label}</div>
                        {item.title && <div style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginTop: 1 }}>{item.title}</div>}
                        {item.excerpt && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.excerpt.slice(0, 100)}</div>}
                      </div>
                      <div style={{ fontSize: 10, color: colors.textMuted, flexShrink: 0, marginTop: 2 }}>
                        {new Date(item.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </Wrapper>
                  )
                })}
              </div>
            ))
          })()}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
