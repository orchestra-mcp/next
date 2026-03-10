import LandingClient from './LandingClient'

async function getLandingData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const [homepageRes, pricingRes, blogRes] = await Promise.all([
      fetch(`${apiBase}/api/public/settings/homepage`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/api/public/settings/pricing`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/api/public/settings/blog`, { next: { revalidate: 60 } }),
    ])
    const homepage = homepageRes.ok ? (await homepageRes.json())?.value ?? {} : {}
    const pricing = pricingRes.ok ? (await pricingRes.json())?.value ?? {} : {}
    const blog = blogRes.ok ? (await blogRes.json())?.value ?? {} : {}
    return { homepage, pricing, blog }
  } catch {}
  return { homepage: {}, pricing: {}, blog: {} }
}

export default async function LandingPage() {
  const data = await getLandingData()
  return <LandingClient data={data} />
}
