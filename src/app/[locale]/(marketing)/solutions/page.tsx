import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'

export const metadata: Metadata = {
  title: 'Solutions',
  description: 'Discover how Orchestra MCP accelerates development workflows. Solutions for teams, solo developers, and enterprises.',
  openGraph: {
    title: 'Solutions | Orchestra',
    description: 'Discover how Orchestra MCP accelerates development workflows.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solutions | Orchestra',
    description: 'Discover how Orchestra MCP accelerates development workflows.',
  },
}

async function getSolutionsData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/solutions`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

export default async function SolutionsPage() {
  const data = await getSolutionsData()
  return <SolutionsClient data={data} />
}
