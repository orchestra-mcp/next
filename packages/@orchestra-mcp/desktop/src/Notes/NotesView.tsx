import type { ReactNode } from 'react'
import { NotesSidebar } from './NotesSidebar'
import { NotesPreview } from './NotesPreview'
import './NotesView.css'

export interface NotesViewProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  onNewNote: () => void
  activeNote: { id: string; title: string; content: string } | null
  onTitleChange: (id: string, title: string) => void
  onContentChange: (id: string, content: string) => void
  onExport: (id: string, format: 'md' | 'pdf') => void
  onDelete: (id: string) => void
  onSendToNotion?: (id: string) => void
  onSendToAppleNotes?: (id: string) => void
  sidebarOpen?: boolean
  logoSrc?: string
  children: ReactNode
}

export function NotesView({
  searchQuery,
  onSearchChange,
  onNewNote,
  activeNote,
  onTitleChange,
  onContentChange,
  onExport,
  onDelete,
  onSendToNotion,
  onSendToAppleNotes,
  sidebarOpen = true,
  logoSrc,
  children,
}: NotesViewProps) {
  return (
    <div className="notes-view">
      {sidebarOpen && (
        <NotesSidebar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onNewNote={onNewNote}
        >
          {children}
        </NotesSidebar>
      )}
      <NotesPreview
        note={activeNote}
        onTitleChange={onTitleChange}
        onContentChange={onContentChange}
        onExport={onExport}
        onDelete={onDelete}
        onSendToNotion={onSendToNotion}
        onSendToAppleNotes={onSendToAppleNotes}
        logoSrc={logoSrc}
      />
    </div>
  )
}
