import { describe, it, expect } from 'vitest'

// Unit-test the pure logic of SponsorsPanel: add, remove, update, reorder, max limit.
// These mirror the component's state management functions.

interface Sponsor {
  name: string
  logo_url: string
  url: string
  order: number
}

function addSponsor(sponsors: Sponsor[]): Sponsor[] {
  if (sponsors.length >= 10) return sponsors
  return [...sponsors, { name: '', logo_url: '', url: '', order: sponsors.length }]
}

function removeSponsor(sponsors: Sponsor[], idx: number): Sponsor[] {
  return sponsors.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }))
}

function updateSponsor(sponsors: Sponsor[], idx: number, field: keyof Sponsor, value: string): Sponsor[] {
  return sponsors.map((s, i) => i === idx ? { ...s, [field]: value } : s)
}

function moveSponsor(sponsors: Sponsor[], idx: number, direction: 'up' | 'down'): Sponsor[] {
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= sponsors.length) return sponsors
  const next = [...sponsors]
  ;[next[idx], next[target]] = [next[target], next[idx]]
  return next.map((s, i) => ({ ...s, order: i }))
}

function filterForSave(sponsors: Sponsor[]): Sponsor[] {
  return sponsors.filter(s => s.name.trim())
}

describe('SponsorsPanel logic', () => {
  describe('addSponsor', () => {
    it('adds a new empty sponsor with correct order', () => {
      const result = addSponsor([])
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ name: '', logo_url: '', url: '', order: 0 })
    })

    it('increments order for each new sponsor', () => {
      let sponsors: Sponsor[] = []
      sponsors = addSponsor(sponsors)
      sponsors = addSponsor(sponsors)
      sponsors = addSponsor(sponsors)
      expect(sponsors).toHaveLength(3)
      expect(sponsors[2].order).toBe(2)
    })

    it('enforces max 10 sponsors', () => {
      const sponsors = Array.from({ length: 10 }, (_, i) => ({
        name: `Sponsor ${i}`, logo_url: '', url: '', order: i,
      }))
      const result = addSponsor(sponsors)
      expect(result).toHaveLength(10)
    })
  })

  describe('removeSponsor', () => {
    it('removes sponsor at given index', () => {
      const sponsors = [
        { name: 'A', logo_url: '', url: '', order: 0 },
        { name: 'B', logo_url: '', url: '', order: 1 },
        { name: 'C', logo_url: '', url: '', order: 2 },
      ]
      const result = removeSponsor(sponsors, 1)
      expect(result).toHaveLength(2)
      expect(result.map(s => s.name)).toEqual(['A', 'C'])
    })

    it('re-indexes order after removal', () => {
      const sponsors = [
        { name: 'A', logo_url: '', url: '', order: 0 },
        { name: 'B', logo_url: '', url: '', order: 1 },
        { name: 'C', logo_url: '', url: '', order: 2 },
      ]
      const result = removeSponsor(sponsors, 0)
      expect(result[0].order).toBe(0)
      expect(result[1].order).toBe(1)
    })
  })

  describe('updateSponsor', () => {
    it('updates a specific field at index', () => {
      const sponsors = [{ name: '', logo_url: '', url: '', order: 0 }]
      const result = updateSponsor(sponsors, 0, 'name', 'Acme Corp')
      expect(result[0].name).toBe('Acme Corp')
      expect(result[0].logo_url).toBe('')
    })

    it('does not modify other sponsors', () => {
      const sponsors = [
        { name: 'A', logo_url: '', url: '', order: 0 },
        { name: 'B', logo_url: '', url: '', order: 1 },
      ]
      const result = updateSponsor(sponsors, 1, 'url', 'https://b.com')
      expect(result[0].name).toBe('A')
      expect(result[1].url).toBe('https://b.com')
    })
  })

  describe('moveSponsor', () => {
    const sponsors: Sponsor[] = [
      { name: 'A', logo_url: '', url: '', order: 0 },
      { name: 'B', logo_url: '', url: '', order: 1 },
      { name: 'C', logo_url: '', url: '', order: 2 },
    ]

    it('moves a sponsor up by swapping with previous', () => {
      const result = moveSponsor(sponsors, 1, 'up')
      expect(result.map(s => s.name)).toEqual(['B', 'A', 'C'])
      expect(result.map(s => s.order)).toEqual([0, 1, 2])
    })

    it('moves a sponsor down by swapping with next', () => {
      const result = moveSponsor(sponsors, 0, 'down')
      expect(result.map(s => s.name)).toEqual(['B', 'A', 'C'])
      expect(result.map(s => s.order)).toEqual([0, 1, 2])
    })

    it('does nothing when moving first item up', () => {
      const result = moveSponsor(sponsors, 0, 'up')
      expect(result.map(s => s.name)).toEqual(['A', 'B', 'C'])
    })

    it('does nothing when moving last item down', () => {
      const result = moveSponsor(sponsors, 2, 'down')
      expect(result.map(s => s.name)).toEqual(['A', 'B', 'C'])
    })
  })

  describe('filterForSave', () => {
    it('removes sponsors with empty names', () => {
      const sponsors = [
        { name: 'Acme', logo_url: '', url: '', order: 0 },
        { name: '', logo_url: '', url: '', order: 1 },
        { name: '  ', logo_url: '', url: '', order: 2 },
        { name: 'Beta', logo_url: '', url: '', order: 3 },
      ]
      const result = filterForSave(sponsors)
      expect(result).toHaveLength(2)
      expect(result.map(s => s.name)).toEqual(['Acme', 'Beta'])
    })
  })
})
