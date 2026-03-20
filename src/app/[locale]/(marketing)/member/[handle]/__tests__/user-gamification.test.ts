import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('User gamification admin', () => {
  it('Go gamification handler exists with badge and points management', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/admin_user_gamification.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('ListUserBadges')
    expect(content).toContain('AwardBadge')
    expect(content).toContain('RevokeBadge')
    expect(content).toContain('GetPoints')
    expect(content).toContain('AddPoints')
  })

  it('Flutter API client has gamification methods', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/core/api/api_client.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('listUserBadges')
    expect(content).toContain('awardUserBadge')
    expect(content).toContain('revokeUserBadge')
    expect(content).toContain('getUserPoints')
    expect(content).toContain('addUserPoints')
  })

  it('REST client implements gamification endpoints', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/core/api/rest_client.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('/api/admin/users/$userId/badges')
    expect(content).toContain('/api/admin/users/$userId/points')
  })
})
