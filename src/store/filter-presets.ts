import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterState {
  assignee?: string
  priority?: string
  kind?: string
  status?: string
  labels?: string[]
  search?: string
}

export interface FilterPreset {
  id: string
  name: string
  filters: FilterState
}

interface FilterPresetsState {
  presets: FilterPreset[]
}

interface FilterPresetsActions {
  addPreset: (name: string, filters: FilterState) => void
  removePreset: (id: string) => void
}

export const useFilterPresetsStore = create<FilterPresetsState & FilterPresetsActions>()(
  persist(
    (set) => ({
      presets: [],

      addPreset: (name, filters) => {
        const preset: FilterPreset = {
          id: Date.now().toString(36),
          name,
          filters,
        }
        set((state) => ({ presets: [...state.presets, preset] }))
      },

      removePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        }))
      },
    }),
    {
      name: 'orchestra-filter-presets',
    }
  )
)
