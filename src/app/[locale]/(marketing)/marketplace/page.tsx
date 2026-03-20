import type { Metadata } from 'next'
import MarketplaceClient from './MarketplaceClient'

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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/marketplace`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = (await res.json())?.value ?? {}
      if (data.seo_title || data.seo_description) {
        const title = data.seo_title || 'Marketplace'
        const desc = data.seo_description || 'Plugins, packs, skills, agents, and workflows for Orchestra MCP.'
        return {
          title,
          description: desc,
          openGraph: { title: `${title} | Orchestra`, description: desc, type: 'website' },
          twitter: { card: 'summary_large_image', title: `${title} | Orchestra`, description: desc },
        }
      }
    }
  } catch {}

  return {
    title: 'Marketplace',
    description: 'Plugins, packs, skills, agents, and workflows for Orchestra MCP. Install with one command or share your own.',
    openGraph: {
      title: 'Marketplace | Orchestra',
      description: 'Plugins, packs, skills, agents, and workflows for Orchestra MCP.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Marketplace | Orchestra',
      description: 'Plugins, packs, skills, agents, and workflows for Orchestra MCP.',
    },
  }
}

export default async function MarketplacePage() {
  const data = await getMarketplaceData()
  return <MarketplaceClient data={data} />
}
