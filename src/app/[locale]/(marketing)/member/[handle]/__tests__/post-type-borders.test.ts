import { describe, it, expect } from 'vitest'

// Unit-test the pure logic extracted from page.tsx: POST_TYPE_STYLES mapping
// and getPostTypeFromTags / getPostTypeBorderStyle functions.

const POST_TYPE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  skill: { color: '#00e5ff', bg: 'rgba(0,229,255,0.1)', label: 'Skill' },
  agent: { color: '#a900ff', bg: 'rgba(169,0,255,0.1)', label: 'Agent' },
  workflow: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Workflow' },
}

function getPostTypeFromTags(tags: string[]): string | null {
  if (tags.includes('workflow')) return 'workflow'
  if (tags.includes('agent')) return 'agent'
  if (tags.includes('skill')) return 'skill'
  return null
}

function getPostTypeBorderStyle(tags: string[]): React.CSSProperties {
  const type = getPostTypeFromTags(tags)
  if (!type || !POST_TYPE_STYLES[type]) return {}
  return { borderLeft: `3px solid ${POST_TYPE_STYLES[type].color}` }
}

describe('getPostTypeFromTags', () => {
  it('returns skill for skill tag', () => {
    expect(getPostTypeFromTags(['skill'])).toBe('skill')
  })

  it('returns agent for agent tag', () => {
    expect(getPostTypeFromTags(['agent'])).toBe('agent')
  })

  it('returns workflow for workflow tag', () => {
    expect(getPostTypeFromTags(['workflow'])).toBe('workflow')
  })

  it('returns null for empty tags', () => {
    expect(getPostTypeFromTags([])).toBeNull()
  })

  it('returns null for unrelated tags', () => {
    expect(getPostTypeFromTags(['general', 'announcement'])).toBeNull()
  })

  it('prioritizes workflow over agent and skill', () => {
    expect(getPostTypeFromTags(['skill', 'agent', 'workflow'])).toBe('workflow')
  })

  it('prioritizes agent over skill', () => {
    expect(getPostTypeFromTags(['skill', 'agent'])).toBe('agent')
  })
})

describe('getPostTypeBorderStyle', () => {
  it('returns cyan left border for skill posts', () => {
    const style = getPostTypeBorderStyle(['skill'])
    expect(style).toEqual({ borderLeft: '3px solid #00e5ff' })
  })

  it('returns purple left border for agent posts', () => {
    const style = getPostTypeBorderStyle(['agent'])
    expect(style).toEqual({ borderLeft: '3px solid #a900ff' })
  })

  it('returns green left border for workflow posts', () => {
    const style = getPostTypeBorderStyle(['workflow'])
    expect(style).toEqual({ borderLeft: '3px solid #22c55e' })
  })

  it('returns empty object for posts without type tags', () => {
    const style = getPostTypeBorderStyle([])
    expect(style).toEqual({})
  })

  it('returns empty object for posts with unrecognized tags', () => {
    const style = getPostTypeBorderStyle(['general'])
    expect(style).toEqual({})
  })
})

describe('POST_TYPE_STYLES', () => {
  it('defines 3 types: skill, agent, workflow', () => {
    expect(Object.keys(POST_TYPE_STYLES)).toEqual(['skill', 'agent', 'workflow'])
  })

  it('each type has color, bg, and label', () => {
    for (const style of Object.values(POST_TYPE_STYLES)) {
      expect(style).toHaveProperty('color')
      expect(style).toHaveProperty('bg')
      expect(style).toHaveProperty('label')
      expect(style.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
