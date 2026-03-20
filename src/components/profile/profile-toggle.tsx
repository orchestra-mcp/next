'use client'

import { useProfileTheme } from './use-profile-theme'

interface ProfileToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function ProfileToggle({
  checked,
  onChange,
  disabled = false,
}: ProfileToggleProps) {
  const { isDark, colors } = useProfileTheme()

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative flex-shrink-0 transition-colors duration-200"
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        border: 'none',
        background: checked
          ? 'linear-gradient(135deg, #00e5ff, #a900ff)'
          : 'var(--color-bg-active, rgba(255,255,255,0.15))',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        className="absolute top-[3px] transition-[left] duration-200"
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          background: '#fff',
          left: checked ? 25 : 3,
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  )
}
