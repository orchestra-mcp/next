'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

const posts = [
  { slug: 'introducing-orchestra', title: 'Introducing Orchestra: The AI-native IDE', excerpt: 'We built Orchestra to solve the fragmentation problem in AI tooling. One protocol, every platform, any AI.', date: 'Feb 27, 2026', readTime: '5 min read', tag: 'Announcement' },
  { slug: 'rag-memory-engine', title: 'How our RAG Memory Engine works', excerpt: 'A deep dive into Tantivy full-text search, SQLite vector embeddings, and how we got it running in Rust.', date: 'Feb 26, 2026', readTime: '8 min read', tag: 'Engineering' },
  { slug: 'multi-agent-orchestration', title: 'Multi-agent orchestration with Orchestra', excerpt: 'Running Claude, GPT-4o, and Gemini in parallel agent workflows using our new agent.orchestrator plugin.', date: 'Feb 25, 2026', readTime: '6 min read', tag: 'Tutorial' },
  { slug: 'quic-plugin-mesh', title: 'Why we chose QUIC over HTTP for our plugin mesh', excerpt: 'The architectural decision behind our QUIC + Protobuf + mTLS plugin backbone and what it gives us.', date: 'Feb 20, 2026', readTime: '10 min read', tag: 'Engineering' },
  { slug: 'packs-system', title: 'Introducing the Packs system: 17 official packs', excerpt: 'Install skills, agents, and hooks with one command. A walkthrough of our new marketplace.', date: 'Feb 15, 2026', readTime: '4 min read', tag: 'Product' },
  { slug: 'five-platforms', title: 'One backend, five platforms: how we do it', excerpt: 'Building macOS, Windows, Linux, Chrome, iOS, and Android apps that all talk to the same Go backend.', date: 'Feb 10, 2026', readTime: '7 min read', tag: 'Engineering' },
]

const tagColors: Record<string, { bg: string; border: string; text: string }> = {
  Announcement: { bg: 'rgba(0,229,255,0.08)', border: 'rgba(0,229,255,0.2)', text: '#00e5ff' },
  Engineering:  { bg: 'rgba(169,0,255,0.08)', border: 'rgba(169,0,255,0.2)', text: '#c040ff' },
  Tutorial:     { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#22c55e' },
  Product:      { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', text: '#fbbf24' },
}

export default function BlogPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 56, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>Blog</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 480, margin: '0 auto' }}>News, engineering deep-dives, and tutorials from the Orchestra team.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                <span>{post.date}</span><span>&middot;</span><span>{post.readTime}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
