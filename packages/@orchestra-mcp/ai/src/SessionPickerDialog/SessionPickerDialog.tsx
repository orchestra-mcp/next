import { useState, useMemo } from 'react'
import { Modal } from '@orchestra-mcp/ui'
import './SessionPickerDialog.css'

export interface SessionPickerSession {
  id: string
  title: string
  lastMessage?: string
  updatedAt?: string
  icon?: string
}

export interface SessionPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (sessionId: string) => void
  sessions: SessionPickerSession[]
  /** ID to exclude from the list (current session) */
  excludeId?: string
  title?: string
}

export function SessionPickerDialog({
  open,
  onClose,
  onSelect,
  sessions,
  excludeId,
  title = 'Forward to Session',
}: SessionPickerDialogProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const list = excludeId ? sessions.filter((s) => s.id !== excludeId) : sessions
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (s) => s.title.toLowerCase().includes(q) || s.lastMessage?.toLowerCase().includes(q),
    )
  }, [sessions, excludeId, search])

  const handleSelect = (id: string) => {
    setSearch('')
    onSelect(id)
  }

  const handleClose = () => {
    setSearch('')
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title={title} size="medium">
      <div className="session-picker">
        <input
          type="text"
          className="session-picker__search"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <div className="session-picker__list">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className="session-picker__item"
                onClick={() => handleSelect(s.id)}
              >
                <span className="session-picker__item-title">{s.title}</span>
                {s.lastMessage && (
                  <span className="session-picker__item-preview">
                    {s.lastMessage.slice(0, 80)}
                  </span>
                )}
                {s.updatedAt && (
                  <span className="session-picker__item-time">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className="session-picker__empty">No matching sessions</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
