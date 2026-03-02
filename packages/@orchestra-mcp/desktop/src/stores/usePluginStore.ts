import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  description?: string;
}

interface PluginStore {
  plugins: Record<string, Plugin>;
  loadedCount: number;
  addPlugin: (plugin: Plugin) => void;
  removePlugin: (id: string) => void;
  togglePlugin: (id: string) => void;
  setPluginEnabled: (id: string, enabled: boolean) => void;
  updateLoadedCount: (count: number) => void;
}

export const usePluginStore = create<PluginStore>()(
  persist(
    (set) => ({
      plugins: {},
      loadedCount: 0,
      addPlugin: (plugin) =>
        set((state) => ({
          plugins: { ...state.plugins, [plugin.id]: plugin },
        })),
      removePlugin: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.plugins;
          return { plugins: rest };
        }),
      togglePlugin: (id) =>
        set((state) => ({
          plugins: {
            ...state.plugins,
            [id]: { ...state.plugins[id], enabled: !state.plugins[id].enabled },
          },
        })),
      setPluginEnabled: (id, enabled) =>
        set((state) => ({
          plugins: {
            ...state.plugins,
            [id]: { ...state.plugins[id], enabled },
          },
        })),
      updateLoadedCount: (count) => set({ loadedCount: count }),
    }),
    {
      name: 'orchestra-plugin-store',
    }
  )
);
