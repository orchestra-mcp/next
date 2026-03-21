import type { Metadata } from 'next'
import MarketplaceClient from './MarketplaceClient'
import FeatureGate from '@/components/feature-gate'

const apiBase = () => process.env.INTERNAL_API_URL || 'http://localhost:8080'

async function fetchSetting(key: string) {
  try {
    const res = await fetch(`${apiBase()}/api/public/settings/${key}`, { next: { revalidate: 60 } })
    if (res.ok) return (await res.json())?.value ?? {}
  } catch {}
  return {}
}

async function getMarketplaceData() {
  const [marketplace, general, plugins, community] = await Promise.all([
    fetchSetting('marketplace'),
    fetchSetting('general'),
    fetchSetting('plugins'),
    fetchSetting('community'),
  ])
  return {
    ...marketplace,
    framework_version: general.version ?? marketplace.framework_version,
    last_updated: general.last_updated ?? marketplace.last_updated,
    plugins: plugins.plugins ?? [],
    total_plugins: plugins.total ?? 0,
    total_tools: plugins.total_tools ?? 0,
    community_items: community.items ?? [],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchSetting('marketplace')
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
  return (
    <FeatureGate feature="marketplace">
      <MarketplaceClient data={data} />
    </FeatureGate>
  )
}
