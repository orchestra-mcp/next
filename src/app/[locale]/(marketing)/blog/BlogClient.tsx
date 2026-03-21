'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  read_time: string
  tag: string
}

interface BlogData {
  posts?: Post[]
}

const tagColors: Record<string, { bg: string; border: string; text: string }> = {
  Announcement: { bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.2)',   text: '#00e5ff' },
  Engineering:  { bg: 'rgba(169,0,255,0.08)',   border: 'rgba(169,0,255,0.2)',   text: '#c040ff' },
  Tutorial:     { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#22c55e' },
  Product:      { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  text: '#fbbf24' },
}

export default function BlogClient({ data }: { data: BlogData }) {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  const posts = data.posts ?? []

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 56, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>{t('blog.title')}</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 480, margin: '0 auto' }}>{t('blog.subtitle')}</p>
      </div>
      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 15, color: textMuted }}>{t('blog.noPosts')}</p>
        </div>
      )}
      <div className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {posts.map(post => {
          const tag = tagColors[post.tag] ?? tagColors.Announcement
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ padding: '28px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: tag.bg, color: tag.text, border: `1px solid ${tag.border}` }}>
                  {post.tag}
                </span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, lineHeight: 1.4, margin: 0 }}>{post.title}</h2>
              <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.65, margin: 0, flex: 1 }}>{post.excerpt}</p>
              <div style={{ fontSize: 12, color: textDim, display: 'flex', gap: 8 }}>
                <span>{post.date}</span><span>&middot;</span><span>{post.read_time}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
