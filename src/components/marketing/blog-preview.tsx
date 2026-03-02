'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

const posts = [
  {
    slug: 'introducing-orchestra',
    title: 'Introducing Orchestra: The AI-native IDE',
    excerpt: 'We built Orchestra to solve the fragmentation problem in AI tooling. One protocol, every platform, any AI.',
    date: 'Feb 2026', readTime: '5 min read', tag: 'Announcement',
  },
  {
    slug: 'rag-memory-engine',
    title: 'How our RAG Memory Engine works',
    excerpt: 'A deep dive into Tantivy full-text search, SQLite vector embeddings, and how we got it running in Rust.',
    date: 'Feb 2026', readTime: '8 min read', tag: 'Engineering',
  },
  {
    slug: 'multi-agent-orchestration',
    title: 'Multi-agent orchestration with Orchestra',
    excerpt: 'Running Claude, GPT-4o, and Gemini in parallel agent workflows using our new agent.orchestrator plugin.',
    date: 'Feb 2026', readTime: '6 min read', tag: 'Tutorial',
  },
]

export function BlogPreview() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

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
              <span>{post.date}</span><span>&middot;</span><span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
