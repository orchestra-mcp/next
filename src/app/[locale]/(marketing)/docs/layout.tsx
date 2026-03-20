import FeatureGate from '@/components/feature-gate'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="docs">
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {children}
      </div>
    </FeatureGate>
  )
}
