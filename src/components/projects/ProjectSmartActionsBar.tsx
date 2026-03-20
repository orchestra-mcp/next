'use client'

import { useState } from 'react'
import { useMCP } from '@/hooks/useMCP'
import { SmartActionBar } from '@/components/smart-action-bar'

interface ProjectSmartActionsBarProps {
  projectSlug: string
  projectName?: string
}

/**
 * A toolbar strip shown at the top of authenticated project pages.
 * Provides one-click smart actions that dispatch to the connected desktop
 * via the reverse tunnel: Create Feature, Run Tests, Write Docs.
 *
 * Falls back to a "Connect a tunnel" note when no tunnel is connected.
 */
export function ProjectSmartActionsBar({ projectSlug, projectName }: ProjectSmartActionsBarProps) {
  const { status } = useMCP()
  const connected = status === 'connected'

  const [barOpen, setBarOpen] = useState(false)
  const [barContext, setBarContext] = useState<{ featureId?: string; featureTitle?: string; projectSlug?: string } | undefined>()

  const openWith = (preset?: { featureId?: string; featureTitle?: string }) => {
    setBarContext({ projectSlug, ...preset })
    setBarOpen(true)
  }

  const BUTTONS = [
    {
      key: 'create',
      label: 'Create Feature',
      icon: 'bx-plus',
      color: '#a900ff',
      bg: 'rgba(169, 0, 255, 0.08)',
      border: 'rgba(169, 0, 255, 0.18)',
      hoverColor: '#a900ff',
      preset: undefined,
    },
    {
      key: 'tests',
      label: 'Run Tests',
      icon: 'bx-test-tube',
      color: '#00e5ff',
      bg: 'rgba(0, 229, 255, 0.08)',
      border: 'rgba(0, 229, 255, 0.18)',
      hoverColor: '#00e5ff',
      preset: undefined,
    },
    {
      key: 'docs',
      label: 'Write Docs',
      icon: 'bx-file',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.18)',
      hoverColor: '#f59e0b',
      preset: undefined,
    },
  ] as const

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 0',
        flexWrap: 'wrap',
      }}>
        {/* Label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginRight: 4,
        }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: connected
              ? 'linear-gradient(135deg, rgba(169,0,255,0.15), rgba(0,229,255,0.15))'
              : 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i
              className="bx bx-bolt"
              style={{
                fontSize: 13,
                color: connected ? '#a900ff' : 'rgba(255,255,255,0.2)',
              }}
            />
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: connected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Smart Actions
          </span>
        </div>

        {/* Action buttons */}
        {BUTTONS.map(btn => (
          <SmartActionButton
            key={btn.key}
            label={btn.label}
            icon={btn.icon}
            color={btn.color}
            bg={btn.bg}
            border={btn.border}
            disabled={!connected}
            onClick={() => openWith(btn.preset)}
          />
        ))}

        {/* Not connected note */}
        {!connected && (
          <span style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.2)',
            marginLeft: 4,
          }}>
            — Connect a workspace tunnel to enable
          </span>
        )}
      </div>

      <SmartActionBar
        open={barOpen}
        onClose={() => setBarOpen(false)}
        context={barContext}
      />
    </>
  )
}

interface SmartActionButtonProps {
  label: string
  icon: string
  color: string
  bg: string
  border: string
  disabled: boolean
  onClick: () => void
}

function SmartActionButton({ label, icon, color, bg, border, disabled, onClick }: SmartActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 13px',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.background = bg
        e.currentTarget.style.borderColor = border
        e.currentTarget.style.color = color
      }}
      onMouseLeave={e => {
        if (disabled) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
      }}
    >
      <i className={`bx ${icon}`} style={{ fontSize: 13 }} />
      {label}
    </button>
  )
}
