import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Flutter user detail badges and points UI', () => {
  const content = readFileSync(resolve(process.cwd(), '../../apps/flutter/lib/screens/web/admin/user_detail_page.dart'), 'utf-8')

  it('has Badges and Points tabs', () => {
    expect(content).toContain("'Badges'")
    expect(content).toContain("'Points'")
    expect(content).toContain('_BadgesTab')
    expect(content).toContain('_PointsTab')
  })

  it('badges tab lists awarded badges with revoke button', () => {
    expect(content).toContain('Awarded Badges')
    expect(content).toContain('listUserBadges')
    expect(content).toContain('revokeUserBadge')
    expect(content).toContain('Revoke')
  })

  it('badges tab has award dialog', () => {
    expect(content).toContain('Award Badge')
    expect(content).toContain('awardUserBadge')
    expect(content).toContain('listBadgeDefinitions')
  })

  it('points tab shows balance and add/deduct form', () => {
    expect(content).toContain('Points Balance')
    expect(content).toContain('getUserPoints')
    expect(content).toContain('addUserPoints')
    expect(content).toContain('Add or Deduct Points')
  })

  it('points tab shows auto-awarded badges in snackbar', () => {
    expect(content).toContain('badges_awarded')
    expect(content).toContain('Badges awarded:')
  })
})
