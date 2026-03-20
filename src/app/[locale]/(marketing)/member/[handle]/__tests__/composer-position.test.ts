import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pagePath = resolve(__dirname, '../page.tsx')

describe('Post composer position', () => {
  const content = readFileSync(pagePath, 'utf-8')

  it('composer card appears before post cards in the JSX', () => {
    const composerIdx = content.indexOf('Composer Card')
    const postCardsIdx = content.indexOf('Post Cards')
    expect(composerIdx).toBeGreaterThan(-1)
    expect(postCardsIdx).toBeGreaterThan(-1)
    expect(composerIdx).toBeLessThan(postCardsIdx)
  })

  it('collapsed composer shows avatar and input prompt', () => {
    expect(content).toContain('What are you thinking about?')
    expect(content).toContain('rounded-full')
    expect(content).toContain('avatar_url')
  })

  it('collapsed composer shows media type icons', () => {
    expect(content).toContain('bx-image')
    expect(content).toContain('bx-video')
    expect(content).toContain('bx-link')
  })
})
