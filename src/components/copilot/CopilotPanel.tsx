'use client'
import { useMemo } from 'react'
import { ChatBox } from '@orchestra-mcp/ai/ChatBox'
import { ChatHeader } from '@orchestra-mcp/ai/ChatHeader'
import { useCopilotChat, LOADING_MESSAGES } from './useCopilotChat'

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

export function CopilotPanel() {
  const {
    connected, copilotSessionId, copilotMode,
    chatSessions, models, messages, isSending, currentTypingStatus,
    selectedModelId, chatMode, showThinking,
    quickActions, startupPrompts, pageContext, commandItems, mentionItems,
    userName, userAvatarUrl,

    handleSend, handleStop, handleNewChat,
    handleSessionSelect, handleSessionDelete, handleSessionRename,
    handleQuestionAnswer, handlePermissionDecision,
    handleCollapse,
    setSelectedModelId, setChatMode, setShowThinking,
    setCopilotOpen,
  } = useCopilotChat()

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ChatHeader
        title="Orchestra Copilot"
        onClose={() => { setCopilotOpen(false); handleCollapse(); }}
        onCollapse={handleCollapse}
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
    </div>
  )
}
