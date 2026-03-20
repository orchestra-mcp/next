import type { Metadata } from 'next'
import LandingClient from './LandingClient'

async function getSeoData(): Promise<Record<string, string>> {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/homepage`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = (await res.json())?.value ?? {}
      return {
        title: data.seo_title ?? '',
        description: data.seo_description ?? '',
        og_title: data.og_title ?? '',
        og_description: data.og_description ?? '',
      }
    }
  } catch {}
  return {}
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoData()
  const title = seo.title || 'The AI-Agentic IDE Framework'
  const description = seo.description || '300+ MCP tools. 9 IDEs. Every platform. Build, test, deploy, and orchestrate AI-powered development with Orchestra.'

  return {
    title,
    description,
    openGraph: {
      title: seo.og_title || `${title} | Orchestra`,
      description: seo.og_description || description,
      type: 'website',
      siteName: 'Orchestra',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.og_title || `${title} | Orchestra`,
      description: seo.og_description || description,
    },
  }
}

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
