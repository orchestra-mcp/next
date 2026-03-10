import DownloadClient from './DownloadClient'

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
  return <DownloadClient data={data} />
}
