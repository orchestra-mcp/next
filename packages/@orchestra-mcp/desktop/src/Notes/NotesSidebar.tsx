import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import { EmptyState } from '@orchestra-mcp/ui'
import './NotesSidebar.css'

export interface NotesSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  children: ReactNode
  onNewNote: () => void
}

export function NotesSidebar({ searchQuery, onSearchChange, children, onNewNote }: NotesSidebarProps) {
  return (
    <aside className="notes-sidebar">
      <div className="notes-sidebar__header">
        <h2 className="notes-sidebar__title">Notes</h2>
        <button className="notes-sidebar__new-btn" onClick={onNewNote} aria-label="New note">
          <BoxIcon name="bx-plus" size={18} />
        </button>
      </div>

      <div className="notes-sidebar__search">
        <span className="notes-sidebar__search-icon">
          <BoxIcon name="bx-search" size={16} />
        </span>
        <input
          className="notes-sidebar__search-input"
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {Children.toArray(children).some((c) => isValidElement(c)) ? (
        <div className="notes-sidebar__list">{children}</div>
      ) : (
        <EmptyState
          icon={<BoxIcon name="bx-notepad" size={40} />}
          title="No notes yet"
          description="Create a note to get started"
        />
      )}
    </aside>
  )
}
