'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

interface Concept {
  term: string
  def: string
}

interface Requirement {
  os: string
  req: string
}

interface Step {
  step: string
  title: string
  code: string
  lang: string
}

interface DocsData {
  version?: string
  intro?: {
    title?: string
    version?: string
    description?: string
    what_is?: string
    concepts?: Concept[]
    install_cmd?: string
  }
  installation?: {
    title?: string
    description?: string
    install_cmd?: string
    verify_cmd?: string
    init_cmd?: string
    requirements?: Requirement[]
  }
  quick_start?: {
    title?: string
    description?: string
    steps?: Step[]
    ready_msg?: string
  }
}

interface DocsClientProps {
  data: DocsData
  slug?: string[]
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

export default function DocsClient({ data, slug }: DocsClientProps) {
  const t = useTranslations()
  const path = slug?.join('/') ?? ''
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const breadcrumbColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const rowBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const version = data.version ?? 'v1.0.0'

  const intro = data.intro ?? {}
  const installation = data.installation ?? {}
  const quickStart = data.quick_start ?? {}

  const concepts: Concept[] = intro.concepts ?? [
    { term: 'Plugin', def: 'A standalone binary that connects to the orchestrator over QUIC + Protobuf with mTLS. Written in Go, Rust, Swift, Kotlin, or C#.' },
    { term: 'MCP Tool', def: 'A callable function exposed by a plugin via the Model Context Protocol. Your AI client (Claude, Cursor, etc.) calls these automatically.' },
    { term: 'Pack', def: 'A curated collection of skills (slash commands), agents, and hooks. Installed with orchestra pack install <name>.' },
    { term: 'Orchestrator', def: 'The central process that manages plugin discovery, routing, and lifecycle. Runs on port 9100 by default.' },
  ]

  const requirements: Requirement[] = installation.requirements ?? [
    { os: 'macOS', req: '13.0+ (Ventura), Apple Silicon or Intel' },
    { os: 'Linux', req: 'kernel 5.4+, glibc 2.31+' },
    { os: 'Windows', req: 'Windows 10 19041+ (WSL2 for CLI)' },
  ]

  const steps: Step[] = quickStart.steps ?? [
    { step: '1', title: 'Install Orchestra', code: 'curl -fsSL https://orchestra-mcp.dev/install.sh | sh', lang: 'bash' },
    { step: '2', title: 'Initialize your project', code: 'cd your-project\norchestra init', lang: 'bash' },
    { step: '3', title: 'Start the server', code: 'orchestra serve\n# ✓ orchestrator  listening :9100\n# ✓ tools.features 34 tools\n# ✓ engine.rag     22 tools\n# ⚡ 290 tools ready', lang: 'bash' },
    { step: '4', title: 'Connect your AI client', code: '# .mcp.json is already configured by orchestra init\n# In Claude Code, Cursor, or VS Code:\n# Open your project — MCP tools are available automatically', lang: 'bash' },
    { step: '5', title: 'Install a pack (optional)', code: 'orchestra pack install go-backend\norchestra pack install typescript-react', lang: 'bash' },
  ]

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

      {/* Introduction */}
      {path === '' && (
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', fontSize: 12, color: '#00e5ff', fontWeight: 600, marginBottom: 16 }}>
            {version}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>
            {intro.title ?? t('docs.introTitle')}
          </h1>
          <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
            {intro.description ?? t('docs.introDesc')}
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.whatIsOrchestra')}</h2>
          <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.75, marginBottom: 24 }}>
            {intro.what_is ?? t('docs.whatIsDesc')}
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.coreConcepts')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {concepts.map(item => (
              <div key={item.term} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: cardBg }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace' }}>{item.term}</span>
                <span style={{ fontSize: 14, color: textMuted, marginInlineStart: 10 }}>{item.def}</span>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.quickInstall')}</h2>
          <CodeBlock lang="bash" isDark={isDark}>{intro.install_cmd ?? 'curl -fsSL https://orchestra-mcp.dev/install.sh | sh\norchestra init\norchestra serve'}</CodeBlock>

          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            <Link href="/docs/installation" style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {t('docs.installationGuide')} <i className="bx bx-right-arrow-alt rtl-flip" />
            </Link>
            <Link href="/docs/quick-start" style={{ padding: '11px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600, border: `1px solid ${cardBorder}`, color: textPrimary, textDecoration: 'none' }}>
              {t('docs.quickStart')}
            </Link>
          </div>
        </div>
      )}

      {/* Installation */}
      {path === 'installation' && (
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>
            {installation.title ?? t('docs.installTitle')}
          </h1>
          <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
            {installation.description ?? t('docs.installDesc')}
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.installScript')}</h2>
          <CodeBlock lang="bash" isDark={isDark}>{installation.install_cmd ?? 'curl -fsSL https://orchestra-mcp.dev/install.sh | sh'}</CodeBlock>
          <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, opacity: 0.7 }}>Installs the orchestra binary to /usr/local/bin. Prompts for sudo if needed.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.verifyInstallation')}</h2>
          <CodeBlock lang="bash" isDark={isDark}>{installation.verify_cmd ?? `orchestra version\n# Orchestra ${version}`}</CodeBlock>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.initializeProject')}</h2>
          <CodeBlock lang="bash" isDark={isDark}>{installation.init_cmd ?? 'cd your-project\norchestra init'}</CodeBlock>
          <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, opacity: 0.7 }}>
            Creates .mcp.json (MCP client config), .projects/ (feature storage), CLAUDE.md, and AGENTS.md in your project root.
          </p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{t('docs.systemRequirements')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {requirements.map(r => (
              <div key={r.os} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 8, background: rowBg, border: `1px solid ${rowBorder}`, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: textPrimary, width: 80, flexShrink: 0 }}>{r.os}</span>
                <span style={{ color: textMuted }}>{r.req}</span>
              </div>
            ))}
          </div>

          <Link href="/docs/quick-start" style={{ padding: '11px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {t('docs.quickStart')} <i className="bx bx-right-arrow-alt rtl-flip" />
          </Link>
        </div>
      )}

      {/* Quick Start */}
      {path === 'quick-start' && (
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16, lineHeight: 1.15 }}>
            {quickStart.title ?? t('docs.quickStartTitle')}
          </h1>
          <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.75, marginBottom: 32 }}>
            {quickStart.description ?? t('docs.quickStartDesc')}
          </p>

          {steps.map(s => (
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
              <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{t('docs.youreReady')}</span>
            </div>
            <p style={{ fontSize: 14, color: textMuted, margin: 0 }}>
              {quickStart.ready_msg ?? t('docs.readyMsg')}
            </p>
          </div>
        </div>
      )}

      {/* Unknown page */}
      {!['', 'installation', 'quick-start'].includes(path) && (
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 16 }}>{path}</h1>
          <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7, marginBottom: 32 }}>
            {t('docs.comingSoonMsg')}
          </p>
          <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00e5ff', textDecoration: 'none', fontSize: 14 }}>
            <i className="bx bx-left-arrow-alt rtl-flip" /> {t('docs.backToIntro')}
          </Link>
        </div>
      )}
    </div>
  )
}
