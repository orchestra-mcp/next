import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve, join } from 'path'

const docsRoot = resolve(process.cwd(), '../../docs')

describe('Marketplace approval docs', () => {
  it('wallet-badges-verification.md contains marketplace_submissions schema', () => {
    const content = readFileSync(join(docsRoot, 'wallet-badges-verification.md'), 'utf-8')
    expect(content).toContain('marketplace_submissions')
    expect(content).toContain('CREATE TABLE marketplace_submissions')
    expect(content).toContain('idx_marketplace_submissions_status')
  })

  it('flutter-admin-implementation.md contains marketplace approval screen', () => {
    const content = readFileSync(join(docsRoot, 'flutter-admin-implementation.md'), 'utf-8')
    expect(content).toContain('Marketplace Approval Screen')
    expect(content).toContain('MarketplaceSubmission')
    expect(content).toContain('/api/admin/marketplace/pending')
  })
})
