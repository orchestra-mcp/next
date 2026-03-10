'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Local metadata for sidebar items (pin, custom name, color, icon) */
export interface ItemMeta {
  pinned?: boolean
  customName?: string
  color?: string
  icon?: string
}

interface SidebarMetaState {
  /** key = `${section}:${id}` */
  items: Record<string, ItemMeta>
  /** Last active sidebar section (persisted for restore) */
  lastSection: string | null
  /** Last pathname per section (persisted for active item highlight) */
  lastPath: Record<string, string>
}

interface SidebarMetaActions {
  getMeta: (section: string, id: string) => ItemMeta
  togglePin: (section: string, id: string) => void
  setCustomName: (section: string, id: string, name: string) => void
  setColor: (section: string, id: string, color: string) => void
  setIcon: (section: string, id: string, icon: string) => void
  removeMeta: (section: string, id: string) => void
  setLastSection: (section: string) => void
  setLastPath: (section: string, path: string) => void
}

const key = (section: string, id: string) => `${section}:${id}`

export const useSidebarMetaStore = create<SidebarMetaState & SidebarMetaActions>()(
  persist(
    (set, get) => ({
      items: {},
      lastSection: null,
      lastPath: {},

      getMeta: (section, id) => get().items[key(section, id)] ?? {},

      togglePin: (section, id) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          return { items: { ...s.items, [k]: { ...cur, pinned: !cur.pinned } } }
        })
      },

      setCustomName: (section, id, name) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          return { items: { ...s.items, [k]: { ...cur, customName: name || undefined } } }
        })
      },

      setColor: (section, id, color) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          return { items: { ...s.items, [k]: { ...cur, color: color || undefined } } }
        })
      },

      setIcon: (section, id, icon) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          return { items: { ...s.items, [k]: { ...cur, icon: icon || undefined } } }
        })
      },

      removeMeta: (section, id) => {
        const k = key(section, id)
        set(s => {
          const { [k]: _, ...rest } = s.items
          return { items: rest }
        })
      },

      setLastSection: (section) => set({ lastSection: section }),

      setLastPath: (section, path) => set(s => ({
        lastPath: { ...s.lastPath, [section]: path },
      })),
    }),
    {
      name: 'orchestra-sidebar-meta',
      partialize: (s) => ({ items: s.items, lastSection: s.lastSection, lastPath: s.lastPath }),
    }
  )
)
