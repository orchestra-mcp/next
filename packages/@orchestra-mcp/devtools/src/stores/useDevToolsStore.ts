import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DevSession } from '../types';

interface DevToolsState {
  sessions: DevSession[];
  activeSessionId: string | null;
  sidebarOpen: boolean;
}

interface DevToolsActions {
  createSession: (session: DevSession) => void;
  closeSession: (id: string) => void;
  switchSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<DevSession>) => void;
  reorderSessions: (ids: string[]) => void;
  renameSession: (id: string, name: string) => void;
  setSessionIcon: (id: string, icon: string) => void;
  setSessionColor: (id: string, color: string) => void;
  togglePin: (id: string) => void;
  toggleSidebar: () => void;
}

export const useDevToolsStore = create<DevToolsState & DevToolsActions>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      sidebarOpen: true,

      createSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: session.id,
        })),

      closeSession: (id) =>
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id);
          const wasActive = state.activeSessionId === id;
          return {
            sessions: remaining,
            activeSessionId: wasActive
              ? remaining[remaining.length - 1]?.id ?? null
              : state.activeSessionId,
          };
        }),

      switchSession: (id) => set({ activeSessionId: id }),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      reorderSessions: (ids) =>
        set((state) => {
          const map = new Map(state.sessions.map((s) => [s.id, s]));
          return {
            sessions: ids
              .map((id, i) => {
                const s = map.get(id);
                return s ? { ...s, sortOrder: i } : null;
              })
              .filter(Boolean) as DevSession[],
          };
        }),

      renameSession: (id, name) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        })),

      setSessionIcon: (id, icon) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, icon } : s
          ),
        })),

      setSessionColor: (id, color) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, color } : s
          ),
        })),

      togglePin: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, pinned: !s.pinned } : s
          ),
        })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'orchestra-devtools-sessions' }
  )
);
