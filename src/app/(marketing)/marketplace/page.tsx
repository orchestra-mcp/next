import { useThemeStore } from '@/store/theme'
import MarketplaceClient from './MarketplaceClient'

async function getMarketplaceData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/settings/marketplace`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

export default async function MarketplacePage() {
  const data = await getMarketplaceData()
  return <MarketplaceClient data={data} />
}
