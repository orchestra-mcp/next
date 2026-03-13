'use client'
import { useState } from 'react'

export interface SidebarItemProps {
  id: string
  href: string
  label: string
  description?: string
  icon?: string
  iconColor?: string
  iconBg?: string
  /** Colored dot instead of icon (for tunnels, sessions, plans) */
  dot?: string
  /** First letter badge (for projects) */
  letterBadge?: string
  active?: boolean
  pinned?: boolean
  /** Right-click context menu */
  onContextMenu?: (e: React.MouseEvent) => void
}

export function SidebarItem({
  id, href, label, description, icon, iconColor, iconBg,
  dot, letterBadge, active, pinned, onContextMenu,
}: SidebarItemProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="sidebar-item"
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
        padding: '7px 10px', borderRadius: 8,
        cursor: 'pointer', position: 'relative',
        background: active ? 'var(--color-bg-active)' : hover ? 'var(--color-bg-hover, rgba(255,255,255,0.04))' : 'transparent',
        transition: 'background 0.12s ease',
      }}
    >
      {/* Active indicator removed — background change only */}

      {/* Icon area — 3 modes: dot, letter badge, or icon */}
      {dot ? (
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: dot,
        }} />
      ) : letterBadge ? (
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: iconBg || 'rgba(169,0,255,0.08)',
          border: `1px solid ${iconColor ? `${iconColor}25` : 'rgba(169,0,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: iconColor || '#a900ff',
        }}>
          {letterBadge}
        </div>
      ) : icon ? (
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: iconBg || 'var(--color-bg-alt)',
          border: `1px solid var(--color-border)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`bx ${icon}`} style={{ fontSize: 13, color: iconColor || 'var(--color-fg-muted)' }} />
        </div>
      ) : null}

      {/* Text */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: active ? 500 : 400,
          color: active ? 'var(--color-fg)' : 'var(--color-fg-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))',
            marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {description}
          </div>
        )}
      </div>

      {/* Pin indicator */}
      {pinned && (
        <i className="bx bxs-pin" style={{ fontSize: 11, color: '#00e5ff', flexShrink: 0 }} />
      )}
    </div>
  )
}
