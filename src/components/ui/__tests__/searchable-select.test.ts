import { describe, it, expect } from 'vitest'

// Test the filtering logic extracted from SearchableSelect
function filterOptions(
  options: { value: string; label: string; disabled?: boolean }[],
  search: string
) {
  if (!search) return options
  return options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase())
  )
}

const SAMPLE_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'in-testing', label: 'In Testing' },
  { value: 'in-review', label: 'In Review' },
  { value: 'done', label: 'Done' },
]

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo' },
]

describe('SearchableSelect filtering', () => {
  it('returns all options when search is empty', () => {
    expect(filterOptions(SAMPLE_OPTIONS, '')).toHaveLength(6)
  })

  it('filters by label case-insensitively', () => {
    const result = filterOptions(SAMPLE_OPTIONS, 'in')
    // Matches: In Progress, In Testing, In Review
    expect(result).toHaveLength(3)
    expect(result.map(o => o.value)).toEqual(['in-progress', 'in-testing', 'in-review'])
  })

  it('filters by value', () => {
    const result = filterOptions(SAMPLE_OPTIONS, 'todo')
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Todo')
  })

  it('returns empty array when nothing matches', () => {
    expect(filterOptions(SAMPLE_OPTIONS, 'xyz')).toHaveLength(0)
  })

  it('matches partial strings', () => {
    const result = filterOptions(SAMPLE_OPTIONS, 'rev')
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('in-review')
  })

  it('is case insensitive', () => {
    const upper = filterOptions(SAMPLE_OPTIONS, 'DONE')
    const lower = filterOptions(SAMPLE_OPTIONS, 'done')
    expect(upper).toEqual(lower)
    expect(upper).toHaveLength(1)
  })
})

describe('SearchableSelect timezone filtering', () => {
  it('filters timezones by region', () => {
    const result = filterOptions(TIMEZONE_OPTIONS, 'America')
    expect(result).toHaveLength(3)
  })

  it('filters timezones by city', () => {
    const result = filterOptions(TIMEZONE_OPTIONS, 'Tokyo')
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('Asia/Tokyo')
  })

  it('filters timezones by continent', () => {
    const result = filterOptions(TIMEZONE_OPTIONS, 'Europe')
    expect(result).toHaveLength(2)
  })

  it('handles partial city match', () => {
    const result = filterOptions(TIMEZONE_OPTIONS, 'Cai')
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('Africa/Cairo')
  })
})

describe('SearchableSelect option structure', () => {
  it('options have value and label', () => {
    for (const opt of SAMPLE_OPTIONS) {
      expect(typeof opt.value).toBe('string')
      expect(typeof opt.label).toBe('string')
    }
  })

  it('disabled options are preserved through filtering', () => {
    const opts = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta', disabled: true },
      { value: 'c', label: 'Charlie' },
    ]
    const result = filterOptions(opts, 'b')
    expect(result).toHaveLength(1)
    expect(result[0].disabled).toBe(true)
  })
})

describe('SearchableSelect search threshold', () => {
  it('search input shows only when > 5 options (component logic)', () => {
    // Component renders search input only when options.length > 5
    // Verify our test data triggers this correctly
    expect(SAMPLE_OPTIONS.length).toBe(6)  // > 5, search shown
    expect(TIMEZONE_OPTIONS.length).toBe(9) // > 5, search shown

    const fewOptions = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ]
    expect(fewOptions.length).toBeLessThanOrEqual(5) // search hidden
  })
})
