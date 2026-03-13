import type { Metadata } from 'next'
import TermsClient from './TermsClient'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Orchestra MCP. Usage policies, licensing, and legal information.',
  openGraph: {
    title: 'Terms of Service | Orchestra',
    description: 'Terms and conditions for using Orchestra MCP.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Orchestra',
    description: 'Terms and conditions for using Orchestra MCP.',
  },
}

export default function TermsPage() {
  return <TermsClient />
}
