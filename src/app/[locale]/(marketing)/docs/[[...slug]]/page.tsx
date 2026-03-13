import type { Metadata } from 'next'
import DocsClient from './DocsClient'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Comprehensive guides, tutorials, and API reference for Orchestra MCP. Learn to build plugins, manage projects, and orchestrate AI agents.',
  openGraph: {
    title: 'Documentation | Orchestra',
    description: 'Guides, tutorials, and API reference for Orchestra MCP.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | Orchestra',
    description: 'Guides, tutorials, and API reference for Orchestra MCP.',
  },
}

async function getDocsData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/docs`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function DocsPage({ params }: PageProps) {
  const [data, resolvedParams] = await Promise.all([getDocsData(), params])
  return <DocsClient data={data} slug={resolvedParams.slug} />
}
