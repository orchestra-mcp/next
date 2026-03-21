import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const marketplacePage = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/marketplace/page.tsx'),
  'utf-8'
)

const marketplaceClient = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/marketplace/MarketplaceClient.tsx'),
  'utf-8'
)

const blogClient = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/blog/BlogClient.tsx'),
  'utf-8'
)

const enMessages = readFileSync(resolve(process.cwd(), 'src/messages/en.json'), 'utf-8')
const arMessages = readFileSync(resolve(process.cwd(), 'src/messages/ar.json'), 'utf-8')

// ── page.tsx: fetches from API ────────────────────────────────────────────────

describe('marketplace page.tsx — dynamic data fetching', () => {
  it('fetches plugins setting from API', () => {
    expect(marketplacePage).toContain("fetchSetting('plugins')")
  })

  it('fetches community setting from API', () => {
    expect(marketplacePage).toContain("fetchSetting('community')")
  })

  it('fetches marketplace setting from API', () => {
    expect(marketplacePage).toContain("fetchSetting('marketplace')")
  })

  it('passes plugins array to client', () => {
    expect(marketplacePage).toContain('plugins.plugins')
  })

  it('passes community_items to client', () => {
    expect(marketplacePage).toContain('community_items')
  })

  it('passes total_plugins and total_tools to client', () => {
    expect(marketplacePage).toContain('total_plugins')
    expect(marketplacePage).toContain('total_tools')
  })
})

// ── MarketplaceClient.tsx: no hardcoded data ──────────────────────────────────

describe('MarketplaceClient.tsx — no hardcoded static arrays', () => {
  it('does not contain ALL_PLUGINS hardcoded array', () => {
    expect(marketplaceClient).not.toContain('ALL_PLUGINS')
  })

  it('does not contain ALL_PACKS hardcoded array', () => {
    expect(marketplaceClient).not.toContain('ALL_PACKS')
  })

  it('does not contain SAMPLE_COMMUNITY hardcoded array', () => {
    expect(marketplaceClient).not.toContain('SAMPLE_COMMUNITY')
  })

  it('does not contain hardcoded fake author names', () => {
    expect(marketplaceClient).not.toContain('Sarah Chen')
    expect(marketplaceClient).not.toContain('Marco Rossi')
    expect(marketplaceClient).not.toContain('Aisha Patel')
  })

  it('reads plugins from data prop', () => {
    expect(marketplaceClient).toContain('data.plugins')
  })

  it('reads packs from data prop', () => {
    expect(marketplaceClient).toContain('data.packs')
  })

  it('reads community_items from data prop', () => {
    expect(marketplaceClient).toContain('data.community_items')
  })

  it('reads total_plugins from data prop', () => {
    expect(marketplaceClient).toContain('data.total_plugins')
  })

  it('reads total_tools from data prop', () => {
    expect(marketplaceClient).toContain('data.total_tools')
  })

  it('shows empty state for plugins when empty', () => {
    expect(marketplaceClient).toContain('plugins.length === 0')
  })

  it('shows empty state for packs when empty', () => {
    expect(marketplaceClient).toContain('filteredPacks.length === 0')
  })

  it('shows empty state for community items when empty', () => {
    expect(marketplaceClient).toContain('communityItems.length === 0')
  })

  it('MarketplaceData interface includes plugins and community_items', () => {
    expect(marketplaceClient).toContain('plugins?: Plugin[]')
    expect(marketplaceClient).toContain('community_items?: SharedItem[]')
  })
})

// ── BlogClient.tsx: no hardcoded fallback posts ───────────────────────────────

describe('BlogClient.tsx — no hardcoded fallback posts', () => {
  it('does not contain FALLBACK_POSTS', () => {
    expect(blogClient).not.toContain('FALLBACK_POSTS')
  })

  it('does not contain hardcoded blog post slugs', () => {
    expect(blogClient).not.toContain('orchestra-v1-release')
    expect(blogClient).not.toContain('in-process-architecture')
    expect(blogClient).not.toContain('rag-memory-engine')
  })

  it('reads posts from data prop (empty array default)', () => {
    expect(blogClient).toContain('data.posts ?? []')
  })

  it('uses blog.noPosts i18n key for empty state', () => {
    expect(blogClient).toContain("t('blog.noPosts')")
  })
})

// ── i18n messages: blog.noPosts key exists ────────────────────────────────────

describe('i18n messages — blog.noPosts key', () => {
  it('en.json contains blog.noPosts', () => {
    const en = JSON.parse(enMessages)
    expect(en.blog?.noPosts).toBeDefined()
    expect(typeof en.blog.noPosts).toBe('string')
    expect(en.blog.noPosts.length).toBeGreaterThan(0)
  })

  it('ar.json contains blog.noPosts', () => {
    const ar = JSON.parse(arMessages)
    expect(ar.blog?.noPosts).toBeDefined()
    expect(typeof ar.blog.noPosts).toBe('string')
    expect(ar.blog.noPosts.length).toBeGreaterThan(0)
  })
})
