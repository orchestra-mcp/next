import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEFAULT_LAYOUT, WIDGET_REGISTRY } from '@/types/dashboard'
import type { WidgetLayout, WidgetType } from '@/types/dashboard'

// Unit tests for dashboard types and constants (store tests need DOM mocking)

describe('dashboard types', () => {
  it('DEFAULT_LAYOUT has 4 widgets', () => {
    expect(DEFAULT_LAYOUT).toHaveLength(4)
  })

  it('DEFAULT_LAYOUT widget types match registry', () => {
    for (const widget of DEFAULT_LAYOUT) {
      expect(WIDGET_REGISTRY[widget.type]).toBeDefined()
    }
  })

  it('DEFAULT_LAYOUT orders are sequential', () => {
    const orders = DEFAULT_LAYOUT.map(w => w.order)
    expect(orders).toEqual([0, 1, 2, 3])
  })

  it('DEFAULT_LAYOUT colSpans are within 1-12', () => {
    for (const widget of DEFAULT_LAYOUT) {
      expect(widget.colSpan).toBeGreaterThanOrEqual(1)
      expect(widget.colSpan).toBeLessThanOrEqual(12)
    }
  })

  it('DEFAULT_LAYOUT has no hidden or locked widgets', () => {
    for (const widget of DEFAULT_LAYOUT) {
      expect(widget.hidden).toBe(false)
      expect(widget.locked).toBe(false)
    }
  })

  it('WIDGET_REGISTRY covers all default widget types', () => {
    const types: WidgetType[] = ['stats', 'recent_projects', 'recent_notes', 'quick_actions']
    for (const t of types) {
      const def = WIDGET_REGISTRY[t]
      expect(def).toBeDefined()
      expect(def.type).toBe(t)
      expect(def.label).toBeTruthy()
      expect(def.icon).toBeTruthy()
      expect(def.minColSpan).toBeGreaterThanOrEqual(1)
      expect(def.maxColSpan).toBeLessThanOrEqual(12)
      expect(def.defaultColSpan).toBeGreaterThanOrEqual(def.minColSpan)
      expect(def.defaultColSpan).toBeLessThanOrEqual(def.maxColSpan)
    }
  })

  it('DEFAULT_LAYOUT ids are unique', () => {
    const ids = DEFAULT_LAYOUT.map(w => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('stats widget defaults to full width (12)', () => {
    const stats = DEFAULT_LAYOUT.find(w => w.type === 'stats')
    expect(stats?.colSpan).toBe(12)
  })

  it('projects and notes default to half width (6)', () => {
    const projects = DEFAULT_LAYOUT.find(w => w.type === 'recent_projects')
    const notes = DEFAULT_LAYOUT.find(w => w.type === 'recent_notes')
    expect(projects?.colSpan).toBe(6)
    expect(notes?.colSpan).toBe(6)
  })
})
