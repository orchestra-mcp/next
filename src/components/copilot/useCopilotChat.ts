'use client'
import { useEffect, useMemo, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type { ChatSession } from '@orchestra-mcp/ai/ChatHeader'
import type { QuickAction, StartupPrompt, AIModel } from '@orchestra-mcp/ai/types'
import { DEFAULT_MODELS } from '@orchestra-mcp/ai/types'
import { useChatStore } from '@/store/chat'
import { useAuthStore } from '@/store/auth'
import { useChatMCP, clearActiveQuestionId } from '@/hooks/useChatMCP'

// ── Page Context ─────────────────────────────────────────────

function getPageContext(pathname: string): { label: string; quickActions: QuickAction[] } {
  if (pathname.startsWith('/projects')) {
    return {
      label: 'Projects',
      quickActions: [
        { id: 'qa-status', label: 'Project Status', prompt: 'Show the project workflow status and feature breakdown', color: '#00e5ff' },
        { id: 'qa-features', label: 'List Features', prompt: 'List all features with their current status', color: '#a900ff' },
        { id: 'qa-next', label: 'Next Feature', prompt: 'What is the next feature to work on?', color: '#22c55e' },
      ],
    }
  }
  if (pathname.startsWith('/notes')) {
    return {
      label: 'Notes',
      quickActions: [
        { id: 'qa-notes', label: 'Search Notes', prompt: 'Search my notes', color: '#22c55e' },
        { id: 'qa-create-note', label: 'Create Note', prompt: 'Create a new note titled ', color: '#f59e0b' },
      ],
    }
  }
  if (pathname.startsWith('/plans')) {
    return {
      label: 'Plans',
      quickActions: [
        { id: 'qa-plans', label: 'List Plans', prompt: 'List all plans with their status', color: '#8b5cf6' },
        { id: 'qa-create-plan', label: 'Create Plan', prompt: 'Create a plan for ', color: '#a900ff' },
      ],
    }
  }
  if (pathname.startsWith('/wiki')) {
    return {
      label: 'Wiki',
      quickActions: [
        { id: 'qa-docs', label: 'Search Docs', prompt: 'Search the documentation for ', color: '#f97316' },
      ],
    }
  }
  if (pathname.startsWith('/devtools')) {
    return {
      label: 'DevTools',
      quickActions: [
        { id: 'qa-git', label: 'Git Status', prompt: 'Show the git status summary', color: '#f97316' },
        { id: 'qa-test', label: 'Run Tests', prompt: 'Run the test suite', color: '#14b8a6' },
      ],
    }
  }
  return {
    label: 'Dashboard',
    quickActions: [
      { id: 'qa-status', label: 'Project Status', prompt: 'Show the project status overview', color: '#00e5ff' },
      { id: 'qa-help', label: 'What can you do?', prompt: 'What tools and capabilities do you have?', color: '#8b5cf6' },
    ],
  }
}

const DEFAULT_STARTUP_PROMPTS: StartupPrompt[] = [
  { id: 'sp-status', title: 'Project Status', description: 'Get an overview of current progress', prompt: 'Show me the project status and workflow breakdown', color: '#00e5ff' },
  { id: 'sp-features', title: 'My Features', description: 'See features assigned to me', prompt: 'List my assigned features with their current status', color: '#a900ff' },
  { id: 'sp-review', title: 'Review Queue', description: 'Check what needs review', prompt: 'Show the review queue', color: '#f59e0b' },
  { id: 'sp-help', title: 'Help', description: 'Learn what I can do', prompt: 'What can you help me with? List the available tools and capabilities.', color: '#22c55e' },
]

export const LOADING_MESSAGES = [
  'Analyzing your request...',
  'Working on it...',
  'Processing with AI...',
  'Almost there...',
  'Generating response...',
]

// ── Provider Mapping ─────────────────────────────────────────

function providerToAIProvider(provider: string): AIModel['provider'] {
  const p = provider.toLowerCase()
  if (p.includes('claude') || p.includes('anthropic')) return 'anthropic'
  if (p.includes('openai') || p.includes('gpt')) return 'openai'
  if (p.includes('gemini') || p.includes('google')) return 'google'
  if (p.includes('ollama')) return 'ollama'
  if (p.includes('grok')) return 'grok'
  if (p.includes('deepseek')) return 'deepseek'
  if (p.includes('perplexity')) return 'perplexity'
  if (p.includes('qwen')) return 'qwen'
  if (p.includes('kimi')) return 'kimi'
  return 'custom'
}

// ── Hook ─────────────────────────────────────────────────────

export function useCopilotChat() {
  const pathname = usePathname()
  const authUser = useAuthStore(s => s.user)

  const {
    copilotOpen, copilotSessionId, sessions, accounts,
    sendingSessionIds, typingStatus, selectedModelId, chatMode, showThinking,
    copilotMode, userStartupPrompts, userQuickActions,
    setCopilotOpen, setCopilotSessionId,
    setSelectedModelId, setChatMode, setShowThinking,
    setCopilotMode, renameSession,
  } = useChatStore()

  const {
    connected, sendMessage, createSession, deleteSession, stopSession,
    loadSession, respondPermission,
  } = useChatMCP()

  // Load session messages when copilot session changes
  useEffect(() => {
    if (connected && copilotSessionId) {
      loadSession(copilotSessionId)
    }
  }, [connected, copilotSessionId, loadSession])

  // Map store sessions to ChatHeader ChatSession format
  const chatSessions: ChatSession[] = useMemo(() =>
    sessions.map(s => ({
      id: s.id,
      title: s.title || s.id,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
    })),
  [sessions])

  // Build model list: use DEFAULT_MODELS (Claude models) as the selectable models,
  // since accounts represent providers, not individual models.
  const models: AIModel[] = useMemo(() => {
    // Always show the default Claude models as selectable options
    const modelList: AIModel[] = DEFAULT_MODELS.map(m => ({ ...m, configured: true }))

    // Add any non-Claude accounts as additional model entries
    for (const acc of accounts) {
      const provider = providerToAIProvider(acc.provider)
      if (provider !== 'anthropic' && acc.model) {
        modelList.push({
          id: acc.model,
          name: `${acc.name} (${acc.model})`,
          provider,
          providerName: acc.provider,
          configured: true,
        })
      }
    }
    return modelList
  }, [accounts])

  // Auto-select first model if current selection doesn't match any
  useEffect(() => {
    if (models.length > 0 && !models.some(m => m.id === selectedModelId)) {
      setSelectedModelId(models[0].id)
    }
  }, [models, selectedModelId, setSelectedModelId])

  // Current session data
  const activeSession = useChatStore(s => s.getSession(copilotSessionId ?? ''))
  const messages = activeSession?.messages ?? []
  const isSending = copilotSessionId ? sendingSessionIds.includes(copilotSessionId) : false
  const currentTypingStatus = copilotSessionId ? typingStatus[copilotSessionId] : null

  // Page-specific quick actions + user overrides
  const pageContext = useMemo(() => getPageContext(pathname), [pathname])
  const quickActions = useMemo(() =>
    userQuickActions.length > 0 ? userQuickActions : pageContext.quickActions,
  [userQuickActions, pageContext.quickActions])
  const startupPrompts = useMemo(() =>
    userStartupPrompts.length > 0
      ? userStartupPrompts.map(p => ({ ...p, description: p.description || '' }))
      : DEFAULT_STARTUP_PROMPTS,
  [userStartupPrompts])

  // Ensure a session exists, creating one if needed
  const ensureSession = useCallback(async (): Promise<string | null> => {
    const currentId = useChatStore.getState().copilotSessionId
    if (currentId) return currentId
    if (!connected) return null
    return await createSession()
  }, [connected, createSession])

  // Handle send — auto-create session on first message
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return
    const sessionId = await ensureSession()
    if (!sessionId) return
    sendMessage(sessionId, text)
  }, [ensureSession, sendMessage])

  // Handle stop
  const handleStop = useCallback(() => {
    if (copilotSessionId) stopSession(copilotSessionId)
  }, [copilotSessionId, stopSession])

  // Handle new chat
  const handleNewChat = useCallback(async () => {
    if (!connected) return
    await createSession()
  }, [connected, createSession])

  // Handle session select
  const handleSessionSelect = useCallback((id: string) => {
    setCopilotSessionId(id)
  }, [setCopilotSessionId])

  // Handle session delete
  const handleSessionDelete = useCallback((id: string) => {
    deleteSession(id)
  }, [deleteSession])

  // Handle session rename
  const handleSessionRename = useCallback((id: string, title: string) => {
    renameSession(id, title)
  }, [renameSession])

  // Handle question answers
  const handleQuestionAnswer = useCallback((requestId: string, answers: Record<string, string>) => {
    const answerJson = JSON.stringify({ answers })
    respondPermission(requestId, 'approve', answerJson)
    clearActiveQuestionId()

    const sid = copilotSessionId
    if (sid) {
      useChatStore.getState().setTypingStatus(sid, 'Processing...')
      const session = useChatStore.getState().sessions.find(s => s.id === sid)
      if (session) {
        for (const msg of session.messages) {
          const qEvent = msg.events?.find(e => (e as any).requestId === requestId)
          if (qEvent) {
            useChatStore.getState().updateEvent(sid, msg.id, qEvent.id, {
              status: 'done',
              answers,
            } as any)
            break
          }
        }
      }
    }
  }, [respondPermission, copilotSessionId])

  // Handle permission approve/deny
  const handlePermissionDecision = useCallback((requestId: string, decision: 'approve' | 'deny') => {
    respondPermission(requestId, decision)

    const sid = copilotSessionId
    if (sid) {
      useChatStore.getState().setTypingStatus(sid, decision === 'approve' ? 'Processing...' : null)
      const session = useChatStore.getState().sessions.find(s => s.id === sid)
      if (session) {
        for (const msg of session.messages) {
          const permEvent = msg.events?.find(e => (e as any).requestId === requestId)
          if (permEvent) {
            useChatStore.getState().updateEvent(sid, msg.id, permEvent.id, {
              status: 'done',
              decision: decision === 'approve' ? 'approved' : 'denied',
            } as any)
            break
          }
        }
      }
    }
  }, [respondPermission, copilotSessionId])

  // Handle opening — auto-create session if none exists
  const handleToggle = useCallback(async () => {
    if (!copilotOpen) {
      setCopilotOpen(true)
      if (!copilotSessionId && sessions.length > 0) {
        setCopilotSessionId(sessions[0].id)
      } else if (!copilotSessionId && connected) {
        await ensureSession()
      }
    } else {
      setCopilotOpen(false)
    }
  }, [copilotOpen, copilotSessionId, sessions, connected, setCopilotOpen, setCopilotSessionId, ensureSession])

  // Expand to fullscreen
  const handleExpand = useCallback(() => {
    setCopilotMode('fullscreen')
  }, [setCopilotMode])

  // Collapse back to bubble
  const handleCollapse = useCallback(() => {
    setCopilotMode('bubble')
  }, [setCopilotMode])

  // User info for avatars
  const userName = authUser?.name || 'You'
  const userAvatarUrl = authUser?.avatar_url || undefined

  return {
    // State
    connected, copilotOpen, copilotSessionId, copilotMode,
    chatSessions, models, messages, isSending, currentTypingStatus,
    selectedModelId, chatMode, showThinking,
    quickActions, startupPrompts, pageContext,
    sessions, userName, userAvatarUrl,

    // Actions
    handleSend, handleStop, handleNewChat,
    handleSessionSelect, handleSessionDelete, handleSessionRename,
    handleQuestionAnswer, handlePermissionDecision,
    handleToggle, handleExpand, handleCollapse,
    setSelectedModelId, setChatMode, setShowThinking,
    setCopilotOpen, setCopilotMode,
  }
}
