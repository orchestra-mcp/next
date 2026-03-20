'use client'

import { useEffect } from 'react'
import { useFeatureFlagsStore } from '@/store/feature-flags'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

const DEFAULT_FALLBACK = (
  <div style={{ padding: '80px 20px', textAlign: 'center' }}>
    <i className="bx bx-lock-alt" style={{ fontSize: 48, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }} />
    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 8 }}>Feature Unavailable</h2>
    <p style={{ fontSize: 14, color: 'var(--color-fg-muted)' }}>This feature is currently disabled.</p>
  </div>
)

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { isEnabled, loaded, fetchFlags } = useFeatureFlagsStore()

  useEffect(() => {
    if (!loaded) fetchFlags()
  }, [loaded, fetchFlags])

  if (!loaded) return null
  if (!isEnabled(feature)) return <>{fallback ?? DEFAULT_FALLBACK}</>
  return <>{children}</>
}
