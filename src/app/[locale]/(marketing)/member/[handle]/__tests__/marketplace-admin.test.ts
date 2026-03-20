import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Marketplace admin approval system', () => {
  it('Go admin_marketplace handler exists', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/admin_marketplace.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('ListPending')
    expect(content).toContain('Approve')
    expect(content).toContain('Reject')
    expect(content).toContain('marketplace_approved')
    expect(content).toContain('marketplace_rejected')
  })

  it('CommunityPost model has Tags field', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/models/community_post.go')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('Tags')
    expect(content).toContain('json:"tags"')
  })

  it('Flutter marketplace page has Pending tab', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/screens/web/admin/marketplace_page.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('_PendingTab')
    expect(content).toContain('Pending')
    expect(content).toContain('approveMarketplaceItem')
    expect(content).toContain('rejectMarketplaceItem')
  })

  it('API client has marketplace admin methods', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/core/api/api_client.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('listPendingMarketplace')
    expect(content).toContain('approveMarketplaceItem')
    expect(content).toContain('rejectMarketplaceItem')
  })
})
