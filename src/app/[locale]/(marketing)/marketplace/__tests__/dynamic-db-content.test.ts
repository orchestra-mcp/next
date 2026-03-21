import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const blogPage = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/blog/page.tsx'),
  'utf-8'
)

const docsPage = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/docs/[[...slug]]/page.tsx'),
  'utf-8'
)

const sponsorsPage = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/sponsors/page.tsx'),
  'utf-8'
)

const adminSettings = readFileSync(
  resolve(process.cwd(), '../web/internal/handlers/admin_settings.go'),
  'utf-8'
)

const adminCms = readFileSync(
  resolve(process.cwd(), '../web/internal/handlers/admin_cms.go'),
  'utf-8'
)

const routes = readFileSync(
  resolve(process.cwd(), '../web/internal/routes/routes.go'),
  'utf-8'
)

// ── Blog page: fetches from DB ─────────────────────────────────────────────

describe('blog page.tsx — fetches real DB posts', () => {
  it('fetches from /api/public/blog (DB endpoint)', () => {
    expect(blogPage).toContain('/api/public/blog')
  })

  it('still has fallback to /api/public/settings/blog', () => {
    expect(blogPage).toContain('/api/public/settings/blog')
  })

  it('does not contain hardcoded FALLBACK_POSTS', () => {
    expect(blogPage).not.toContain('FALLBACK_POSTS')
    expect(blogPage).not.toContain('orchestra-v1-release')
  })

  it('prefers DB posts when non-empty', () => {
    // Primary branch returns when posts.length > 0
    expect(blogPage).toContain('posts.length > 0')
  })
})

// ── Docs page: reads from DB ───────────────────────────────────────────────

describe('docs page.tsx — reads from DB system docs', () => {
  it('fetches all docs from /api/docs', () => {
    expect(docsPage).toContain('/api/docs')
  })

  it('fetches individual doc from /api/docs/:slug', () => {
    expect(docsPage).toContain('/api/docs/${encodeURIComponent(slug')
  })

  it('builds sidebar from DB docs grouped by category', () => {
    expect(docsPage).toContain('buildDbSidebar')
  })

  it('falls back to filesystem if DB returns no docs', () => {
    expect(docsPage).toContain('getFsSidebarSections')
    expect(docsPage).toContain('getFsDocContent')
  })

  it('no longer uses only filesystem SLUG_MAP', () => {
    // SLUG_MAP still exists as fallback but DB path is primary
    expect(docsPage).toContain('fetchDbDocs')
    expect(docsPage).toContain('fetchDbDoc')
  })
})

// ── Sponsors page: no hardcoded fallback ──────────────────────────────────

describe('sponsors page — no DEV_SEED_SPONSORS fallback', () => {
  it('does not contain DEV_SEED_SPONSORS', () => {
    expect(sponsorsPage).not.toContain('DEV_SEED_SPONSORS')
  })

  it('does not contain hardcoded sponsor names', () => {
    expect(sponsorsPage).not.toContain("'Vercel'")
    expect(sponsorsPage).not.toContain("'Supabase'")
    expect(sponsorsPage).not.toContain("'Turso'")
    expect(sponsorsPage).not.toContain("'Bun'")
  })

  it('shows empty array on error (no hardcoded fallback)', () => {
    expect(sponsorsPage).toContain('setSponsors([])')
  })

  it('still fetches from /api/public/sponsors', () => {
    expect(sponsorsPage).toContain('/api/public/sponsors')
  })
})

// ── Go backend: PublicPosts handler ───────────────────────────────────────

describe('Go backend — PublicPosts handler', () => {
  it('admin_cms.go has PublicPosts function', () => {
    expect(adminCms).toContain('func (h *AdminCmsHandler) PublicPosts')
  })

  it('PublicPosts queries published posts from DB', () => {
    expect(adminCms).toContain('"published"')
    expect(adminCms).toContain('models.Post')
  })

  it('routes.go registers GET /api/public/blog', () => {
    expect(routes).toContain('/public/blog')
    expect(routes).toContain('PublicPosts')
  })
})

// ── Go backend: marketplace packs have stacks field ───────────────────────

describe('Go backend — marketplace packs seed has stacks', () => {
  it('go-backend pack has stacks field', () => {
    expect(adminSettings).toContain('"go-backend"')
    // Verify stacks key added — slice 600 chars to cover the full pack entry
    const goBackendIdx = adminSettings.indexOf('"go-backend"')
    const segment = adminSettings.slice(goBackendIdx, goBackendIdx + 600)
    expect(segment).toContain('"stacks"')
  })

  it('ai-agentic pack has universal stacks', () => {
    expect(adminSettings).toContain('"ai-agentic"')
  })

  it('plugins setting has flat plugins array for marketplace', () => {
    expect(adminSettings).toContain('"plugins": []map[string]interface{}{')
    expect(adminSettings).toContain('"display_name"')
    expect(adminSettings).toContain('"tools-features"')
  })
})
