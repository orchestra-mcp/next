'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useMCP } from '@/hooks/useMCP'

interface SmartActionBarProps {
  open: boolean
  onClose: () => void
  context?: {
    featureId?: string
    featureTitle?: string
    projectSlug?: string
  }
}

type CreationPhase = 'idle' | 'sending' | 'processing' | 'creating' | 'done' | 'error'

const TYPE_PILLS = [
  { label: 'Feature', icon: 'bx-rocket' },
  { label: 'Note', icon: 'bx-note' },
  { label: 'Doc', icon: 'bx-file' },
  { label: 'Skill', icon: 'bx-terminal' },
  { label: 'Agent', icon: 'bx-bot' },
] as const

const PHASE_MESSAGES: Record<Exclude<CreationPhase, 'idle' | 'error'>, string> = {
  sending: 'Sending to workspace...',
  processing: 'AI is processing...',
  creating: 'Creating content...',
  done: 'Done! Item will appear shortly via sync.',
}

const QUICK_ACTIONS = [
  { key: 'start', label: 'Start Feature', icon: 'bx-play', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' },
  { key: 'test', label: 'Run Tests', icon: 'bx-test-tube', color: '#00e5ff', bgColor: 'rgba(0, 229, 255, 0.1)', borderColor: 'rgba(0, 229, 255, 0.2)' },
  { key: 'docs', label: 'Write Docs', icon: 'bx-file', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
  { key: 'sync', label: 'Sync', icon: 'bx-refresh', color: '#a900ff', bgColor: 'rgba(169, 0, 255, 0.1)', borderColor: 'rgba(169, 0, 255, 0.2)' },
  { key: 'status', label: 'Status', icon: 'bx-info-circle', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)', borderColor: 'rgba(100, 116, 139, 0.2)' },
] as const

export function SmartActionBar({ open, onClose, context }: SmartActionBarProps) {
  const { callTool, status } = useMCP()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<CreationPhase>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null)

  const connected = status === 'connected'

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (open) {
      setPhase('idle')
      setErrorMessage('')
      setPrompt('')
      setActiveQuickAction(null)
      // Small delay to allow the DOM to render before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Clean up phase timers on unmount or close
  useEffect(() => {
    if (!open) {
      phaseTimersRef.current.forEach(clearTimeout)
      phaseTimersRef.current = []
    }
  }, [open])

  const clearPhaseTimers = useCallback(() => {
    phaseTimersRef.current.forEach(clearTimeout)
    phaseTimersRef.current = []
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || !connected || phase === 'sending' || phase === 'processing' || phase === 'creating') return

    setPhase('sending')
    setErrorMessage('')
    clearPhaseTimers()

    // Progressive status messages
    const t1 = setTimeout(() => setPhase('processing'), 1000)
    const t2 = setTimeout(() => setPhase('creating'), 3000)
    phaseTimersRef.current = [t1, t2]

    try {
      await callTool('ai_prompt', { prompt: prompt.trim(), wait: true }, 120000)

      clearPhaseTimers()
      setPhase('done')

      // Auto-close after showing success
      const closeTimer = setTimeout(() => {
        onClose()
      }, 2200)
      phaseTimersRef.current = [closeTimer]
    } catch (e) {
      clearPhaseTimers()
      setPhase('error')
      setErrorMessage((e as Error).message || 'Something went wrong. Please try again.')
    }
  }, [prompt, connected, phase, callTool, clearPhaseTimers, onClose])

  const handleQuickAction = useCallback(async (actionKey: string) => {
    const contextFree = actionKey === 'sync' || actionKey === 'status'
    if (!connected || (!context && !contextFree) || isActive || activeQuickAction) return

    setActiveQuickAction(actionKey)
    setErrorMessage('')

    try {
      if (actionKey === 'start' && context?.featureId) {
        await callTool('set_current_feature', { feature_id: context.featureId }, 30000)
      } else if (actionKey === 'test' && context?.projectSlug) {
        await callTool('ai_prompt', { prompt: 'Run tests for project ' + context.projectSlug, wait: true }, 120000)
      } else if (actionKey === 'docs' && context?.featureId) {
        await callTool('ai_prompt', { prompt: 'Write documentation for feature ' + context.featureId, wait: true }, 120000)
      } else if (actionKey === 'sync') {
        await callTool('sync_now', {}, 30000)
      } else if (actionKey === 'status') {
        await callTool('sync_status', {}, 15000)
      }
      setActiveQuickAction(null)
    } catch (e) {
      setActiveQuickAction(null)
      setErrorMessage((e as Error).message || 'Quick action failed.')
      setPhase('error')
    }
  }, [connected, context, callTool, phase])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  if (!open) return null

  const isActive = phase === 'sending' || phase === 'processing' || phase === 'creating'
  const showGradientBorder = isActive || phase === 'done'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={e => {
          if (e.target === e.currentTarget && !isActive) onClose()
        }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 10010,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '18vh',
          animation: 'smartActionFadeIn 0.18s ease',
        }}
      >
        {/* Gradient border wrapper */}
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            padding: showGradientBorder ? 2 : 1,
            borderRadius: 18,
            background: showGradientBorder
              ? 'linear-gradient(135deg, #a900ff, #00e5ff)'
              : 'rgba(255, 255, 255, 0.08)',
            animation: 'smartActionScaleIn 0.2s ease',
            transition: 'background 0.3s ease, padding 0.3s ease',
          }}
        >
          {/* Card */}
          <div
            style={{
              background: '#1a1520',
              borderRadius: 16,
              padding: '24px 24px 20px',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(169, 0, 255, 0.2), rgba(0, 229, 255, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <i className="bx bx-terminal" style={{ fontSize: 18, color: '#a900ff' }} />
                </div>
                <span style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f8f8f8',
                  letterSpacing: '-0.01em',
                }}>
                  Smart Actions
                </span>
              </div>
              <button
                onClick={onClose}
                disabled={isActive}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.3)',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  opacity: isActive ? 0.3 : 1,
                }}
              >
                <i className="bx bx-x" />
              </button>
            </div>

            {/* Context bar */}
            {context?.featureTitle && (
              <div style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(169, 0, 255, 0.06)',
                border: '1px solid rgba(169, 0, 255, 0.1)',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <i className="bx bx-git-branch" style={{ fontSize: 14, color: 'rgba(169, 0, 255, 0.6)', flexShrink: 0 }} />
                <span style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 500,
                }}>
                  Working on:
                </span>
                <span style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {context.featureTitle}
                </span>
              </div>
            )}

            {/* Quick action buttons */}
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}>
              {QUICK_ACTIONS.map(action => {
                const contextFree = action.key === 'sync' || action.key === 'status'
                // Hide context-dependent actions when no context is provided.
                if (!contextFree && !context) return null
                const isRunning = activeQuickAction === action.key
                const isDisabled = !connected || (isActive && !isRunning) || (!!activeQuickAction && !isRunning)
                  return (
                    <button
                      key={action.key}
                      onClick={() => handleQuickAction(action.key)}
                      disabled={isDisabled}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 20,
                        background: isRunning ? action.bgColor : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isRunning ? action.borderColor : 'rgba(255, 255, 255, 0.06)'}`,
                        fontSize: 11,
                        fontWeight: 600,
                        color: isRunning ? action.color : 'rgba(255, 255, 255, 0.5)',
                        letterSpacing: '0.01em',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled && !isRunning ? 0.4 : 1,
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        if (!isDisabled) {
                          e.currentTarget.style.background = action.bgColor
                          e.currentTarget.style.borderColor = action.borderColor
                          e.currentTarget.style.color = action.color
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isDisabled && !isRunning) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                        }
                      }}
                    >
                      {isRunning ? (
                        <span style={{
                          width: 12,
                          height: 12,
                          border: `2px solid ${action.borderColor}`,
                          borderTopColor: action.color,
                          borderRadius: '50%',
                          animation: 'smartActionSpin 0.7s linear infinite',
                          flexShrink: 0,
                        }} />
                      ) : (
                        <i className={`bx ${action.icon}`} style={{ fontSize: 13 }} />
                      )}
                      {action.label}
                    </button>
                  )
                })}
            </div>

            {/* Not connected warning */}
            {!connected && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
                fontSize: 13,
                color: '#f59e0b',
              }}>
                <i className="bx bx-wifi-off" style={{ fontSize: 16, flexShrink: 0 }} />
                <span>Connect a workspace tunnel to use Smart Actions</span>
              </div>
            )}

            {/* Input area */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to create?"
                disabled={!connected || isActive}
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#f8f8f8',
                  fontSize: 15,
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  opacity: !connected ? 0.4 : 1,
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(169, 0, 255, 0.3)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
                }}
              />
              {/* Submit button inside input */}
              {connected && prompt.trim() && !isActive && phase !== 'done' && (
                <button
                  onClick={handleSubmit}
                  style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #a900ff, #00e5ff)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <i className="bx bx-right-arrow-alt" />
                </button>
              )}
            </div>

            {/* Type pills */}
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}>
              {TYPE_PILLS.map(pill => (
                <span
                  key={pill.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '0.01em',
                  }}
                >
                  <i className={`bx ${pill.icon}`} style={{ fontSize: 13 }} />
                  {pill.label}
                </span>
              ))}
            </div>

            {/* Status area */}
            {phase !== 'idle' && phase !== 'error' && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: phase === 'done'
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'rgba(169, 0, 255, 0.06)',
                border: phase === 'done'
                  ? '1px solid rgba(34, 197, 94, 0.15)'
                  : '1px solid rgba(169, 0, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 14,
                transition: 'background 0.3s ease, border-color 0.3s ease',
              }}>
                {phase === 'done' ? (
                  <i className="bx bx-check-circle" style={{ fontSize: 16, color: '#22c55e', flexShrink: 0 }} />
                ) : (
                  <span style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(169, 0, 255, 0.3)',
                    borderTopColor: '#a900ff',
                    borderRadius: '50%',
                    animation: 'smartActionSpin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                )}
                <span style={{
                  fontSize: 13,
                  color: phase === 'done' ? '#22c55e' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 500,
                }}>
                  {PHASE_MESSAGES[phase]}
                </span>
              </div>
            )}

            {/* Error area */}
            {phase === 'error' && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 14,
              }}>
                <i className="bx bx-error-circle" style={{ fontSize: 16, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, marginBottom: 2 }}>
                    Failed to create
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(239, 68, 68, 0.7)', lineHeight: 1.4 }}>
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255, 255, 255, 0.2)' }}>
                  <kbd style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'inherit',
                  }}>
                    Enter
                  </kbd>
                  to send
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255, 255, 255, 0.2)' }}>
                  <kbd style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'inherit',
                  }}>
                    Esc
                  </kbd>
                  to close
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255, 255, 255, 0.2)' }}>
                  <kbd style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'inherit',
                  }}>
                    Shift+Enter
                  </kbd>
                  new line
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.15)',
              }}>
                <i className="bx bx-cloud" style={{ fontSize: 12 }} />
                via MCP tunnel
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes smartActionFadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes smartActionScaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-8px) }
          to { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes smartActionSpin {
          to { transform: rotate(360deg) }
        }
      `}</style>
    </>
  )
}
