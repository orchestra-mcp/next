'use client'
import Link from 'next/link'
import { use } from 'react'
import { useThemeStore } from '@/store/theme'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default function DocsPage({ params }: PageProps) {
  const { slug } = use(params)
  const path = slug?.join('/') ?? ''
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const textDim = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const breadcrumbColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: breadcrumbColor, marginBottom: 32 }}>
        <Link href="/docs" style={{ color: breadcrumbColor, textDecoration: 'none' }}>Docs</Link>
        {slug?.map((s, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>/</span>
            <span style={{ color: i === slug.length - 1 ? (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') : breadcrumbColor }}>{s}</span>
          </span>
        ))}
      </div>

      {path === '' && <IntroductionContent textPrimary={textPrimary} textMuted={textMuted} textDim={textDim} cardBg={cardBg} cardBorder={cardBorder} isDark={isDark} />}
      {path === 'installation' && <InstallationContent textPrimary={textPrimary} textMuted={textMuted} textDim={textDim} isDark={isDark} />}
      {path === 'quick-start' && <QuickStartContent textPrimary={textPrimary} textMuted={textMuted} isDark={isDark} />}
      {!['', 'installation', 'quick-start'].includes(path) && (
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16 }}>{path}</h1>
          <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7, marginBottom: 32 }}>
            This documentation page is coming soon. Check our <a href="https://github.com/orchestra-mcp" target="_blank" rel="noopener" style={{ color: '#00e5ff', textDecoration: 'none' }}>GitHub</a> for the latest updates.
          </p>
          <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00e5ff', textDecoration: 'none', fontSize: 14 }}>
            <i className="bx bx-left-arrow-alt" /> Back to introduction
          </Link>
        </div>
      )}
    </div>
  )
}

interface ContentProps {
  textPrimary: string
  textMuted: string
  textDim?: string
  cardBg?: string
  cardBorder?: string
  isDark: boolean
}

function CodeBlock({ children, lang = '', isDark }: { children: string; lang?: string; isDark: boolean }) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)', marginBottom: 20 }}>
      {lang && (
        <div style={{ padding: '6px 14px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', fontSize: 11, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>{lang}</div>
      )}
      <pre style={{ padding: '16px 18px', background: isDark ? '#13111a' : '#1e1e2e', margin: 0, fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: 13, lineHeight: 1.7, color: '#d0d0d0', overflowX: 'auto' }}>
        <code>{children}</code>
      </pre>
    </div>
  )
}

