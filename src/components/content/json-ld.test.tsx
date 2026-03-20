import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { JsonLd } from './json-ld'

describe('JsonLd', () => {
  it('renders script tag with application/ld+json type', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Article', name: 'Test' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
  })

  it('contains serialized JSON data', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Article', name: 'My Article' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const parsed = JSON.parse(script?.textContent || '{}')
    expect(parsed['@type']).toBe('Article')
    expect(parsed.name).toBe('My Article')
  })
})
