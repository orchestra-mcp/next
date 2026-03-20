'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SidebarTerminalSession } from '@/types/sidebar'

function genId() {
  return `tsess-${Math.random().toString(36).slice(2, 9)}`
}

interface TerminalSessionsState {
  sessions: SidebarTerminalSession[]
  activeSessionId: string | null
  createSession: (type: SidebarTerminalSession['type'], name?: string, host?: string) => string
  closeSession: (id: string) => void
  deleteSession: (id: string) => void
  renameSession: (id: string, name: string) => void
  setActive: (id: string | null) => void
}

export const useTerminalSessionsStore = create<TerminalSessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (type, name, host) => {
        const id = genId()
        const defaultName = type === 'ssh' ? `SSH${host ? ` — ${host}` : ''}` : type === 'claude' ? 'Claude Session' : 'Terminal'
        const session: SidebarTerminalSession = {
          id,
          name: name || defaultName,
          type,
          status: 'active',
          host,
          createdAt: new Date().toISOString(),
        }
        set(s => ({ sessions: [session, ...s.sessions], activeSessionId: id }))
        return id
      },

      closeSession: (id) => {
        set(s => ({
          sessions: s.sessions.map(sess => sess.id === id ? { ...sess, status: 'closed' } : sess),
        }))
      },

      deleteSession: (id) => {
        set(s => ({
          sessions: s.sessions.filter(sess => sess.id !== id),
          activeSessionId: s.activeSessionId === id ? (s.sessions.find(sess => sess.id !== id)?.id ?? null) : s.activeSessionId,
        }))
      },

      renameSession: (id, name) => {
        set(s => ({ sessions: s.sessions.map(sess => sess.id === id ? { ...sess, name } : sess) }))
      },

      setActive: (id) => set({ activeSessionId: id }),
    }),
    { name: 'orchestra-terminal-sessions' }
  )
)
