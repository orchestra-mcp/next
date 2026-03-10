'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, ChatMode, ClaudeCodeEvent } from '@orchestra-mcp/ai/types'

// ── Types ────────────────────────────────────────────────────

export interface Account {
  id: string
  name: string
  provider: string
  model: string
  budget: string
}

export interface SessionMeta {
  claudeSessionId?: string
  model?: string
  tokensIn?: number
  tokensOut?: number
  cost?: number
  durationMs?: number
}

export interface ChatSessionData {
  id: string
  title: string
  messages: ChatMessage[]
  accountId?: string
  model?: string
  provider?: string
  status: string
  createdAt: string
  updatedAt: string
  lastTurnMeta?: SessionMeta
}

// ── State & Actions ──────────────────────────────────────────

export interface CopilotPosition {
  x: number
  y: number
}

export interface CopilotSize {
  width: number
  height: number
}

interface ChatState {
  sessions: ChatSessionData[]
  copilotOpen: boolean
  copilotSessionId: string | null
  copilotPosition: CopilotPosition | null
  copilotBubblePosition: CopilotPosition | null
  copilotSize: CopilotSize
  accounts: Account[]
  accountsLoaded: boolean
  sendingSessionIds: string[]
  typingStatus: Record<string, string | null>
  selectedModelId: string
  chatMode: ChatMode
  showThinking: boolean
  showNewChat: boolean
}

interface ChatActions {
  setSessions: (sessions: ChatSessionData[]) => void
  addSession: (session: ChatSessionData) => void
  removeSession: (id: string) => void
  updateSessionStatus: (id: string, status: string) => void
  pushMessage: (sessionId: string, msg: ChatMessage) => void
  patchMessage: (sessionId: string, msgId: string, updates: Partial<ChatMessage>) => void
  appendEvent: (sessionId: string, msgId: string, event: ClaudeCodeEvent) => void
  updateEvent: (sessionId: string, msgId: string, toolId: string, updates: Partial<ClaudeCodeEvent>) => void
  appendMessageText: (sessionId: string, msgId: string, text: string) => void
  setMessageThinking: (sessionId: string, msgId: string, thinking: string) => void
  setSessionMessages: (sessionId: string, messages: ChatMessage[]) => void
  setAccounts: (accounts: Account[]) => void
  setAccountsLoaded: (loaded: boolean) => void
  setCopilotOpen: (open: boolean) => void
  toggleCopilot: () => void
  setCopilotSessionId: (id: string | null) => void
  addSendingSession: (id: string) => void
  removeSendingSession: (id: string) => void
  setTypingStatus: (sessionId: string, status: string | null) => void
  setSelectedModelId: (id: string) => void
  setChatMode: (mode: ChatMode) => void
  setShowThinking: (enabled: boolean) => void
  setShowNewChat: (show: boolean) => void
  setCopilotPosition: (pos: CopilotPosition | null) => void
  setCopilotBubblePosition: (pos: CopilotPosition | null) => void
  setCopilotSize: (size: CopilotSize) => void
  setSessionMeta: (sessionId: string, meta: SessionMeta) => void
  getSession: (id: string) => ChatSessionData | undefined
}

// ── Store ────────────────────────────────────────────────────

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // State
      sessions: [],
      copilotOpen: false,
      copilotSessionId: null,
      copilotPosition: null,
      copilotBubblePosition: null,
      copilotSize: { width: 420, height: 520 },
      accounts: [],
      accountsLoaded: false,
      sendingSessionIds: [],
      typingStatus: {},
      selectedModelId: 'claude-sonnet-4-6',
      chatMode: 'auto' as ChatMode,
      showThinking: false,
      showNewChat: false,

      // Session CRUD
      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      removeSession: (id) =>
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id)
          const nextCopilotId =
            state.copilotSessionId === id
              ? (remaining[0]?.id ?? null)
              : state.copilotSessionId
          return { sessions: remaining, copilotSessionId: nextCopilotId }
        }),

      updateSessionStatus: (id, status) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s,
          ),
        })),

      // Message operations
      pushMessage: (sessionId, msg) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, msg], updatedAt: new Date().toISOString() }
              : s,
          ),
        })),

      patchMessage: (sessionId, msgId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId ? { ...m, ...updates } : m,
                  ),
                }
              : s,
          ),
        })),

      appendEvent: (sessionId, msgId, event) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId
                      ? { ...m, events: [...(m.events ?? []), event] }
                      : m,
                  ),
                }
              : s,
          ),
        })),

      updateEvent: (sessionId, msgId, toolId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId
                      ? {
                          ...m,
                          events: (m.events ?? []).map((e) =>
                            e.toolUseId === toolId || e.id === toolId
                              ? { ...e, ...updates } as ClaudeCodeEvent
                              : e,
                          ),
                        }
                      : m,
                  ),
                }
              : s,
          ),
        })),

      appendMessageText: (sessionId, msgId, text) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId ? { ...m, content: m.content + text } : m,
                  ),
                }
              : s,
          ),
        })),

      setMessageThinking: (sessionId, msgId, thinking) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === msgId ? { ...m, thinking } : m,
                  ),
                }
              : s,
          ),
        })),

      setSessionMessages: (sessionId, messages) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages } : s,
          ),
        })),

      // Accounts
      setAccounts: (accounts) => set({ accounts, accountsLoaded: true }),
      setAccountsLoaded: (loaded) => set({ accountsLoaded: loaded }),

      // Copilot UI
      setCopilotOpen: (open) => set({ copilotOpen: open }),
      toggleCopilot: () => set((state) => ({ copilotOpen: !state.copilotOpen })),
      setCopilotSessionId: (id) => set({ copilotSessionId: id }),

      // Sending state
      addSendingSession: (id) =>
        set((state) => ({
          sendingSessionIds: state.sendingSessionIds.includes(id)
            ? state.sendingSessionIds
            : [...state.sendingSessionIds, id],
        })),
      removeSendingSession: (id) =>
        set((state) => ({
          sendingSessionIds: state.sendingSessionIds.filter((s) => s !== id),
        })),

      // Typing status
      setTypingStatus: (sessionId, status) =>
        set((state) => ({
          typingStatus: { ...state.typingStatus, [sessionId]: status },
        })),

      // Preferences
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      setChatMode: (mode) => set({ chatMode: mode }),
      setShowThinking: (enabled) => set({ showThinking: enabled }),
      setShowNewChat: (show) => set({ showNewChat: show }),

      // Copilot position & size
      setCopilotPosition: (pos) => set({ copilotPosition: pos }),
      setCopilotBubblePosition: (pos) => set({ copilotBubblePosition: pos }),
      setCopilotSize: (size) => set({ copilotSize: size }),

      // Session metadata (usage stats from last turn)
      setSessionMeta: (sessionId, meta) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, lastTurnMeta: meta } : s,
          ),
        })),

      // Getters
      getSession: (id) => get().sessions.find((s) => s.id === id),
    }),
    {
      name: 'orchestra-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        copilotSessionId: state.copilotSessionId,
        copilotPosition: state.copilotPosition,
        copilotBubblePosition: state.copilotBubblePosition,
        copilotSize: state.copilotSize,
        selectedModelId: state.selectedModelId,
        chatMode: state.chatMode,
        showThinking: state.showThinking,
      }),
    },
  ),
)
