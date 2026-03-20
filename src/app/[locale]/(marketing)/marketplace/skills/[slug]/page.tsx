import type { Metadata } from 'next'
import CommunityDetailClient from '../../_shared/CommunityDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getSkill(slug)
  if (!item) return { title: 'Skill Not Found' }
  return {
    title: `${item.name} — Skill`,
    description: item.desc,
    openGraph: { title: `${item.name} | Orchestra Marketplace`, description: item.desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${item.name} | Orchestra Marketplace`, description: item.desc },
  }
}

// In production, this fetches from the API. For now, uses seed data.
async function getSkill(slug: string) {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/marketplace/skills/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return data?.data ?? data ?? null
    }
  } catch {}

  // Fallback seed data
  const SEEDS: Record<string, any> = {
    'commit-reviewer': { slug: 'commit-reviewer', name: 'Commit Reviewer', desc: 'AI-powered code review for every commit with inline annotations.', author: 'Sarah Chen', author_handle: 'sarachen', type: 'skill', stacks: ['go', 'typescript'], downloads: 1240, content: '# /commit-review\n\nRuns AI-powered code review on the latest commit.\n\n## What it does\n- Analyzes the git diff of the latest commit\n- Checks for bugs, security issues, and style violations\n- Posts inline annotations on each finding\n- Suggests fixes with code snippets\n\n## Usage\n```\n/commit-review\n/commit-review --last 3\n```' },
    'api-scaffolder': { slug: 'api-scaffolder', name: 'API Scaffolder', desc: 'Generate REST API boilerplate from an OpenAPI spec.', author: 'Marco Rossi', author_handle: 'mrossi', type: 'skill', stacks: ['go', 'rust'], downloads: 890, content: '# /api-scaffold\n\nGenerates REST API boilerplate from an OpenAPI specification.\n\n## What it does\n- Reads an OpenAPI 3.0+ YAML/JSON spec\n- Generates handler stubs, router setup, and request/response types\n- Supports Go (Fiber) and Rust (Axum) backends\n\n## Usage\n```\n/api-scaffold openapi.yaml\n```' },
  }
  return SEEDS[slug] ?? null
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getSkill(slug)
  return <CommunityDetailClient item={item} type="skill" slug={slug} />
}
