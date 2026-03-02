'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { use } from 'react'

const posts: Record<string, { title: string; date: string; readTime: string; tag: string; author: string; content: string[] }> = {
  'introducing-orchestra': {
    title: 'Introducing Orchestra: The AI-native IDE',
    date: 'February 27, 2026', readTime: '5 min read', tag: 'Announcement', author: 'Orchestra Team',
    content: [
      "We built Orchestra to solve a problem every AI developer faces: fragmentation. You have Claude in one window, a project tracker in another, a vector database running somewhere, and a dozen CLI tools that don't talk to each other.",
      "Orchestra is a unified plugin backbone that connects all of these together. 131 AI tools, callable via the MCP protocol from any AI client — Claude, Cursor, VS Code, Gemini, whatever you use.",
      "The core of Orchestra is a QUIC + Protobuf mesh. Every plugin — whether it's written in Go, Rust, Swift, Kotlin, or C# — connects to the orchestrator over QUIC with mTLS. Sub-millisecond latency, persistent connections, zero polling.",
      "We're launching with 16 plugins and 17 official packs. Packs let you install curated collections of skills, agents, and hooks with a single command. The marketplace will grow over time as the community builds more.",
      "Orchestra targets 5 platforms: macOS (Swift + WidgetKit), Windows (C# + WinUI 3), Linux (Vala + GTK4), Chrome Extension (Manifest V3), and mobile (iOS + Android). One backend, five native clients.",
      "Start free. Download Orchestra, run orchestra serve, and connect your AI client. We'll handle the rest.",
    ],
  },
  'rag-memory-engine': {
    title: 'How our RAG Memory Engine works',
    date: 'February 26, 2026', readTime: '8 min read', tag: 'Engineering', author: 'Orchestra Team',
    content: [
      "The engine.rag plugin is our first Rust plugin. It provides 22 MCP tools across four services: health, parse (Tree-sitter), search (Tantivy), and memory (SQLite + cosine similarity).",
      "For full-text search, we use Tantivy — a Rust search library similar to Apache Lucene. It handles our code indexing pipeline, supporting 14 language grammars via Tree-sitter for structured symbol extraction.",
      "Vector search uses SQLite with brute-force cosine similarity. For most codebases (under 10k vectors), this is fast enough and requires zero infrastructure. We plan a LanceDB upgrade for Phase 2 when scale demands it.",
      "The index_directory tool is one of our most powerful: it walks your codebase respecting .gitignore rules, batches Tantivy commits for performance, and indexes everything in seconds.",
      "Session-scoped observations let you attach structured notes to your work: understanding, decision, pattern, issue, insight. These become searchable memory that persists across agent sessions.",
      "The Rust plugin connects to the orchestrator over QUIC using the quinn crate — the same protocol all Go plugins use, just implemented in Rust. Protocol compatibility was a hard requirement from day one.",
    ],
  },
  'multi-agent-orchestration': {
    title: 'Multi-agent orchestration with Orchestra',
    date: 'February 25, 2026', readTime: '6 min read', tag: 'Tutorial', author: 'Orchestra Team',
    content: [
      "The agent.orchestrator plugin gives you 20 tools for defining agents, building workflows, and running them across any AI provider.",
      "Start by defining an agent. Give it a name, a provider (claude, openai, gemini, ollama, deepseek, etc.), and a system instruction.",
      "Workflows chain agents together. Sequential workflows pass output of each step as input to the next. Parallel workflows run all steps simultaneously.",
      "Every workflow run gets a RUN-{uuid} ID. Poll get_run_status to check progress, or pass wait=true to block until completion.",
      "The testing kit (6 tools) lets you write test suites for your agents with contains, not_contains, regex, and min_length assertions.",
      "Provider routing is automatic. Define accounts in tools.agentops with your API keys, and the orchestrator routes to the right bridge plugin.",
    ],
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params)
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
        <h1 style={{ fontSize: 32, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>Post not found</h1>
        <Link href="/blog" style={{ color: '#00e5ff', textDecoration: 'none' }}>Back to blog</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 32px' }}>
      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: backColor, textDecoration: 'none', marginBottom: 40 }}>
        <i className="bx bx-left-arrow-alt" /> Back to blog
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
      <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/blog" style={{ fontSize: 14, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <i className="bx bx-left-arrow-alt" /> All posts
        </Link>
        <Link href="/register" style={{ padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none' }}>
          Get started free
        </Link>
      </div>
    </div>
  )
}
