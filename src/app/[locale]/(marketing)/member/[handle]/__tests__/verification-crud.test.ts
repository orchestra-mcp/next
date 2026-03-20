import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Verification type CRUD', () => {
  it('Go VerificationType model exists', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/models/verification.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('VerificationType')
    expect(content).toContain('BadgeText')
    expect(content).toContain('UserVerification')
  })

  it('Go admin verification handler exists', () => {
    const path = resolve(process.cwd(), '../../apps/web/internal/handlers/admin_verifications.go')
    expect(existsSync(path)).toBe(true)
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('func (h *AdminVerificationHandler) List')
    expect(content).toContain('func (h *AdminVerificationHandler) Create')
  })

  it('Flutter verification page wired to API', () => {
    const path = resolve(process.cwd(), '../../apps/flutter/lib/screens/web/admin/verifications_admin_page.dart')
    const content = readFileSync(path, 'utf-8')
    expect(content).toContain('updateAdminUser')
    expect(content).not.toContain('API not connected yet')
  })
})
