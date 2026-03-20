import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pagePath = resolve(__dirname, '../post/[slug]/page.tsx')

describe('Post detail page', () => {
  const content = readFileSync(pagePath, 'utf-8')

  it('imports PostEmbed component', () => {
    expect(content).toContain("import PostEmbed from '@/components/profile/post-embed'")
  })

  it('has POST_TYPE_STYLES with skill, agent, workflow', () => {
    expect(content).toContain('POST_TYPE_STYLES')
    expect(content).toContain("skill:")
    expect(content).toContain("agent:")
    expect(content).toContain("workflow:")
  })

  it('renders type badge from post tags', () => {
    expect(content).toContain('getPostType')
    expect(content).toContain('.label')
  })

  it('applies colored border based on post type', () => {
    expect(content).toContain('borderLeft')
  })

  it('extracts and renders media embeds from content URLs', () => {
    expect(content).toContain('extractUrls')
    expect(content).toContain('<PostEmbed')
  })

  it('has comments section with form', () => {
    expect(content).toContain('Comments')
    expect(content).toContain('handleAddComment')
    expect(content).toContain('Write a comment')
  })

  it('has related posts section', () => {
    expect(content).toContain('Related Posts')
    expect(content).toContain('relatedPosts')
  })

  it('has like button', () => {
    expect(content).toContain('likePost')
    expect(content).toContain('bx-heart')
  })
})
