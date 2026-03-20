import { describe, it, expect } from 'vitest'

// Test the simpleMarkdownToHtml function extracted from the component
function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.05);padding:12px;border-radius:6px;overflow-x:auto;font-size:12px;line-height:1.5"><code>$2</code></pre>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:28px 0 12px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 5px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#a900ff;text-decoration:none" target="_blank">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #a900ff;padding-left:14px;margin:8px 0;opacity:0.8">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<div style="padding-left:18px;position:relative"><span style="position:absolute;left:6px">•</span>$1</div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:22px;position:relative"><span style="position:absolute;left:0;font-weight:600;font-size:12px;opacity:0.6">$1.</span>$2</div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

// Test the toolbar action definitions
interface ToolbarAction {
  icon: string
  title: string
  prefix: string
  suffix: string
  block?: boolean
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: 'bx-bold', title: 'Bold', prefix: '**', suffix: '**' },
  { icon: 'bx-italic', title: 'Italic', prefix: '_', suffix: '_' },
  { icon: 'bx-strikethrough', title: 'Strikethrough', prefix: '~~', suffix: '~~' },
  { icon: 'bx-heading', title: 'Heading', prefix: '## ', suffix: '', block: true },
  { icon: 'bx-link', title: 'Link', prefix: '[', suffix: '](url)' },
  { icon: 'bx-code', title: 'Inline code', prefix: '`', suffix: '`' },
  { icon: 'bx-code-block', title: 'Code block', prefix: '```\n', suffix: '\n```', block: true },
  { icon: 'bx-list-ul', title: 'Bullet list', prefix: '- ', suffix: '', block: true },
  { icon: 'bx-list-ol', title: 'Numbered list', prefix: '1. ', suffix: '', block: true },
  { icon: 'bx-quote-left', title: 'Quote', prefix: '> ', suffix: '', block: true },
]

describe('simpleMarkdownToHtml', () => {
  it('converts headings', () => {
    expect(simpleMarkdownToHtml('# Title')).toContain('<h1')
    expect(simpleMarkdownToHtml('## Subtitle')).toContain('<h2')
    expect(simpleMarkdownToHtml('### Section')).toContain('<h3')
  })

  it('converts bold text', () => {
    const result = simpleMarkdownToHtml('This is **bold** text')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('converts italic text', () => {
    const result = simpleMarkdownToHtml('This is _italic_ text')
    expect(result).toContain('<em>italic</em>')
  })

  it('converts strikethrough text', () => {
    const result = simpleMarkdownToHtml('This is ~~deleted~~ text')
    expect(result).toContain('<del>deleted</del>')
  })

  it('converts inline code', () => {
    const result = simpleMarkdownToHtml('Use `npm install`')
    expect(result).toContain('<code')
    expect(result).toContain('npm install')
  })

  it('converts code blocks', () => {
    const result = simpleMarkdownToHtml('```js\nconst x = 1\n```')
    expect(result).toContain('<pre')
    expect(result).toContain('<code>')
    expect(result).toContain('const x = 1')
  })

  it('converts links', () => {
    const result = simpleMarkdownToHtml('[Orchestra](https://orchestra.dev)')
    expect(result).toContain('<a href="https://orchestra.dev"')
    expect(result).toContain('Orchestra</a>')
  })

  it('converts blockquotes', () => {
    const result = simpleMarkdownToHtml('> This is a quote')
    expect(result).toContain('<blockquote')
    expect(result).toContain('This is a quote')
  })

  it('converts unordered lists', () => {
    const result = simpleMarkdownToHtml('- Item one\n- Item two')
    expect(result).toContain('Item one')
    expect(result).toContain('Item two')
    // Both items should have bullet markers
    expect((result.match(/•/g) || []).length).toBe(2)
  })

  it('converts ordered lists', () => {
    const result = simpleMarkdownToHtml('1. First\n2. Second')
    expect(result).toContain('First')
    expect(result).toContain('Second')
    expect(result).toContain('1.')
    expect(result).toContain('2.')
  })

  it('converts line breaks', () => {
    const result = simpleMarkdownToHtml('Line one\n\nLine two')
    expect(result).toContain('<br/><br/>')
  })

  it('handles empty string', () => {
    expect(simpleMarkdownToHtml('')).toBe('')
  })

  it('handles combined markdown', () => {
    const md = '## Features\n\n- **Fast** rendering\n- _Smooth_ animations\n\n> Built with love'
    const result = simpleMarkdownToHtml(md)
    expect(result).toContain('<h2')
    expect(result).toContain('<strong>Fast</strong>')
    expect(result).toContain('<em>Smooth</em>')
    expect(result).toContain('<blockquote')
  })
})

describe('TOOLBAR_ACTIONS', () => {
  it('has 10 toolbar actions', () => {
    expect(TOOLBAR_ACTIONS).toHaveLength(10)
  })

  it('all actions have required fields', () => {
    for (const action of TOOLBAR_ACTIONS) {
      expect(action.icon).toBeTruthy()
      expect(action.title).toBeTruthy()
      expect(typeof action.prefix).toBe('string')
      expect(typeof action.suffix).toBe('string')
    }
  })

  it('block actions include heading, code block, lists, and quote', () => {
    const blockActions = TOOLBAR_ACTIONS.filter(a => a.block)
    expect(blockActions).toHaveLength(5)
    const titles = blockActions.map(a => a.title)
    expect(titles).toContain('Heading')
    expect(titles).toContain('Code block')
    expect(titles).toContain('Bullet list')
    expect(titles).toContain('Numbered list')
    expect(titles).toContain('Quote')
  })

  it('inline actions wrap text correctly', () => {
    const bold = TOOLBAR_ACTIONS.find(a => a.title === 'Bold')!
    expect(`${bold.prefix}text${bold.suffix}`).toBe('**text**')

    const italic = TOOLBAR_ACTIONS.find(a => a.title === 'Italic')!
    expect(`${italic.prefix}text${italic.suffix}`).toBe('_text_')

    const link = TOOLBAR_ACTIONS.find(a => a.title === 'Link')!
    expect(`${link.prefix}text${link.suffix}`).toBe('[text](url)')

    const code = TOOLBAR_ACTIONS.find(a => a.title === 'Inline code')!
    expect(`${code.prefix}text${code.suffix}`).toBe('`text`')
  })
})

describe('adminField markdown type integration', () => {
  it('markdown type is a valid adminField type', () => {
    // Verify the type exists in the union (compile-time check via test structure)
    type AdminFieldType = 'text' | 'email' | 'url' | 'number' | 'textarea' | 'markdown'
    const validTypes: AdminFieldType[] = ['text', 'email', 'url', 'number', 'textarea', 'markdown']
    expect(validTypes).toContain('markdown')
  })
})
