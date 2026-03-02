import BlogClient from './BlogClient'

async function getBlogData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/settings/blog`, {
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
  return <BlogClient data={data} />
}
