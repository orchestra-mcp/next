import { useCallback } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import './ModeToggle.css'

export type WindowMode = 'embedded' | 'floating' | 'bubble'

export interface ModeToggleProps {
  activeMode: WindowMode
  onModeChange: (mode: WindowMode) => void
  size?: 'sm' | 'md'
}

const MODES: Array<{ id: WindowMode; icon: string; label: string }> = [
  { id: 'embedded', icon: 'bx-dock-bottom', label: 'Embedded' },
  { id: 'floating', icon: 'bx-window-alt', label: 'Floating' },
  { id: 'bubble', icon: 'bx-radio-circle-marked', label: 'Bubble' },
]

export function ModeToggle({ activeMode, onModeChange, size = 'sm' }: ModeToggleProps) {
  const handleClick = useCallback(
    (mode: WindowMode) => () => {
      if (mode !== activeMode) onModeChange(mode)
    },
    [activeMode, onModeChange],
  )

  return (
    <div className={`mode-toggle mode-toggle--${size}`}>
      {MODES.map((m) => (
        <button
          key={m.id}
          className={`mode-toggle__btn${m.id === activeMode ? ' mode-toggle__btn--active' : ''}`}
          onClick={handleClick(m.id)}
          title={m.label}
          aria-label={m.label}
        >
          <BoxIcon name={m.icon} size={size === 'sm' ? 14 : 16} />
        </button>
      ))}
    </div>
  )
}
