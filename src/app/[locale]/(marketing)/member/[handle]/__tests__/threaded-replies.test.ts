import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const detailPage = readFileSync(resolve(__dirname, '../post/[slug]/page.tsx'), 'utf-8')

describe('Threaded replies on post detail page', () => {
  it('has replyingTo state', () => {
    expect(detailPage).toContain('replyingTo')
    expect(detailPage).toContain('setReplyingTo')
  })

  it('has handleReply function calling addComment with parentId', () => {
    expect(detailPage).toContain('async function handleReply')
    expect(detailPage).toContain('addComment(postIdNum, replyText, parentCommentId)')
  })

  it('renders Reply button per comment', () => {
    expect(detailPage).toContain('bx-reply')
    expect(detailPage).toContain('Reply')
  })

  it('renders threaded replies with indent', () => {
    expect(detailPage).toContain('c.replies')
    expect(detailPage).toContain('marginLeft: 42')
  })

  it('has reply input with Enter-to-submit', () => {
    expect(detailPage).toContain('Reply to')
    expect(detailPage).toContain("e.key === 'Enter'")
    expect(detailPage).toContain('handleReply(c.id)')
  })
})
