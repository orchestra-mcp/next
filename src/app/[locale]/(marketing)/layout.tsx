'use client'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { useThemeStore } from '@/store/theme'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: isDark ? '#0f0f12' : '#f5f5f7' }}>
      <MarketingNav />
      <main style={{ flex: 1 }}>{children}</main>
      <MarketingFooter />
    </div>
  )
}
