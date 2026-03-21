import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sidebar = readFileSync(
  resolve(process.cwd(), 'src/components/profile/profile-sidebar.tsx'),
  'utf-8'
)

const settingsProfile = readFileSync(
  resolve(process.cwd(), 'src/app/[locale]/(marketing)/member/[handle]/settings/profile/page.tsx'),
  'utf-8'
)

describe('profile-sidebar — bio modal', () => {
  it('imports react-markdown', () => {
    expect(sidebar).toContain("from 'react-markdown'")
  })

  it('has BioModal component', () => {
    expect(sidebar).toContain('function BioModal')
  })

  it('bio modal renders ReactMarkdown', () => {
    expect(sidebar).toContain('<ReactMarkdown')
  })

  it('bio modal closes on Escape key', () => {
    expect(sidebar).toContain("e.key === 'Escape'")
  })

  it('bio modal closes on backdrop click', () => {
    expect(sidebar).toContain('onClick={onClose}')
  })

  it('bio paragraph is clickable and opens modal', () => {
    expect(sidebar).toContain('setShowBioModal(true)')
    expect(sidebar).toContain("cursor: 'pointer'")
  })

  it('showBioModal state is declared', () => {
    expect(sidebar).toContain('showBioModal')
  })

  it('BioModal is mounted conditionally', () => {
    expect(sidebar).toContain('showBioModal && profile.bio && <BioModal')
  })

  it('modal has styled markdown components for p, a, code, strong', () => {
    expect(sidebar).toContain("p: ({")
    expect(sidebar).toContain("a: ({")
    expect(sidebar).toContain("code: ({")
    expect(sidebar).toContain("strong: ({")
  })
})

describe('settings/profile — bio markdown hint', () => {
  it('shows Markdown supported label', () => {
    expect(settingsProfile).toContain('Markdown supported')
  })

  it('has markdown icon', () => {
    expect(settingsProfile).toContain('bxl-markdown')
  })

  it('placeholder mentions Markdown', () => {
    expect(settingsProfile).toContain('Markdown supported')
  })
})
