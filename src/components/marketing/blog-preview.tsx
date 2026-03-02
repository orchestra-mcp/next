'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

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

const FALLBACK_POSTS: Post[] = [
  { slug: 'orchestra-v1-release', title: 'Orchestra v1.0.0 — GA release', excerpt: 'After months of development, Orchestra v1.0.0 is here. 290 tools, 36 plugins, 17 packs, 5 platforms.', date: 'Mar 2026', read_time: '5 min read', tag: 'Announcement' },
  { slug: 'in-process-architecture', title: 'Why we switched to in-process architecture', excerpt: 'We replaced our QUIC plugin mesh with an in-process single-binary design for local IDE use.', date: 'Mar 2026', read_time: '7 min read', tag: 'Engineering' },
  { slug: 'rag-memory-engine', title: 'How our RAG Memory Engine works', excerpt: 'A deep dive into Tantivy full-text search, SQLite vector embeddings, and how we got 22 tools running in Rust.', date: 'Feb 2026', read_time: '8 min read', tag: 'Engineering' },
]

export function BlogPreview({ data }: { data?: Record<string, unknown> }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  const rawPosts = (data?.posts ?? []) as Post[]
  const posts = rawPosts.length ? rawPosts.slice(0, 3) : FALLBACK_POSTS

  return (
    <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8, color: textPrimary }}>From the blog</h2>
          <p style={{ fontSize: 15, color: textMuted }}>Latest news, tutorials, and engineering deep-dives.</p>
        </div>
        <Link href="/blog" style={{ fontSize: 14, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          View all posts <i className="bx bx-right-arrow-alt" />
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ padding: '24px', borderRadius: 16, border: `1px solid ${cardBorder}`, background: cardBg, textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>{post.tag}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, lineHeight: 1.4, marginBottom: 10 }}>{post.title}</h3>
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
            <div style={{ fontSize: 12, color: textDim, display: 'flex', gap: 8 }}>
              <span>{post.date}</span><span>&middot;</span><span>{post.read_time}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
