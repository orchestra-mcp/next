import type { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Orchestra handles your data. Our privacy practices, data collection policies, and your rights.',
  openGraph: {
    title: 'Privacy Policy | Orchestra',
    description: 'How Orchestra handles your data. Our privacy practices and your rights.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Orchestra',
    description: 'How Orchestra handles your data. Our privacy practices and your rights.',
  },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
