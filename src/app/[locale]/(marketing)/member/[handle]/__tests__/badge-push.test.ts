import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Badge push notification', () => {
  it('CheckAndAwardBadges broadcasts via WebSocket hub', () => {
    const content = readFileSync(resolve(process.cwd(), '../../apps/web/internal/handlers/badge_autoaward.go'), 'utf-8')
    expect(content).toContain('hub.Event')
    expect(content).toContain('BroadcastToUser')
    expect(content).toContain('badge_earned')
    expect(content).toContain('wsHub ...*hub.Hub')
  })

  it('gamification handler passes hub to auto-award', () => {
    const content = readFileSync(resolve(process.cwd(), '../../apps/web/internal/handlers/admin_user_gamification.go'), 'utf-8')
    expect(content).toContain('hub *hub.Hub')
    expect(content).toContain('CheckAndAwardBadges(h.db, user.ID, newPoints, h.hub)')
  })
})