function IntroductionContent({ textPrimary, textMuted, textDim, cardBg, cardBorder, isDark }: ContentProps) {
  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', fontSize: 12, color: '#00e5ff', fontWeight: 600, marginBottom: 16 }}>
        v0.0.2-beta
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>Introduction to Orchestra</h1>
      <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
        Orchestra is an AI-native IDE platform that connects your AI agents to a unified plugin backbone. 131 tools, 16 plugins, 5 platforms, one protocol.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>What is Orchestra?</h2>
      <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.75, marginBottom: 24 }}>
        Orchestra solves the fragmentation problem in AI tooling. Instead of gluing together separate tools for project management, vector search, agent orchestration, and file storage, Orchestra provides all of these as MCP-compatible tools via a unified plugin mesh.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>Core concepts</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
        {[
          { term: 'Plugin', def: 'A standalone binary that connects to the orchestrator over QUIC + Protobuf with mTLS. Can be written in Go, Rust, Swift, Kotlin, or C#.' },
          { term: 'MCP Tool', def: 'A callable function exposed by a plugin via the Model Context Protocol (MCP). Your AI client (Claude, Cursor, etc.) calls these tools automatically.' },
          { term: 'Pack', def: 'A curated collection of skills (slash commands), agents, and hooks. Installed with orchestra pack install <name>.' },
          { term: 'Orchestrator', def: 'The central process that manages plugin discovery, routing, and lifecycle. Runs on port 9100 by default.' },
        ].map(item => (
          <div key={item.term} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: cardBg }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace' }}>{item.term}</span>
            <span style={{ fontSize: 14, color: textMuted, marginLeft: 10 }}>{item.def}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>Quick install</h2>
      <CodeBlock lang="bash" isDark={isDark}>{`curl -fsSL https://orchestra-mcp.dev/install.sh | sh\norchestra init\norchestra serve`}</CodeBlock>

      <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
        <Link href="/docs/installation" style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Installation guide <i className="bx bx-right-arrow-alt" />
        </Link>
        <Link href="/docs/quick-start" style={{ padding: '11px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600, border: `1px solid ${cardBorder}`, color: textPrimary, textDecoration: 'none' }}>
          Quick start
        </Link>
      </div>
    </div>
  )
}

function InstallationContent({ textPrimary, textMuted, isDark }: ContentProps) {
  const rowBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const noteBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>Installation</h1>
      <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
        Install Orchestra using the install script (recommended) or download a platform-specific binary.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>Install script (macOS + Linux)</h2>
      <CodeBlock lang="bash" isDark={isDark}>{`curl -fsSL https://orchestra-mcp.dev/install.sh | sh`}</CodeBlock>
      <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, opacity: 0.7 }}>Installs the orchestra binary to /usr/local/bin. Prompts for sudo if needed.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>Verify installation</h2>
      <CodeBlock lang="bash" isDark={isDark}>{`orchestra version\n# Orchestra v0.0.2-beta (commit: abc1234)`}</CodeBlock>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>Initialize your project</h2>
      <CodeBlock lang="bash" isDark={isDark}>{`cd your-project\norchestra init`}</CodeBlock>
      <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, opacity: 0.7 }}>
        Creates .mcp.json (MCP client config), .projects/ (feature storage), CLAUDE.md, and AGENTS.md in your project root.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>System requirements</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {[
          { os: 'macOS', req: '13.0+ (Ventura), Apple Silicon or Intel' },
          { os: 'Linux', req: 'kernel 5.4+, glibc 2.31+' },
          { os: 'Windows', req: 'Windows 10 19041+ (WSL2 for CLI)' },
        ].map(r => (
          <div key={r.os} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 8, background: rowBg, border: `1px solid ${rowBorder}`, fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: textPrimary, width: 80, flexShrink: 0 }}>{r.os}</span>
            <span style={{ color: textMuted }}>{r.req}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/docs/quick-start" style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Quick start <i className="bx bx-right-arrow-alt" />
        </Link>
      </div>
    </div>
  )
}

function QuickStartContent({ textPrimary, textMuted, isDark }: ContentProps) {
  return (
    <div>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>Quick Start</h1>
      <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
        Get Orchestra running and connected to your AI client in under 5 minutes.
      </p>

      {[
        { step: '1', title: 'Install Orchestra', code: 'curl -fsSL https://orchestra-mcp.dev/install.sh | sh', lang: 'bash' },
        { step: '2', title: 'Initialize your project', code: 'cd your-project\norchestra init', lang: 'bash' },
        { step: '3', title: 'Start the server', code: 'orchestra serve\n# ✓ orchestrator  listening :9100\n# ✓ tools.features 34 tools\n# ✓ engine.rag     22 tools\n# ⚡ 131 tools ready', lang: 'bash' },
        { step: '4', title: 'Connect your AI client', code: '# .mcp.json is already configured by orchestra init\n# In Claude Code, Cursor, or VS Code:\n# Open your project — MCP tools are available automatically', lang: 'bash' },
        { step: '5', title: 'Install a pack (optional)', code: 'orchestra pack install go-backend\norchestra pack install typescript-react', lang: 'bash' },
      ].map(s => (
        <div key={s.step} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>{s.step}</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{s.title}</h2>
          </div>
          <CodeBlock lang={s.lang} isDark={isDark}>{s.code}</CodeBlock>
        </div>
      ))}

      <div style={{ padding: '20px 24px', borderRadius: 12, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <i className="bx bx-check-circle" style={{ color: '#22c55e', fontSize: 18 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>You&apos;re ready</span>
        </div>
        <p style={{ fontSize: 14, color: textMuted, margin: 0 }}>
          Orchestra is running. Your AI client now has access to 131 tools across project management, RAG memory, agent orchestration, and more.
        </p>
      </div>
    </div>
  )
}
