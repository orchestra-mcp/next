import { describe, it, expect } from 'vitest'
import { buildMetadata, buildProfileMetadata, buildJsonLd } from './seo'

describe('buildMetadata', () => {
  it('builds metadata with title and handle', () => {
    const meta = buildMetadata({
      title: 'My API',
      description: 'API docs',
      handle: 'alice',
      type: 'apis',
      slug: 'my-api',
    })
    expect(meta.title).toContain('My API')
    expect(meta.title).toContain('@alice')
    expect(meta.description).toBe('API docs')
  })

  it('sets canonical URL', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: '',
      handle: 'bob',
      type: 'docs',
      slug: 'readme',
    })
    expect(meta.alternates?.canonical).toContain('/@bob/docs/readme')
  })

  it('generates fallback description when empty', () => {
    const meta = buildMetadata({
      title: 'My Doc',
      description: '',
      handle: 'alice',
      type: 'docs',
    })
    expect(meta.description).toContain('My Doc')
    expect(meta.description).toContain('@alice')
  })

  it('sets OpenGraph fields', () => {
    const meta = buildMetadata({
      title: 'Deck',
      description: 'Slide deck',
      handle: 'charlie',
      type: 'slides',
      slug: 'my-deck',
    })
    const og = meta.openGraph as any
    expect(og.title).toContain('Deck')
    expect(og.type).toBe('article')
    expect(og.url).toContain('/@charlie/slides/my-deck')
  })

  it('sets Twitter card', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: 'Desc',
      handle: 'alice',
      type: 'apis',
    })
    expect(meta.twitter?.card).toBe('summary_large_image')
  })

  it('enables indexing', () => {
    const meta = buildMetadata({
      title: 'Test',
      description: '',
      handle: 'alice',
      type: 'docs',
    })
    const robots = meta.robots as any
    expect(robots.index).toBe(true)
    expect(robots.follow).toBe(true)
  })
})

describe('buildProfileMetadata', () => {
  it('builds profile metadata with handle', () => {
    const meta = buildProfileMetadata('alice')
    expect(meta.title).toContain('@alice')
    expect(meta.description).toContain('@alice')
  })

  it('includes name when provided', () => {
    const meta = buildProfileMetadata('alice', 'Alice Smith')
    expect(meta.title).toContain('Alice Smith')
  })

  it('sets profile OG type', () => {
    const meta = buildProfileMetadata('alice')
    const og = meta.openGraph as any
    expect(og.type).toBe('profile')
  })

  it('sets canonical URL', () => {
    const meta = buildProfileMetadata('bob')
    expect(meta.alternates?.canonical).toContain('/@bob')
  })
})

describe('buildJsonLd', () => {
  it('builds APIReference for apis type', () => {
    const ld = buildJsonLd({
      title: 'Payment API',
      description: 'Pay things',
      handle: 'alice',
      type: 'apis',
      slug: 'payment',
    })
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('APIReference')
    expect(ld.name).toBe('Payment API')
    expect(ld.url).toContain('/@alice/apis/payment')
    expect(ld.author?.name).toBe('@alice')
  })

  it('builds TechArticle for docs type', () => {
    const ld = buildJsonLd({
      title: 'My Doc',
      description: 'A doc',
      handle: 'bob',
      type: 'docs',
      slug: 'my-doc',
    })
    expect(ld['@type']).toBe('TechArticle')
  })

  it('builds PresentationDigitalDocument for slides type', () => {
    const ld = buildJsonLd({
      title: 'Deck',
      description: '',
      handle: 'charlie',
      type: 'slides',
      slug: 'deck',
    })
    expect(ld['@type']).toBe('PresentationDigitalDocument')
  })
})
