import type { Metadata } from 'next'

const SITE_NAME = 'Orchestra'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://orchestra.dev'

interface ContentMeta {
  title: string
  description: string
  handle: string
  type: string
  slug?: string
  image?: string
}

export function buildMetadata(content: ContentMeta): Metadata {
  const fullTitle = `${content.title} | @${content.handle} | ${SITE_NAME}`
  const path = content.slug
    ? `/@${content.handle}/${content.type}/${content.slug}`
    : `/@${content.handle}/${content.type}`
  const url = `${BASE_URL}${path}`

  return {
    title: fullTitle,
    description: content.description || `${content.title} by @${content.handle} on ${SITE_NAME}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: content.description || `${content.title} by @${content.handle}`,
      url,
      siteName: SITE_NAME,
      type: 'article',
      images: content.image ? [{ url: content.image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description || `${content.title} by @${content.handle}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function buildProfileMetadata(handle: string, name?: string): Metadata {
  const title = name ? `${name} (@${handle})` : `@${handle}`
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${BASE_URL}/@${handle}`

  return {
    title: fullTitle,
    description: `View ${title}'s public APIs, documentation, and presentations on ${SITE_NAME}.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: `View ${title}'s public content on ${SITE_NAME}`,
      url,
      siteName: SITE_NAME,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export interface JsonLdBase {
  '@context': string
  '@type': string
  name: string
  description?: string
  url?: string
  author?: {
    '@type': string
    name: string
    url?: string
  }
}

export function buildJsonLd(content: ContentMeta): JsonLdBase {
  const path = content.slug
    ? `/@${content.handle}/${content.type}/${content.slug}`
    : `/@${content.handle}/${content.type}`

  return {
    '@context': 'https://schema.org',
    '@type': content.type === 'apis' ? 'APIReference' : content.type === 'slides' ? 'PresentationDigitalDocument' : 'TechArticle',
    name: content.title,
    description: content.description,
    url: `${BASE_URL}${path}`,
    author: {
      '@type': 'Person',
      name: `@${content.handle}`,
      url: `${BASE_URL}/@${content.handle}`,
    },
  }
}
