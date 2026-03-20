import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Badge definitions CRUD', () => {
  it('Go BadgeDefinition model exists with required fields', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/models/badge.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('BadgeDefinition')
    expect(content).toContain('Slug')
    expect(content).toContain('PointsRequired')
    expect(content).toContain('AutoAward')
    expect(content).toContain('UserBadge')
  })

  it('Go admin badge handler exists with CRUD', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/admin_badges.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('func (h *AdminBadgeHandler) List')
    expect(content).toContain('func (h *AdminBadgeHandler) Create')
    expect(content).toContain('func (h *AdminBadgeHandler) Update')
    expect(content).toContain('func (h *AdminBadgeHandler) Delete')
  })

  it('Flutter badges admin page uses API', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/screens/web/admin/badges_admin_page.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('listBadgeDefinitions')
    expect(content).toContain('createBadgeDefinition')
    expect(content).toContain('updateBadgeDefinition')
    expect(content).toContain('deleteBadgeDefinition')
    expect(content).not.toContain('API not connected yet')
  })
})
