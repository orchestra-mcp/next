import type { Metadata } from 'next'
import CommunityDetailClient from '../../_shared/CommunityDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await getWorkflow(slug)
  if (!item) return { title: 'Workflow Not Found' }
  return {
    title: `${item.name} — Workflow`,
    description: item.desc,
    openGraph: { title: `${item.name} | Orchestra Marketplace`, description: item.desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${item.name} | Orchestra Marketplace`, description: item.desc },
  }
}

async function getWorkflow(slug: string) {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/marketplace/workflows/${slug}`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return data?.data ?? data ?? null
    }
  } catch {}

  const SEEDS: Record<string, any> = {
    'pr-pipeline': { slug: 'pr-pipeline', name: 'PR Review Pipeline', desc: 'Multi-step workflow: lint → test → review → changelog.', author: 'Yuki Tanaka', author_handle: 'yukit', type: 'workflow', stacks: ['*'], downloads: 1560, content: '# PR Review Pipeline\n\nA 4-step workflow that automates the entire PR review process.\n\n## Steps\n1. **Lint** — Run linters and formatters, auto-fix where possible\n2. **Test** — Execute test suite, report failures\n3. **Review** — AI-powered code review with inline comments\n4. **Changelog** — Generate changelog entry from PR diff\n\n## Agents Used\n- `lint-runner` (Step 1)\n- `test-runner` (Step 2)\n- `code-reviewer` (Step 3)\n- `doc-generator` (Step 4)\n\n## Execution\n```\nrun_workflow({ name: "pr-pipeline" })\n```\nTypical runtime: 4-8 seconds' },
    'deploy-staging': { slug: 'deploy-staging', name: 'Deploy to Staging', desc: 'Build → test → Docker push → deploy to staging with rollback.', author: 'Omar Hassan', author_handle: 'omarh', type: 'workflow', stacks: ['docker', 'go'], downloads: 920, content: '# Deploy to Staging\n\nEnd-to-end deployment workflow with automatic rollback on failure.\n\n## Steps\n1. **Build** — Compile and create Docker image\n2. **Test** — Run integration tests against the build\n3. **Push** — Push image to container registry\n4. **Deploy** — Deploy to staging environment\n5. **Verify** — Health check and smoke tests\n\n## Rollback\nIf any step fails, the workflow automatically rolls back to the previous stable deployment.\n\n## Required Secrets\n- `DOCKER_REGISTRY_URL`\n- `STAGING_SSH_KEY`\n- `STAGING_HOST`' },
  }
  return SEEDS[slug] ?? null
}

export default async function WorkflowDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getWorkflow(slug)
  return <CommunityDetailClient item={item} type="workflow" slug={slug} />
}
