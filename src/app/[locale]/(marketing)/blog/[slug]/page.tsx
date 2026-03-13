import type { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'
import { posts } from './posts'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = posts[slug]
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.content[0]?.slice(0, 160) || '',
    openGraph: {
      title: `${post.title} | Orchestra Blog`,
      description: post.content[0]?.slice(0, 160) || '',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.tag],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content[0]?.slice(0, 160) || '',
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  return <BlogPostClient slug={slug} />
}
