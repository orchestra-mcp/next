'use client'
import { useEffect } from 'react'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { useFeatureFlagsStore } from '@/store/feature-flags'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { loaded, fetchFlags } = useFeatureFlagsStore()
  useEffect(() => { if (!loaded) fetchFlags() }, [loaded, fetchFlags])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg, #0f0f12)', color: 'var(--color-fg, #f8f8f8)' }}>
      <MarketingNav />
      <main style={{ flex: 1 }}>{children}</main>
      <MarketingFooter />
    </div>
  )
}
