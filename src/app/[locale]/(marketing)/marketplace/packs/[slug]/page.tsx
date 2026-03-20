import type { Metadata } from 'next'
import PackDetailClient from './PackDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pack = ALL_PACKS[slug]
  if (!pack) return { title: 'Pack Not Found' }
  const title = `${pack.display_name} Pack`
  const desc = pack.desc
  return {
    title,
    description: desc,
    openGraph: { title: `${title} | Orchestra Marketplace`, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} | Orchestra Marketplace`, description: desc },
  }
}

async function fetchReadme(packName: string): Promise<string | null> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/orchestra-mcp/pack-${packName}/main/README.md`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) return await res.text()
  } catch {}
  return null
}

function generateSeedReadme(slug: string, pack: { display_name: string; desc: string; skills: number; agents: number; hooks: number; stacks: string[] }): string {
  const contents: string[] = []
  if (pack.skills > 0) contents.push(`- **${pack.skills} skills** — slash commands for common ${pack.display_name.toLowerCase()} tasks`)
  if (pack.agents > 0) contents.push(`- **${pack.agents} agents** — specialized AI agents for ${pack.display_name.toLowerCase()} development`)
  if (pack.hooks > 0) contents.push(`- **${pack.hooks} hooks** — automation scripts triggered by events`)
  const stacks = pack.stacks.map(s => s === '*' ? 'all stacks' : s).join(', ')

  return `# pack-${slug}\n\n${pack.desc}\n\n## Contents\n\n${contents.join('\n')}\n\n## Stacks\n\n${stacks}\n\n## Installation\n\n\`\`\`bash\norchestra pack install ${slug}\n\`\`\`\n\nOr with full repo path:\n\n\`\`\`bash\norchestra pack install github.com/orchestra-mcp/pack-${slug}\n\`\`\`\n\n## What Gets Installed\n\nSkills are copied to \`.claude/skills/\`, agents to \`.claude/agents/\`, and hooks to \`.claude/hooks/\` in your project.\n\n## Requirements\n\n- Orchestra CLI v1.0.0+\n- \`orchestra init\` run in your project\n\n## License\n\nMIT`
}

