import type { Metadata } from 'next'
import MarketplaceClient from './MarketplaceClient'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse and install packs for Orchestra MCP. Skills, agents, and hooks curated for Go, Rust, React, Python, and more.',
  openGraph: {
    title: 'Marketplace | Orchestra',
    description: 'Browse and install packs for Orchestra MCP.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketplace | Orchestra',
    description: 'Browse and install packs for Orchestra MCP.',
  },
}

async function getMarketplaceData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const [marketplaceRes, generalRes] = await Promise.all([
      fetch(`${apiBase}/api/public/settings/marketplace`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/api/public/settings/general`, { next: { revalidate: 60 } }),
    ])
    const marketplace = marketplaceRes.ok ? (await marketplaceRes.json())?.value ?? {} : {}
    const general = generalRes.ok ? (await generalRes.json())?.value ?? {} : {}
    return {
      ...marketplace,
      framework_version: general.version ?? marketplace.framework_version,
      last_updated: general.last_updated ?? marketplace.last_updated,
    }
  } catch {}
  return {}
}

export default async function MarketplacePage() {
  const data = await getMarketplaceData()
  return <MarketplaceClient data={data} />
}
