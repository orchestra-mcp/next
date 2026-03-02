'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

const solutions = [
  {
    icon: 'bx-brain',
    title: 'For AI Engineers',
    subtitle: 'Build intelligent systems, not infrastructure.',
    color: '#00e5ff',
    useCases: [
      { title: 'RAG pipelines in minutes', desc: 'Index codebases, documents, and conversations with Tantivy + SQLite vector search. No separate vector database required.' },
      { title: 'Multi-provider agent workflows', desc: 'Route work to Claude, GPT-4o, Gemini, Ollama, or DeepSeek based on task type. Compare outputs across providers with one call.' },
      { title: 'Persistent AI memory', desc: 'save_memory, search_memory, save_observation — your agents remember past sessions and build context over time.' },
    ],
    cta: 'Explore AI tools',
    href: '/docs/ai-tools',
  },
  {
    icon: 'bx-group',
    title: 'For Dev Teams',
    subtitle: 'AI-native project management that ships.',
    color: '#a900ff',
    useCases: [
      { title: 'Feature lifecycle tracking', desc: '34 tools for managing features from backlog through documentation and review. Full audit trail in markdown — no database required.' },
      { title: 'Parallel agent execution', desc: 'Multiple AI agents work simultaneously on different features. WIP limits, dependency graphs, and assignee filters keep work organized.' },
      { title: 'Pack-driven consistency', desc: 'Enforce coding standards, review checklists, and deployment patterns via installable skill packs. One command, entire team aligned.' },
    ],
    cta: 'View feature tools',
    href: '/docs/features',
  },
  {
    icon: 'bx-buildings',
    title: 'For Enterprise',
    subtitle: 'Self-hosted, compliant, and extensible.',
    color: '#22c55e',
    useCases: [
      { title: 'Self-hosted deployment', desc: 'Run Orchestra entirely on your infrastructure. No data leaves your environment. Full control over plugins, models, and storage.' },
      { title: 'Custom plugin development', desc: 'Build proprietary plugins in Go, Rust, Swift, Kotlin, or C#. Integrate internal tools, databases, and APIs via the plugin SDK.' },
      { title: 'SSO and team management', desc: 'SAML/OIDC integration, role-based access control, audit logs, and compliance reporting built in.' },
    ],
    cta: 'Contact sales',
    href: '/contact',
  },
]

export default function SolutionsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textBody = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const ctaSecBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const ctaSecColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 72, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>Built for every team</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, margin: '0 auto' }}>Whether you&apos;re building AI systems, shipping features, or running enterprise infrastructure — Orchestra has you covered.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {solutions.map((sol, idx) => (
          <div key={sol.title} style={{ padding: '40px', borderRadius: 20, border: `1px solid ${sol.color}20`, background: `${sol.color}05`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: idx % 2 === 0 ? -40 : 'auto', left: idx % 2 !== 0 ? -40 : 'auto', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(ellipse, ${sol.color}12 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${sol.color}15`, border: `1px solid ${sol.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <i className={`bx ${sol.icon}`} style={{ fontSize: 26, color: sol.color }} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em', marginBottom: 8 }}>{sol.title}</h2>
                <p style={{ fontSize: 15, color: textBody, lineHeight: 1.6, marginBottom: 24 }}>{sol.subtitle}</p>
                <Link href={sol.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: `${sol.color}15`, color: sol.color, border: `1px solid ${sol.color}30`, textDecoration: 'none' }}>
                  {sol.cta} <i className="bx bx-right-arrow-alt" />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {sol.useCases.map(uc => (
                  <div key={uc.title} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${sol.color}20`, border: `1px solid ${sol.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: sol.color, fontSize: 11 }}>&#10003;</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{uc.title}</div>
                      <div style={{ fontSize: 13, color: textBody, lineHeight: 1.65 }}>{uc.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>Not sure which plan fits?</h2>
        <p style={{ fontSize: 16, color: textMuted, marginBottom: 28 }}>Start free and upgrade when you need more. No credit card required.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/register" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none' }}>Get started free</Link>
          <Link href="/contact" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500, border: `1px solid ${ctaSecBorder}`, color: ctaSecColor, textDecoration: 'none' }}>Talk to sales</Link>
        </div>
      </div>
    </div>
  )
}
