'use client'
import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function SettingsIndexPage(props: PageProps) {
  const { handle } = use(props.params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/@${handle}/settings/profile`)
  }, [handle, router])

  return (
    <div style={{ padding: 24, color: 'var(--color-fg-muted)', fontSize: 14 }}>
      Redirecting...
    </div>
  )
}
