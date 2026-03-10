/**
 * i18n translation file integrity tests.
 * Verifies EN and AR message files have matching keys and valid structure.
 */
import { describe, it, expect } from 'vitest'
import en from '../messages/en.json'
import ar from '../messages/ar.json'

describe('i18n translations', () => {
  it('EN and AR have the same top-level namespaces', () => {
    const enKeys = Object.keys(en).sort()
    const arKeys = Object.keys(ar).sort()
    expect(arKeys).toEqual(enKeys)
  })

  it('all namespace keys match between EN and AR', () => {
    const missingInAr: string[] = []
    const missingInEn: string[] = []

    function compareKeys(enObj: Record<string, unknown>, arObj: Record<string, unknown>, prefix = '') {
      for (const key of Object.keys(enObj)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (!(key in arObj)) {
          missingInAr.push(path)
        } else if (typeof enObj[key] === 'object' && enObj[key] !== null && typeof arObj[key] === 'object' && arObj[key] !== null) {
          compareKeys(enObj[key] as Record<string, unknown>, arObj[key] as Record<string, unknown>, path)
        }
      }
      for (const key of Object.keys(arObj)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (!(key in enObj)) {
          missingInEn.push(path)
        }
      }
    }

    compareKeys(en as Record<string, unknown>, ar as Record<string, unknown>)
    expect(missingInAr).toEqual([])
    expect(missingInEn).toEqual([])
  })

  it('no empty string values in EN', () => {
    function findEmpty(obj: Record<string, unknown>, prefix = ''): string[] {
      const empties: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'string' && value.trim() === '') {
          empties.push(path)
        } else if (typeof value === 'object' && value !== null) {
          empties.push(...findEmpty(value as Record<string, unknown>, path))
        }
      }
      return empties
    }
    expect(findEmpty(en as Record<string, unknown>)).toEqual([])
  })

  it('no empty string values in AR', () => {
    function findEmpty(obj: Record<string, unknown>, prefix = ''): string[] {
      const empties: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'string' && value.trim() === '') {
          empties.push(path)
        } else if (typeof value === 'object' && value !== null) {
          empties.push(...findEmpty(value as Record<string, unknown>, path))
        }
      }
      return empties
    }
    expect(findEmpty(ar as Record<string, unknown>)).toEqual([])
  })
})
