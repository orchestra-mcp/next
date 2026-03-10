'use client'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { ChatBox } from '@orchestra-mcp/ai/ChatBox'
import { BubbleButton } from '@orchestra-mcp/ai/BubbleButton'
import { ChatHeader } from '@orchestra-mcp/ai/ChatHeader'
import type { ChatSession } from '@orchestra-mcp/ai/ChatHeader'
import type { QuickAction, StartupPrompt, AIModel } from '@orchestra-mcp/ai/types'
import { useChatStore } from '@/store/chat'
import type { CopilotPosition } from '@/store/chat'
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

const STARTUP_PROMPTS: StartupPrompt[] = [
  { id: 'sp-status', title: 'Project Status', description: 'Get an overview of current progress', prompt: 'Show me the project status and workflow breakdown', color: '#00e5ff' },
  { id: 'sp-features', title: 'My Features', description: 'See features assigned to me', prompt: 'List my assigned features with their current status', color: '#a900ff' },
  { id: 'sp-review', title: 'Review Queue', description: 'Check what needs review', prompt: 'Show the review queue', color: '#f59e0b' },
  { id: 'sp-help', title: 'Help', description: 'Learn what I can do', prompt: 'What can you help me with? List the available tools and capabilities.', color: '#22c55e' },
]

const LOADING_MESSAGES = [
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

// ── Drag Hook ────────────────────────────────────────────────

function clampPos(p: CopilotPosition): CopilotPosition {
  if (typeof window === 'undefined') return p
  return {
    x: Math.max(-200, Math.min(p.x, window.innerWidth - 140)),
    y: Math.max(0, Math.min(p.y, window.innerHeight - 100)),
  }
}

function useDrag(
  initialPos: CopilotPosition | null,
  defaultPos: CopilotPosition,
  onDragEnd: (pos: CopilotPosition) => void,
) {
  const [pos, setPos] = useState<CopilotPosition>(() => clampPos(initialPos ?? defaultPos))
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const posRef = useRef(pos)
  posRef.current = pos

  // Sync when store changes externally — always clamp
  useEffect(() => {
    if (initialPos) setPos(clampPos(initialPos))
  }, [initialPos])

  const onDragEndRef = useRef(onDragEnd)
  onDragEndRef.current = onDragEnd

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      const next = clampPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
      posRef.current = next
      setPos(next)
    }
    const onMouseUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      queueMicrotask(() => onDragEndRef.current(posRef.current))
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    offset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [])

  return { pos, onMouseDown, isDragging: dragging }
}

// ── Resize via ResizeObserver ────────────────────────────────

function useObservedResize(
  ref: React.RefObject<HTMLDivElement | null>,
  onResize: (size: { width: number; height: number }) => void,
) {
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          onResizeRef.current({ width: Math.round(width), height: Math.round(height) })
        }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}

// ── Component ────────────────────────────────────────────────

const DEFAULT_BOX_POS: CopilotPosition = { x: -1, y: -1 } // -1 means "compute on mount"
const DEFAULT_BUBBLE_POS: CopilotPosition = { x: -1, y: -1 }

