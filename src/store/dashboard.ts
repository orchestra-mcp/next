'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as db from '@/lib/supabase/queries'
import type { WidgetLayout } from '@/types/dashboard'
import { DEFAULT_LAYOUT, WIDGET_REGISTRY, LAYOUT_VERSION } from '@/types/dashboard'

interface DashboardState {
  widgets: WidgetLayout[]
  editMode: boolean
  loaded: boolean
}

interface DashboardActions {
  fetchLayout: () => Promise<void>
  saveLayout: (widgets: WidgetLayout[]) => void
  setEditMode: (on: boolean) => void
  reorderWidget: (fromIndex: number, toIndex: number) => void
  resizeWidget: (id: string, colSpan: number) => void
  toggleWidget: (id: string) => void
  lockWidget: (id: string) => void
  resetLayout: () => void
  setGridColumns: (columns: number) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function debouncedSave(widgets: WidgetLayout[]) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      await db.upsertUserSetting('dashboard_layout', widgets)
    } catch {
      // Silently fail — localStorage has the truth
    }
  }, 500)
}

function migrateLayout(saved: WidgetLayout[]): WidgetLayout[] {
  const knownTypes = Object.keys(WIDGET_REGISTRY)
  // Filter out unknown widget types
  const valid = saved.filter(w => knownTypes.includes(w.type))
  // Add any missing default widgets — visible by default so users see new widgets
  for (const def of DEFAULT_LAYOUT) {
    if (!valid.find(w => w.type === def.type)) {
      valid.push({ ...def, order: valid.length, hidden: false })
    }
  }
  // Re-sort by order
  return valid.sort((a, b) => a.order - b.order).map((w, i) => ({ ...w, order: i }))
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      widgets: [...DEFAULT_LAYOUT],
      editMode: false,
      loaded: false,

      fetchLayout: async () => {
        try {
          const layout = await db.fetchUserSetting('dashboard_layout')
          if (layout && Array.isArray(layout) && layout.length > 0) {
            set({ widgets: migrateLayout(layout as WidgetLayout[]), loaded: true })
          } else {
            set({ loaded: true })
          }
        } catch {
          set({ loaded: true })
        }
      },

      saveLayout: (widgets) => {
        set({ widgets })
        debouncedSave(widgets)
      },

      setEditMode: (on) => set({ editMode: on }),

      reorderWidget: (fromIndex, toIndex) => {
        const widgets = [...get().widgets]
        const [moved] = widgets.splice(fromIndex, 1)
        widgets.splice(toIndex, 0, moved)
        const reordered = widgets.map((w, i) => ({ ...w, order: i }))
        get().saveLayout(reordered)
      },

      resizeWidget: (id, colSpan) => {
        const widgets = get().widgets.map(w =>
          w.id === id ? { ...w, colSpan: Math.min(12, Math.max(1, colSpan)) } : w
        )
        get().saveLayout(widgets)
      },

      toggleWidget: (id) => {
        const widgets = get().widgets.map(w =>
          w.id === id ? { ...w, hidden: !w.hidden } : w
        )
        get().saveLayout(widgets)
      },

      lockWidget: (id) => {
        const widgets = get().widgets.map(w =>
          w.id === id ? { ...w, locked: !w.locked } : w
        )
        get().saveLayout(widgets)
      },

      resetLayout: () => {
        get().saveLayout([...DEFAULT_LAYOUT])
      },

      setGridColumns: (columns) => {
        const colSpan = Math.max(1, Math.min(12, Math.floor(12 / columns)))
        const widgets = get().widgets.map(w => {
          if (w.locked) return w
          const def = WIDGET_REGISTRY[w.type]
          const clamped = Math.max(def.minColSpan, Math.min(def.maxColSpan, colSpan))
          return { ...w, colSpan: clamped }
        })
        get().saveLayout(widgets)
      },
    }),
    {
      name: 'orchestra-dashboard',
      version: LAYOUT_VERSION,
      partialize: (s) => ({ widgets: s.widgets }),
      migrate: () => {
        // On version bump, reset to new default layout
        return { widgets: [...DEFAULT_LAYOUT] }
      },
    }
  )
)
