import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test the sitemap route logic without Next.js runtime
describe('sitemap.xml route', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns stored sitemap from admin settings', async () => {
    const storedSitemap = '<?xml version="1.0"?><urlset><url><loc>https://test.com</loc></url></urlset>'
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: { generated_sitemap: storedSitemap } }),
    })

    const { GET } = await import('../../sitemap.xml/route')
    const response = await GET()
    const text = await response.text()

    expect(text).toBe(storedSitemap)
    expect(response.headers.get('Content-Type')).toBe('application/xml')
    globalThis.fetch = originalFetch
  })

  it('handles flat settings object (no .value wrapper)', async () => {
    const storedSitemap = '<?xml version="1.0"?><urlset><url><loc>https://flat.com</loc></url></urlset>'
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ generated_sitemap: storedSitemap }),
    })

    const { GET } = await import('../../sitemap.xml/route')
    const response = await GET()
    const text = await response.text()

    expect(text).toBe(storedSitemap)
    globalThis.fetch = originalFetch
  })

  it('returns fallback sitemap when API fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'))

    const { GET } = await import('../../sitemap.xml/route')
    const response = await GET()
    const text = await response.text()

    expect(text).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(text).toContain('<urlset')
    expect(text).toContain('<loc>')
    expect(text).toContain('/docs</loc>')
    expect(response.headers.get('Content-Type')).toBe('application/xml')
    globalThis.fetch = originalFetch
  })
})
