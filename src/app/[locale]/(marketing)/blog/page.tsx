import type { Metadata } from 'next'
import BlogClient from './BlogClient'
import FeatureGate from '@/components/feature-gate'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Updates, releases, and articles from the Orchestra team. Engineering deep dives, tutorials, and product announcements.',
  openGraph: {
    title: 'Blog | Orchestra',
    description: 'Updates, releases, and articles from the Orchestra team.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Orchestra',
    description: 'Updates, releases, and articles from the Orchestra team.',
  },
}

async function getBlogData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/blog`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

export default async function BlogPage() {
  const data = await getBlogData()
  return (
    <FeatureGate feature="blog">
      <BlogClient data={data} />
    </FeatureGate>
  )
}
