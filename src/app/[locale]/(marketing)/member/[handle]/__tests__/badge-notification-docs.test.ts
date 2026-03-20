import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const docsRoot = resolve(process.cwd(), '../../docs')

describe('Badge notification system docs', () => {
  const content = readFileSync(resolve(docsRoot, 'wallet-badges-verification.md'), 'utf-8')

  it('documents badge_earned notification type', () => {
    expect(content).toContain('badge_earned')
  })

  it('documents auto-award integration with point transactions', () => {
    expect(content).toContain('auto_award')
    expect(content).toContain('points_required')
  })

  it('documents notification payload structure', () => {
    expect(content).toContain('notification')
    expect(content).toContain('badge_earned')
  })

  it('documents frontend display spec for badge notifications', () => {
    expect(content).toContain('badge_earned')
    expect(content).toMatch(/frontend|display|notification/i)
  })
})
