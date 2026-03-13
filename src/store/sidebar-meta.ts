'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Local metadata for sidebar items (pin, custom name, color, icon) */
export interface ItemMeta {
  pinned?: boolean
  customName?: string
  color?: string
  icon?: string
  /** @deprecated Use team_ids instead */
  team_id?: string
  /** @deprecated Use assigned_to_ids instead */
  assigned_to?: string
  team_ids?: string[]
  assigned_to_ids?: string[]
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
  setMeta: (section: string, id: string, field: keyof ItemMeta, value: string) => void
  removeMeta: (section: string, id: string) => void
  setLastSection: (section: string) => void
  setLastPath: (section: string, path: string) => void
  /** Toggle a team in/out of the team_ids array */
  toggleTeam: (section: string, id: string, teamId: string) => void
  /** Toggle a member in/out of the assigned_to_ids array */
  toggleAssignee: (section: string, id: string, memberId: string) => void
  /** Get resolved team_ids (migrates legacy team_id) */
  getTeamIds: (section: string, id: string) => string[]
  /** Get resolved assigned_to_ids (migrates legacy assigned_to) */
  getAssigneeIds: (section: string, id: string) => string[]
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

      setMeta: (section, id, field, value) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          return { items: { ...s.items, [k]: { ...cur, [field]: value || undefined } } }
        })
      },

      toggleTeam: (section, id, teamId) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          const existing = cur.team_ids ?? (cur.team_id ? [cur.team_id] : [])
          const next = existing.includes(teamId)
            ? existing.filter(t => t !== teamId)
            : [...existing, teamId]
          return { items: { ...s.items, [k]: { ...cur, team_ids: next, team_id: undefined } } }
        })
      },

      toggleAssignee: (section, id, memberId) => {
        const k = key(section, id)
        set(s => {
          const cur = s.items[k] ?? {}
          const existing = cur.assigned_to_ids ?? (cur.assigned_to ? [cur.assigned_to] : [])
          const next = existing.includes(memberId)
            ? existing.filter(m => m !== memberId)
            : [...existing, memberId]
          return { items: { ...s.items, [k]: { ...cur, assigned_to_ids: next, assigned_to: undefined } } }
        })
      },

      getTeamIds: (section, id) => {
        const meta = get().items[key(section, id)] ?? {}
        return meta.team_ids ?? (meta.team_id ? [meta.team_id] : [])
      },

      getAssigneeIds: (section, id) => {
        const meta = get().items[key(section, id)] ?? {}
        return meta.assigned_to_ids ?? (meta.assigned_to ? [meta.assigned_to] : [])
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
