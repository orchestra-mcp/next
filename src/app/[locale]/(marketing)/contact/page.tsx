import type { Metadata } from 'next'
import ContactClient from './ContactClient'
import FeatureGate from '@/components/feature-gate'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Orchestra team. Questions, partnerships, or feedback.',
  openGraph: {
    title: 'Contact | Orchestra',
    description: 'Get in touch with the Orchestra team.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Orchestra',
    description: 'Get in touch with the Orchestra team.',
  },
}

export default function ContactPage() {
  return (
    <FeatureGate feature="contact">
      <ContactClient />
    </FeatureGate>
  )
}
