import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://orchestra.3x1.io'

async function saveToDisk(xml: string) {
  try {
    const publicDir = join(process.cwd(), 'public')
    await writeFile(join(publicDir, 'sitemap.xml'), xml, 'utf-8')
  } catch {}
}

export async function GET() {
  // 1. Try to fetch generated sitemap from admin SEO settings
  try {
    const res = await fetch(`${API_URL}/api/public/settings/seo`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const data = await res.json()
      const sitemap = data?.value?.generated_sitemap || data?.generated_sitemap
      if (sitemap) {
        await saveToDisk(sitemap)
        return new NextResponse(sitemap, {
          headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
        })
      }
    }
  } catch {}

  // 2. Build a dynamic sitemap from available data
  const urls: string[] = [
    `<url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${BASE_URL}/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    `<url><loc>${BASE_URL}/community</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
    `<url><loc>${BASE_URL}/pricing</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `<url><loc>${BASE_URL}/download</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `<url><loc>${BASE_URL}/blog</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
  ]

  // Fetch blog posts
  try {
    const res = await fetch(`${API_URL}/api/public/posts`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      for (const post of data?.posts ?? []) {
        if (post.slug) urls.push(`<url><loc>${BASE_URL}/blog/${post.slug}</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`)
      }
    }
  } catch {}

  // Fetch community members
  try {
    const res = await fetch(`${API_URL}/api/public/community/members?page=1`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      for (const m of data?.members ?? []) {
        if (m.handle) urls.push(`<url><loc>${BASE_URL}/@${m.handle}</loc><changefreq>weekly</changefreq><priority>0.4</priority></url>`)
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  await saveToDisk(xml)

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  })
}
