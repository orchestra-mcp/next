import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const headerSrc = fs.readFileSync(
  path.resolve(__dirname, '../app-header.tsx'),
  'utf-8'
)

const navSrc = fs.readFileSync(
  path.resolve(__dirname, '../marketing-nav.tsx'),
  'utf-8'
)

describe('AppHeader dropdown', () => {
  it('accepts username in AppHeaderProps', () => {
    expect(headerSrc).toContain('username?: string')
  })

  it('renders Profile link with /@username', () => {
    expect(headerSrc).toContain('`/@${user.username}`')
    expect(headerSrc).toContain('bx-user')
    expect(headerSrc).toContain('Profile')
  })

  it('routes Settings to /@username/settings when username exists', () => {
    expect(headerSrc).toContain('`/@${user.username}/settings`')
  })

  it('falls back to /settings when no username', () => {
    expect(headerSrc).toContain("'/settings'")
  })

  it('conditionally renders Profile only when username exists', () => {
    expect(headerSrc).toContain('user?.username && (')
  })
})

describe('MarketingNav dropdown', () => {
  it('renders Profile dropdown item with /@username', () => {
    expect(navSrc).toContain('`/@${user.username}`')
    expect(navSrc).toContain("t('nav.profile')")
  })

  it('routes Settings to /@username/settings when username exists', () => {
    expect(navSrc).toContain('`/@${user.username}/settings`')
  })

  it('renders Dashboard as separate item', () => {
    expect(navSrc).toContain("router.push('/dashboard')")
    expect(navSrc).toContain("t('nav.dashboard')")
  })

  it('shows Profile link in hamburger overlay menu', () => {
    // The overlay menu should have a Profile link for logged-in users
    const overlayProfileRegex = /user\.username.*toggleMenu.*nav\.profile/s
    expect(navSrc).toMatch(overlayProfileRegex)
  })

  it('conditionally renders Profile only when username exists', () => {
    expect(navSrc).toContain('user.username && (')
  })
})

describe('Translation keys', () => {
  it('en.json has nav.profile', () => {
    const enSrc = fs.readFileSync(
      path.resolve(__dirname, '../../../messages/en.json'),
      'utf-8'
    )
    const en = JSON.parse(enSrc)
    expect(en.nav.profile).toBe('Profile')
  })

  it('ar.json has nav.profile', () => {
    const arSrc = fs.readFileSync(
      path.resolve(__dirname, '../../../messages/ar.json'),
      'utf-8'
    )
    const ar = JSON.parse(arSrc)
    expect(ar.nav.profile).toBe('الملف الشخصي')
  })
})