const ALL_PACKS: Record<string, { display_name: string; desc: string; skills: number; agents: number; hooks: number; color: string; stacks: string[] }> = {
  'essentials': { display_name: 'Essentials', desc: 'Core project management, QA testing, docs, and plugin scaffolding.', skills: 4, agents: 3, hooks: 1, color: '#00e5ff', stacks: ['*'] },
  'go-backend': { display_name: 'Go Backend', desc: 'Fiber v3, GORM, JWT, asynq, and Go API development patterns.', skills: 1, agents: 2, hooks: 0, color: '#00acd7', stacks: ['go'] },
  'rust-engine': { display_name: 'Rust Engine', desc: 'Tonic gRPC, Tree-sitter, Tantivy, and rusqlite patterns.', skills: 1, agents: 2, hooks: 0, color: '#dea584', stacks: ['rust'] },
  'react-frontend': { display_name: 'React Frontend', desc: 'React, Zustand, shadcn/ui, Tailwind CSS v4, and TypeScript.', skills: 3, agents: 3, hooks: 0, color: '#61dafb', stacks: ['react', 'typescript'] },
  'ai': { display_name: 'AI & Agentic', desc: 'LLM integration, RAG pipelines, embeddings, and vector search.', skills: 1, agents: 2, hooks: 0, color: '#a900ff', stacks: ['*'] },
  'database': { display_name: 'Database', desc: 'PostgreSQL, SQLite, Redis sync and data layer patterns.', skills: 1, agents: 4, hooks: 0, color: '#336791', stacks: ['*'] },
  'desktop': { display_name: 'Desktop', desc: 'Wails v3, macOS integration, and native widget patterns.', skills: 3, agents: 2, hooks: 0, color: '#f97316', stacks: ['go'] },
  'mobile': { display_name: 'Mobile', desc: 'React Native, WatermelonDB, and offline sync patterns.', skills: 1, agents: 1, hooks: 0, color: '#22c55e', stacks: ['react-native'] },
  'extensions': { display_name: 'Extensions', desc: 'Native extension API, Raycast compat, VS Code compat, and marketplace.', skills: 4, agents: 1, hooks: 0, color: '#8b5cf6', stacks: ['*'] },
  'chrome': { display_name: 'Chrome Extension', desc: 'Chrome Manifest V3, service worker, and content scripts.', skills: 1, agents: 0, hooks: 0, color: '#4285f4', stacks: ['typescript'] },
  'infra': { display_name: 'Infrastructure', desc: 'Docker, GCP, CI/CD, and deployment patterns.', skills: 1, agents: 1, hooks: 0, color: '#ef4444', stacks: ['docker'] },
  'proto': { display_name: 'Proto & gRPC', desc: 'Protobuf, Buf, tonic-build, and Go-Rust code generation.', skills: 1, agents: 1, hooks: 0, color: '#16a34a', stacks: ['go', 'rust'] },
  'native-swift': { display_name: 'Swift / Apple', desc: 'macOS, iOS, SwiftUI, WidgetKit, and Apple platform plugins.', skills: 0, agents: 1, hooks: 0, color: '#ff6723', stacks: ['swift'] },
  'native-kotlin': { display_name: 'Kotlin / Android', desc: 'Jetpack Compose, Android plugins, and Kotlin patterns.', skills: 0, agents: 1, hooks: 0, color: '#7f52ff', stacks: ['kotlin', 'java'] },
  'native-csharp': { display_name: 'C# / Windows', desc: 'WinUI 3, .NET plugins, and Windows platform integration.', skills: 0, agents: 1, hooks: 0, color: '#512bd4', stacks: ['csharp'] },
  'native-gtk': { display_name: 'GTK / Linux', desc: 'GTK4, libadwaita, GNOME desktop integration, and Flatpak.', skills: 0, agents: 1, hooks: 0, color: '#fbbf24', stacks: ['c'] },
  'analytics': { display_name: 'Analytics', desc: 'ClickHouse OLAP, metrics, time-series, and materialized views.', skills: 0, agents: 1, hooks: 0, color: '#facc15', stacks: ['*'] },
  'laravel': { display_name: 'Laravel', desc: 'Eloquent, Blade, Artisan, queues, events, and PHP testing.', skills: 1, agents: 2, hooks: 0, color: '#ff2d20', stacks: ['php'] },
  'inertia': { display_name: 'Inertia.js', desc: 'Server-driven SPAs with Laravel + React/Vue/Svelte.', skills: 1, agents: 1, hooks: 0, color: '#9553e9', stacks: ['php', 'react', 'typescript'] },
  'tailwind': { display_name: 'Tailwind CSS', desc: 'Tailwind v4, utility-first styling, responsive, and dark mode.', skills: 1, agents: 1, hooks: 0, color: '#06b6d4', stacks: ['react', 'typescript', 'php'] },
  'powersync': { display_name: 'PowerSync', desc: 'Offline-first sync — Postgres/MongoDB to SQLite in real-time.', skills: 1, agents: 1, hooks: 0, color: '#3b82f6', stacks: ['react', 'react-native', 'typescript', 'flutter'] },
  'gcp': { display_name: 'Google Cloud', desc: 'Cloud Run, Cloud SQL, Cloud Build, CDN, and Pub/Sub.', skills: 1, agents: 1, hooks: 0, color: '#4285f4', stacks: ['docker', 'go', 'typescript'] },
  'docker': { display_name: 'Docker', desc: 'Dockerfile, Compose, multi-stage builds, and registries.', skills: 1, agents: 1, hooks: 0, color: '#2496ed', stacks: ['docker'] },
  'go-adk': { display_name: 'Go ADK', desc: 'Google Agent Development Kit — AI agents, tools, and Gemini.', skills: 1, agents: 1, hooks: 0, color: '#00897b', stacks: ['go'] },
}

export default async function PackDetailPage({ params }: PageProps) {
  const { slug } = await params
  const pack = ALL_PACKS[slug] ?? null
  if (!pack) {
    return <PackDetailClient slug={slug} pack={null} readme="" />
  }

  // Try GitHub first, fall back to generated seed README
  const githubReadme = await fetchReadme(slug)
  const readme = githubReadme ?? generateSeedReadme(slug, pack)
  const isSeedReadme = githubReadme === null

  return <PackDetailClient slug={slug} pack={pack} readme={readme} isSeedReadme={isSeedReadme} />
}
