import type { Metadata } from 'next'
import DownloadClient from './DownloadClient'
import FeatureGate from '@/components/feature-gate'

export const metadata: Metadata = {
  title: 'Download',
  description: 'Download Orchestra for your IDE. Works with Claude Code, Cursor, VS Code, Windsurf, Cline, Gemini, Zed, and more.',
  openGraph: {
    title: 'Download Orchestra',
    description: 'Get Orchestra for your IDE. One install, 290+ tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Orchestra',
    description: 'Get Orchestra for your IDE. One install, 290+ tools.',
  },
}

async function getDownloadData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/download`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

export default async function DownloadPage() {
  const data = await getDownloadData()
  return (
    <FeatureGate feature="download">
      <DownloadClient data={data} />
    </FeatureGate>
  )
}
