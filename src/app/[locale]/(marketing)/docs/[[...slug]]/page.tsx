import type { Metadata } from 'next'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import DocsClient from './DocsClient'

const apiBase = () => process.env.INTERNAL_API_URL || 'http://localhost:8080'

// ── DB Doc types ──────────────────────────────────────────────────────────────

interface DbDoc {
  doc_id: string
  title: string
  category: string
  body: string
  order?: number
  published: boolean
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function fetchDbDocs(): Promise<DbDoc[]> {
  try {
    const res = await fetch(`${apiBase()}/api/docs`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      return (Array.isArray(data) ? data : []).filter((d: DbDoc) => d.published !== false)
    }
  } catch {}
  return []
}

async function fetchDbDoc(slug: string): Promise<DbDoc | null> {
  try {
    const res = await fetch(`${apiBase()}/api/docs/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } })
    if (res.ok) return await res.json()
  } catch {}
  return null
}

// ── Filesystem fallback ───────────────────────────────────────────────────────

const DOCS_ROOT = join(process.cwd(), '..', '..', 'docs')

interface DocFrontmatter {
  title?: string
  description?: string
  order?: number
}

function parseFrontmatter(content: string): { meta: DocFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const meta: DocFrontmatter = {}
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':')
    const val = rest.join(':').trim()
    if (key.trim() === 'title') meta.title = val
    if (key.trim() === 'description') meta.description = val
    if (key.trim() === 'order') meta.order = parseInt(val, 10)
  }
  return { meta, body: match[2] }
}

const SLUG_MAP: Record<string, string> = {
  '': 'getting-started/introduction.md',
  'installation': 'getting-started/installation.md',
  'quick-start': 'getting-started/quick-start.md',
  'cli/serve': 'cli/serve.md',
  'cli/init': 'cli/init.md',
  'cli/pack': 'cli/pack.md',
  'cli/version': 'cli/version.md',
  'tools/features': 'tools/features.md',
  'tools/rag': 'tools/rag.md',
  'tools/agents': 'tools/agents.md',
  'tools/marketplace': 'tools/marketplace.md',
  'sdk/architecture': 'sdk/architecture.md',
  'sdk/go': 'sdk/go.md',
  'sdk/rust': 'sdk/rust.md',
  'sdk/quic': 'sdk/quic.md',
  'architecture/overview': 'architecture/overview.md',
  'architecture/mesh': 'architecture/mesh.md',
  'architecture/storage': 'architecture/storage.md',
}

async function getFsDocContent(slug: string): Promise<{ title: string; description: string; body: string } | null> {
  const filePath = SLUG_MAP[slug]
  if (!filePath) return null
  try {
    const raw = await readFile(join(DOCS_ROOT, filePath), 'utf-8')
    const { meta, body } = parseFrontmatter(raw)
    return { title: meta.title ?? (slug || 'Introduction'), description: meta.description ?? '', body }
  } catch {
    return null
  }
}

async function getFsSidebarSections() {
  const sections = [
    { dir: 'getting-started', title: 'Getting Started', prefix: '' },
    { dir: 'cli', title: 'CLI Reference', prefix: 'cli' },
    { dir: 'tools', title: 'MCP Tools', prefix: 'tools' },
    { dir: 'sdk', title: 'Plugin SDK', prefix: 'sdk' },
    { dir: 'architecture', title: 'Architecture', prefix: 'architecture' },
  ]
  const result: Array<{ title: string; items: Array<{ label: string; slug: string }> }> = []
  for (const section of sections) {
    try {
      const dirPath = join(DOCS_ROOT, section.dir)
      const files = await readdir(dirPath)
      const items: Array<{ label: string; slug: string; order: number }> = []
      for (const file of files) {
        if (!file.endsWith('.md')) continue
        try {
          const raw = await readFile(join(dirPath, file), 'utf-8')
          const { meta } = parseFrontmatter(raw)
          const fileSlug = file.replace('.md', '')
          let slug: string
          if (section.dir === 'getting-started') {
            slug = fileSlug === 'introduction' ? '' : fileSlug
          } else {
            slug = `${section.prefix}/${fileSlug}`
          }
          items.push({ label: meta.title ?? fileSlug, slug, order: meta.order ?? 99 })
        } catch { /* skip */ }
      }
      items.sort((a, b) => a.order - b.order)
      result.push({ title: section.title, items: items.map(i => ({ label: i.label, slug: i.slug })) })
    } catch { /* skip */ }
  }
  return result
}

// ── DB sidebar builder ────────────────────────────────────────────────────────

function buildDbSidebar(docs: DbDoc[]): Array<{ title: string; items: Array<{ label: string; slug: string }> }> {
  // Group by category
  const grouped: Record<string, DbDoc[]> = {}
  for (const doc of docs) {
    const cat = doc.category || 'General'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(doc)
  }
  return Object.entries(grouped).map(([cat, items]) => ({
    title: cat,
    items: items
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .map(d => ({ label: d.title, slug: d.doc_id })),
  }))
}

// ── Main logic ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slugPath = resolvedParams.slug?.join('/') ?? ''

  // Try DB first
  const dbDoc = await fetchDbDoc(slugPath || 'introduction')
  if (dbDoc?.title) {
    return {
      title: dbDoc.title,
      description: '',
      openGraph: { title: `${dbDoc.title} | Orchestra Docs`, description: '', type: 'website' },
    }
  }

  const fsDoc = await getFsDocContent(slugPath)
  const title = fsDoc?.title || 'Documentation'
  const desc = fsDoc?.description || 'Comprehensive guides, tutorials, and API reference for Orchestra MCP.'
  return {
    title,
    description: desc,
    openGraph: { title: `${title} | Orchestra Docs`, description: desc, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} | Orchestra Docs`, description: desc },
  }
}

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function DocsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slugPath = resolvedParams.slug?.join('/') ?? ''

  // Try DB system docs first
  const [dbDocs, dbDoc] = await Promise.all([
    fetchDbDocs(),
    fetchDbDoc(slugPath || 'introduction'),
  ])

  if (dbDocs.length > 0) {
    const sidebar = buildDbSidebar(dbDocs)
    const activeDoc = dbDoc ?? dbDocs.find(d => d.doc_id === slugPath) ?? null
    return (
      <DocsClient
        slug={resolvedParams.slug}
        title={activeDoc?.title ?? (slugPath || 'Introduction')}
        description=""
        body={activeDoc?.body ?? null}
        sidebar={sidebar}
      />
    )
  }

  // Fallback: filesystem
  const [fsDoc, fsSidebar] = await Promise.all([
    getFsDocContent(slugPath),
    getFsSidebarSections(),
  ])
  return (
    <DocsClient
      slug={resolvedParams.slug}
      title={fsDoc?.title ?? (slugPath || 'Introduction')}
      description={fsDoc?.description ?? ''}
      body={fsDoc?.body ?? null}
      sidebar={fsSidebar}
    />
  )
}
