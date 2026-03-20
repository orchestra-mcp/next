import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(process.cwd(), '../..')

describe('Install URL consistency', () => {
  it('LandingClient.tsx uses /install.sh not /install', () => {
    const content = readFileSync(resolve(root, 'apps/next/src/app/[locale]/LandingClient.tsx'), 'utf-8')
    expect(content).toContain('install.sh')
    expect(content).not.toMatch(/orchestra-mcp\.dev\/install[^.]/)
  })

  it('installation.md uses /install.sh not /install', () => {
    const content = readFileSync(resolve(root, 'docs/getting-started/installation.md'), 'utf-8')
    expect(content).toContain('install.sh')
    const lines = content.split('\n').filter(l => l.includes('orchestra-mcp.dev/install'))
    for (const line of lines) {
      expect(line).toContain('install.sh')
    }
  })

  it('quick-start.md uses /install.sh not /install', () => {
    const content = readFileSync(resolve(root, 'docs/getting-started/quick-start.md'), 'utf-8')
    expect(content).toContain('install.sh')
    const lines = content.split('\n').filter(l => l.includes('orchestra-mcp.dev/install'))
    for (const line of lines) {
      expect(line).toContain('install.sh')
    }
  })
})
