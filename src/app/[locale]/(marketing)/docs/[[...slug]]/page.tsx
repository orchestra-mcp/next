import DocsClient from './DocsClient'

async function getDocsData() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/public/settings/docs`, {
      next: { revalidate: 60 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function DocsPage({ params }: PageProps) {
  const [data, resolvedParams] = await Promise.all([getDocsData(), params])
  return <DocsClient data={data} slug={resolvedParams.slug} />
}
