'use client'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChatBox } from '@orchestra-mcp/ai/ChatBox'
import { BubbleButton } from '@orchestra-mcp/ai/BubbleButton'
import { ChatHeader } from '@orchestra-mcp/ai/ChatHeader'
import { useChatStore } from '@/store/chat'
import type { CopilotPosition } from '@/store/chat'
import { useCopilotChat, LOADING_MESSAGES } from './useCopilotChat'

// ── Mobile detection ─────────────────────────────────────────

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
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

// ── Bubble icon ──────────────────────────────────────────────

const ICON_MAP: Record<string, string> = {
  bot: 'bx-bot',
  chat: 'bx-message-dots',
  sparkle: 'bx-star',
}

// Claude AI avatar — official Anthropic logo
const ClaudeAvatar = () => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#1a1a1a',
    padding: 4,
  }}>
    <img
      src="/claude-logo.svg"
      alt="Claude"
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  </div>
)

// ── Component ────────────────────────────────────────────────

const DEFAULT_BOX_POS: CopilotPosition = { x: -1, y: -1 }

export function CopilotBubble() {
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()

  const {
    copilotPosition, copilotBubblePosition, copilotSize, chatIconStyle,
    setCopilotPosition, setCopilotBubblePosition, setCopilotSize,
  } = useChatStore()

  const {
    connected, copilotOpen, copilotSessionId, copilotMode,
    chatSessions, models, messages, isSending, currentTypingStatus,
    selectedModelId, chatMode, showThinking,
    quickActions, startupPrompts, pageContext, commandItems, mentionItems, sessions,
    userName, userAvatarUrl,

    handleSend, handleStop, handleNewChat,
    handleSessionSelect, handleSessionDelete, handleSessionRename,
    handleQuestionAnswer, handlePermissionDecision,
    handleToggle, handleExpand, handleCollapse,
    setSelectedModelId, setChatMode, setShowThinking,
    setCopilotOpen, setCopilotMode,
  } = useCopilotChat()

  useEffect(() => { setMounted(true) }, [])

  // Auto-fullscreen on mobile
  useEffect(() => {
    if (isMobile && copilotOpen && copilotMode === 'bubble') {
      setCopilotMode('fullscreen')
    }
  }, [isMobile, copilotOpen, copilotMode, setCopilotMode])

  // ESC key: stop session or collapse non-bubble modes
  useEffect(() => {
    if (!copilotOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // If actively sending, ChatInput handles ESC → onStop internally.
      // If not sending but in non-bubble mode, collapse back to bubble.
      if (!isSending && copilotMode !== 'bubble') {
        e.preventDefault()
        setCopilotMode('bubble')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [copilotOpen, isSending, copilotMode, setCopilotMode])

  // Compute default positions after mount
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

  // Drag for floating box (bubble mode only)
  const { pos: boxPos, onMouseDown: onBoxDragStart } = useDrag(
    resolvedBoxPos, DEFAULT_BOX_POS,
    useCallback((p: CopilotPosition) => setCopilotPosition(p), [setCopilotPosition]),
  )

  // Resize via native CSS resize + ResizeObserver
  const boxRef = useRef<HTMLDivElement>(null)
  useObservedResize(boxRef, useCallback((s: { width: number; height: number }) => {
    setCopilotSize(s)
  }, [setCopilotSize]))

  const bubbleIcon = ICON_MAP[chatIconStyle] || 'bx-bot'

  // Real user avatar — photo or initials
  const userAvatar = useMemo(() => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-active, rgba(255,255,255,0.08))',
      color: 'var(--brand-purple, #a900ff)',
      fontSize: 13, fontWeight: 600,
      overflow: 'hidden',
    }}>
      {userAvatarUrl ? (
        <img src={userAvatarUrl} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span>{userName?.[0]?.toUpperCase() || 'U'}</span>
      )}
    </div>
  ), [userName, userAvatarUrl])

  if (!mounted) return null

  // Fullscreen mode: rendered by layout.tsx via CopilotPanel — portal only shows bubble when closed
  if (copilotMode === 'fullscreen' && copilotOpen) {
    return null
  }

  // Build shared chat content
  const chatContent = (
    <>
      <ChatHeader
        title="Orchestra Copilot"
        onClose={() => setCopilotOpen(false)}
        onExpand={handleExpand}
        onCollapse={copilotMode !== 'bubble' ? handleCollapse : undefined}
        dockMode={copilotMode}
        sessions={chatSessions}
        activeSessionId={copilotSessionId}
        onSessionSelect={handleSessionSelect}
        onSessionDelete={handleSessionDelete}
        onSessionRename={handleSessionRename}
        onNewChat={handleNewChat}
      />

      {!connected && (
        <div style={{
          padding: '8px 16px',
          background: 'color-mix(in srgb, var(--color-warning, #f59e0b) 8%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 20%, transparent)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--color-warning, #f59e0b)', flexShrink: 0,
        }}>
          <i className="bx bx-wifi-off" style={{ fontSize: 14 }} />
          No tunnel connected — connect in Tunnels to chat
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ChatBox
          messages={messages}
          onSend={handleSend}
          onStop={handleStop}
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
          quickActions={quickActions}
          startupPrompts={startupPrompts}
          commandItems={commandItems}
          mentionItems={mentionItems}
          loadingMessages={LOADING_MESSAGES}
          activeSessionId={copilotSessionId}
          onQuestionAnswer={handleQuestionAnswer}
          onPermissionDecision={handlePermissionDecision}
          placeholder={connected ? `Ask about ${pageContext.label}...` : 'Connect a tunnel to start chatting'}
          userName={userName}
          assistantName="Claude"
          userAvatar={userAvatar}
          assistantAvatar={<ClaudeAvatar />}
          className="copilot-panel-chatbox"
        />
      </div>
    </>
  )

  // ── Mode-specific wrappers ─────────────────────────────────

  const renderBubbleMode = () => (
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
      {/* Drag handle */}
      <div
        onMouseDown={onBoxDragStart}
        style={{ flexShrink: 0, cursor: 'grab', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--color-text-tertiary, rgba(255,255,255,0.15))',
          }} />
        </div>
      </div>
      {/* Header buttons — stop drag so clicks work */}
      <div style={{ flexShrink: 0 }}>
        <ChatHeader
          title="Orchestra Copilot"
          onClose={() => setCopilotOpen(false)}
          onExpand={handleExpand}
          dockMode={copilotMode}
          sessions={chatSessions}
          activeSessionId={copilotSessionId}
          onSessionSelect={handleSessionSelect}
          onSessionDelete={handleSessionDelete}
          onSessionRename={handleSessionRename}
          onNewChat={handleNewChat}
        />
      </div>

      {!connected && (
        <div style={{
          padding: '8px 16px',
          background: 'color-mix(in srgb, var(--color-warning, #f59e0b) 8%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 20%, transparent)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--color-warning, #f59e0b)', flexShrink: 0,
        }}>
          <i className="bx bx-wifi-off" style={{ fontSize: 14 }} />
          No tunnel connected — connect in Tunnels to chat
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ChatBox
          messages={messages}
          onSend={handleSend}
          onStop={handleStop}
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
          quickActions={quickActions}
          startupPrompts={startupPrompts}
          commandItems={commandItems}
          mentionItems={mentionItems}
          loadingMessages={LOADING_MESSAGES}
          activeSessionId={copilotSessionId}
          onQuestionAnswer={handleQuestionAnswer}
          onPermissionDecision={handlePermissionDecision}
          placeholder={connected ? `Ask about ${pageContext.label}...` : 'Connect a tunnel to start chatting'}
          userName={userName}
          assistantName="Claude"
          userAvatar={userAvatar}
          assistantAvatar={<ClaudeAvatar />}
          className="copilot-panel-chatbox"
        />
      </div>
    </div>
  )

  const renderSideoverMode = () => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isMobile ? '100%' : 420,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        borderLeft: isMobile ? 'none' : '1px solid var(--color-border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {chatContent}
    </div>
  )

  const renderModalMode = () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setCopilotOpen(false)}
      />
      {/* Modal box */}
      <div
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: 720,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          boxShadow: '0 16px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        {chatContent}
      </div>
    </div>
  )

  return createPortal(
    <>
      {copilotOpen && copilotMode === 'bubble' && renderBubbleMode()}
      {copilotOpen && copilotMode === 'sideover' && renderSideoverMode()}
      {copilotOpen && copilotMode === 'modal' && renderModalMode()}

      {/* Floating Bubble Button — hidden when panel is open */}
      {!copilotOpen && (
        <BubbleButton
          icon={<i className={`bx ${bubbleIcon}`} style={{ fontSize: 22 }} />}
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