export function CopilotBubble() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const {
    copilotOpen, copilotSessionId, sessions, accounts,
    sendingSessionIds, typingStatus, selectedModelId, chatMode, showThinking,
    copilotPosition, copilotBubblePosition, copilotSize,
    setCopilotOpen, setCopilotSessionId,
    setSelectedModelId, setChatMode, setShowThinking,
    setCopilotPosition, setCopilotBubblePosition, setCopilotSize,
  } = useChatStore()

  const {
    connected, sendMessage, createSession, deleteSession,
    loadSession, respondPermission,
  } = useChatMCP()

  useEffect(() => { setMounted(true) }, [])

  // Compute default positions after mount (needs window dimensions)
  const resolvedBoxPos = useMemo<CopilotPosition>(() => {
    if (!mounted) return { x: 100, y: 100 }
    if (copilotPosition && copilotPosition.x >= 0) return copilotPosition
    return { x: window.innerWidth - copilotSize.width - 24, y: window.innerHeight - copilotSize.height - 80 }
  }, [mounted, copilotPosition, copilotSize])

  const resolvedBubblePos = useMemo<CopilotPosition>(() => {
    if (!mounted) return { x: 100, y: 100 }
    if (copilotBubblePosition && copilotBubblePosition.x >= 0) return copilotBubblePosition
    return { x: window.innerWidth - 76, y: window.innerHeight - 76 }
  }, [mounted, copilotBubblePosition])

  // Drag for the floating box
  const { pos: boxPos, onMouseDown: onBoxDragStart } = useDrag(
    resolvedBoxPos, DEFAULT_BOX_POS,
    useCallback((p: CopilotPosition) => setCopilotPosition(p), [setCopilotPosition]),
  )

  // Resize via native CSS resize + ResizeObserver
  const boxRef = useRef<HTMLDivElement>(null)
  useObservedResize(boxRef, useCallback((s: { width: number; height: number }) => {
    setCopilotSize(s)
  }, [setCopilotSize]))

  // Load session messages when copilot session changes
  useEffect(() => {
    if (connected && copilotSessionId) {
      loadSession(copilotSessionId)
    }
  }, [connected, copilotSessionId, loadSession])

  // Map store sessions to ChatBox ChatSession format
  const chatSessions: ChatSession[] = useMemo(() =>
    sessions.map(s => ({
      id: s.id,
      title: s.title || s.id,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
    })),
  [sessions])

  // Map accounts to AIModel format — use acc.id as the stable key
  const models: AIModel[] = useMemo(() =>
    accounts.map(acc => ({
      id: acc.id,
      name: acc.model ? `${acc.name} (${acc.model})` : acc.name,
      provider: providerToAIProvider(acc.provider),
      providerName: acc.provider,
      configured: true,
    })),
  [accounts])

  // Auto-select first model if current selection doesn't match any account
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

  // Page-specific quick actions
  const pageContext = useMemo(() => getPageContext(pathname), [pathname])

  // Ensure a session exists, creating one if needed (auto-resolves account)
  const ensureSession = useCallback(async (): Promise<string | null> => {
    const currentId = useChatStore.getState().copilotSessionId
    if (currentId) return currentId
    if (!connected) return null
    return await createSession()
  }, [connected, createSession])

  // Handle send — auto-create session on first message
  const handleSend = useCallback(async (text: string) => {
    console.log('[copilot:bubble] handleSend called:', text?.slice(0, 50), { connected, copilotSessionId })
    if (!text.trim()) return
    const sessionId = await ensureSession()
    console.log('[copilot:bubble] ensureSession returned:', sessionId)
    if (!sessionId) return
    console.log('[copilot:bubble] calling sendMessage with session:', sessionId)
    sendMessage(sessionId, text)
  }, [ensureSession, sendMessage, connected, copilotSessionId])

  // Handle new chat (auto-resolves account)
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

  // Handle question answers from ChatBox events
  const handleQuestionAnswer = useCallback((requestId: string, answers: Record<string, string>) => {
    // Send the full answers record as JSON so the backend can construct
    // the correct updatedInput for Claude CLI's permission format.
    const answerJson = JSON.stringify({ answers })
    console.log('[copilot] handleQuestionAnswer:', requestId.slice(0, 8), 'answers:', answers)
    respondPermission(requestId, 'approve', answerJson)

    // Clear the active question tracker so new questions aren't treated as
    // superseding this already-answered one.
    clearActiveQuestionId()

    // Update the QuestionEvent card to show answered state
    const sid = copilotSessionId
    if (sid) {
      // Clear the "Waiting for answer" typing status
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

  // Handle permission approve/deny from PermissionCard buttons
  const handlePermissionDecision = useCallback((requestId: string, decision: 'approve' | 'deny') => {
    console.log('[copilot] handlePermissionDecision:', requestId.slice(0, 8), decision)
    respondPermission(requestId, decision)

    // Update the PermissionEvent card to show the decision
    const sid = copilotSessionId
    if (sid) {
      // Clear the "Waiting for approval" typing status
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

  if (!mounted) return null

  return createPortal(
    <>
      {/* Floating Chat Box */}
      {copilotOpen && (
        <div
          ref={boxRef}
          style={{
            position: 'fixed',
            left: boxPos.x,
            top: boxPos.y,
            width: copilotSize.width,
            height: copilotSize.height,
            minWidth: 340,
            minHeight: 400,
            maxWidth: 800,
            maxHeight: 900,
            zIndex: 41,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.04)',
            overflow: 'hidden',
            resize: 'both',
          }}
        >
          {/* Header with integrated drag handle */}
          <div
            onMouseDown={onBoxDragStart}
            style={{ flexShrink: 0, cursor: 'grab', userSelect: 'none' }}
          >
            {/* Drag indicator */}
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '6px 0 2px',
            }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'var(--color-text-tertiary, rgba(255,255,255,0.15))',
              }} />
            </div>
            {/* Header buttons — stop drag so clicks work */}
            <div onMouseDown={e => e.stopPropagation()} style={{ cursor: 'default' }}>
              <ChatHeader
                title="Orchestra Copilot"
                onClose={() => setCopilotOpen(false)}
                sessions={chatSessions}
                activeSessionId={copilotSessionId}
                onSessionSelect={handleSessionSelect}
                onSessionDelete={handleSessionDelete}
                onNewChat={handleNewChat}
              />
            </div>
          </div>

          {/* Connection banner */}
          {!connected && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(245,158,11,0.08)',
              borderBottom: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: '#f59e0b', flexShrink: 0,
            }}>
              <i className="bx bx-wifi-off" style={{ fontSize: 14 }} />
              No tunnel connected — connect in Tunnels to chat
            </div>
          )}

          {/* ChatBox */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <ChatBox
              messages={messages}
              onSend={handleSend}
              typing={isSending}
              typingStatus={currentTypingStatus ?? undefined}
              sending={isSending}
              disabled={!connected}
              models={models}
              selectedModelId={selectedModelId}
              onModelChange={setSelectedModelId}
              mode={chatMode}
              onModeChange={setChatMode}
              showThinking={showThinking}
              onThinkingToggle={setShowThinking}
              quickActions={pageContext.quickActions}
              startupPrompts={STARTUP_PROMPTS}
              loadingMessages={LOADING_MESSAGES}
              activeSessionId={copilotSessionId}
              onQuestionAnswer={handleQuestionAnswer}
              onPermissionDecision={handlePermissionDecision}
              placeholder={connected ? `Ask about ${pageContext.label}...` : 'Connect a tunnel to start chatting'}
              className="copilot-panel-chatbox"
            />
          </div>

        </div>
      )}

      {/* Floating Bubble Button — hidden when panel is open */}
      {!copilotOpen && (
        <BubbleButton
          icon={<i className="bx bx-bot" style={{ fontSize: 22 }} />}
          expanded={false}
          onToggle={handleToggle}
          tooltip="Orchestra Copilot"
          size="md"
          pulse={connected && sessions.length === 0}
          draggable
          snapToEdge={false}
        />
      )}
    </>,
    document.body,
  )
}
