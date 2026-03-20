import { describe, it, expect } from 'vitest'

// Extracted from page.tsx for testability
interface TocEntry {
  level: number
  text: string
  id: string
}

function extractToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = []
  const lines = markdown.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[#*_`\[\]]/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      entries.push({ level, text, id })
    }
  }
  return entries
}

// Extracted from page.tsx — envelope unwrapping logic
function extractDoc<T extends { title?: string }>(raw: unknown): T | null {
  const data = (raw as { doc?: T }).doc
    || (raw as { data?: T }).data
    || (raw as T)
  if (data && data.title) return data
  return null
}

describe('extractToc', () => {
  it('extracts h2 and h3 headings', () => {
    const md = `# Title\n## Getting Started\n### Installation\n## API Reference`
    const toc = extractToc(md)
    expect(toc).toHaveLength(3)
    expect(toc[0]).toEqual({ level: 2, text: 'Getting Started', id: 'getting-started' })
    expect(toc[1]).toEqual({ level: 3, text: 'Installation', id: 'installation' })
    expect(toc[2]).toEqual({ level: 2, text: 'API Reference', id: 'api-reference' })
  })

  it('ignores h1 and h4+ headings', () => {
    const md = `# H1\n## H2\n### H3\n#### H4`
    const toc = extractToc(md)
    expect(toc).toHaveLength(2)
  })

  it('strips markdown formatting from text', () => {
    const md = `## **Bold** _italic_ \`code\``
    const toc = extractToc(md)
    expect(toc[0].text).toBe('Bold italic code')
  })

  it('generates URL-safe IDs', () => {
    const md = `## Hello World!\n## Special Ch@rs & More`
    const toc = extractToc(md)
    expect(toc[0].id).toBe('hello-world')
    expect(toc[1].id).toBe('special-chrs-more')
  })

  it('returns empty array for no headings', () => {
    expect(extractToc('Just a paragraph')).toEqual([])
    expect(extractToc('')).toEqual([])
  })
})

describe('extractDoc (envelope unwrapping)', () => {
  const mockDoc = { title: 'Test Doc', body: '# Hello', id: '1' }

  it('handles direct response format', () => {
    const result = extractDoc(mockDoc)
    expect(result).toEqual(mockDoc)
  })

  it('handles { doc: ... } envelope', () => {
    const result = extractDoc({ doc: mockDoc })
    expect(result).toEqual(mockDoc)
  })

  it('handles { data: ... } envelope', () => {
    const result = extractDoc({ data: mockDoc })
    expect(result).toEqual(mockDoc)
  })

  it('returns null when no title present', () => {
    const result = extractDoc({ body: 'no title' })
    expect(result).toBeNull()
  })

  it('returns null for empty object', () => {
    const result = extractDoc({})
    expect(result).toBeNull()
  })
})
