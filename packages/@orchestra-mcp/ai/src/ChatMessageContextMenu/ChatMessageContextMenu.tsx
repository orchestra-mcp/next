import type { ReactNode } from 'react'
import { ContextMenu } from '@orchestra-mcp/ui'
import type { ContextMenuItem } from '@orchestra-mcp/ui'
import { BoxIcon } from '@orchestra-mcp/icons'

/** A single action displayed in the chat message context menu. */
export interface ContextMenuAction {
  id: string
  /** BoxIcon name (e.g. 'bx-copy', 'bx-star') */
  icon: string
  label: string
  /** Keyboard shortcut hint (e.g. '⌘C') */
  shortcut?: string
  /** Render with danger/red styling */
  danger?: boolean
  disabled?: boolean
  /** Nested submenu actions */
  children?: ContextMenuAction[]
}

export interface ChatMessageContextMenuProps {
  children: ReactNode
  actions: ContextMenuAction[]
  onAction: (actionId: string) => void
}

function mapActions(actions: ContextMenuAction[]): ContextMenuItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: <BoxIcon name={action.icon} size={15} />,
    shortcut: action.shortcut,
    disabled: action.disabled,
    color: action.danger ? ('danger' as const) : undefined,
    children: action.children ? mapActions(action.children) : undefined,
  }))
}

/**
 * Wrapper around @orchestra-mcp/ui ContextMenu for chat messages.
 * Provides keyboard navigation (Arrow keys, Enter, Escape), ARIA roles,
 * submenus, and danger styling. Wrap any message content as children.
 */
export function ChatMessageContextMenu({
  children,
  actions,
  onAction,
}: ChatMessageContextMenuProps) {
  return (
    <ContextMenu items={mapActions(actions)} onAction={onAction}>
      {children}
    </ContextMenu>
  )
}
