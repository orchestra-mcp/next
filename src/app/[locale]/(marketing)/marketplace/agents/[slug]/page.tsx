import type { Metadata } from 'next'
import CommunityDetailClient from '../../_shared/CommunityDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getAgent(slug)
  if (!item) return { title: 'Agent Not Found' }
  return {
    title: `${item.name} — Agent`,
    description: item.desc,
    openGraph: { title: `${item.name} | Orchestra Marketplace`, description: item.desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${item.name} | Orchestra Marketplace`, description: item.desc },
  }
}

async function getAgent(slug: string) {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/marketplace/agents/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return data?.data ?? data ?? null
    }
  } catch {}

  const SEEDS: Record<string, any> = {
    'security-auditor': { slug: 'security-auditor', name: 'Security Auditor', desc: 'Scan for OWASP Top 10, dependency vulns, and secret leaks.', author: 'Aisha Patel', author_handle: 'aishap', type: 'agent', stacks: ['*'], downloads: 2100, content: '# Security Auditor Agent\n\nA specialized AI agent that audits your codebase for security vulnerabilities.\n\n## Capabilities\n- OWASP Top 10 vulnerability scanning\n- Dependency vulnerability checks (CVE database)\n- Secret and credential leak detection\n- SQL injection and XSS pattern matching\n- Security header analysis\n\n## Model\nClaude Sonnet (recommended) or any provider\n\n## Tools Used\n- `search` — Full-text codebase search\n- `get_symbols` — Extract function signatures\n- `parse_file` — AST analysis for pattern matching' },
    'db-migration-writer': { slug: 'db-migration-writer', name: 'DB Migration Writer', desc: 'Generate migration files from schema diffs with rollback support.', author: 'Lars Eriksson', author_handle: 'larse', type: 'agent', stacks: ['go', 'php'], downloads: 760, content: '# DB Migration Writer Agent\n\nGenerates database migration files by analyzing schema differences.\n\n## Capabilities\n- Compares current schema with target schema\n- Generates up and down migration SQL\n- Supports PostgreSQL and SQLite\n- Handles column renames, type changes, and index modifications\n\n## Model\nAny provider (Claude, OpenAI, Gemini)' },
  }
  return SEEDS[slug] ?? null
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getAgent(slug)
  return <CommunityDetailClient item={item} type="agent" slug={slug} />
}
