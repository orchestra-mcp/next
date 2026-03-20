import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pagePath = resolve(__dirname, '../page.tsx')

describe('Inline comments on profile posts', () => {
  const content = readFileSync(pagePath, 'utf-8')

  it('has expandedComments state', () => {
    expect(content).toContain('expandedComments')
    expect(content).toContain('setExpandedComments')
  })

  it('has inlineComments cache', () => {
    expect(content).toContain('inlineComments')
    expect(content).toContain('setInlineComments')
  })

  it('has toggleComments function that fetches on expand', () => {
    expect(content).toContain('async function toggleComments')
    expect(content).toContain('/api/public/community/posts/')
    expect(content).toContain('/comments')
  })

  it('has submitInlineComment function', () => {
    expect(content).toContain('async function submitInlineComment')
    expect(content).toContain('addComment')
  })

  it('shows comment toggle button with count', () => {
    expect(content).toContain('toggleComments(post.id)')
    expect(content).toContain('bx-comment')
  })

  it('renders inline comments with avatars', () => {
    expect(content).toContain('inlineComments[post.id]')
    expect(content).toContain('user_avatar')
    expect(content).toContain('user_name')
  })

  it('has compact comment input with Enter submit', () => {
    expect(content).toContain('Write a comment...')
    expect(content).toContain("e.key === 'Enter'")
    expect(content).toContain('submitInlineComment(post.id)')
  })

  it('shows View all link when more than 3 comments', () => {
    expect(content).toContain('View all')
    expect(content).toContain('.length > 3')
  })
})
