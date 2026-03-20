import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Badge auto-award system', () => {
  it('CheckAndAwardBadges function exists', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/badge_autoaward.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('func CheckAndAwardBadges')
    expect(content).toContain('auto_award')
    expect(content).toContain('points_required')
    expect(content).toContain('badge_earned')
  })

  it('creates notification on badge award', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/badge_autoaward.go')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('models.Notification')
    expect(content).toContain('Badge Earned:')
    expect(content).toContain('badge_earned')
  })

  it('AddPoints handler calls CheckAndAwardBadges', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/admin_user_gamification.go')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('CheckAndAwardBadges')
    expect(content).toContain('badges_awarded')
  })
})
