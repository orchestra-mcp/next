import { useRef, useCallback, useMemo } from 'react'
import './NoteBody.css'

export interface NoteBodyProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

interface ToolbarBtn {
  label: string
  title: string
  action: () => void
}

export function NoteBody({ value, onChange, placeholder = 'Start writing...', readOnly = false }: NoteBodyProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const wrap = useCallback((before: string, after: string) => {
    const ta = ref.current
    if (!ta) return
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const sel = value.slice(s, e)
    onChange(value.slice(0, s) + before + sel + after + value.slice(e))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = s + before.length
      ta.selectionEnd = e + before.length
    })
  }, [value, onChange])

  const prefix = useCallback((pfx: string) => {
    const ta = ref.current
    if (!ta) return
    const pos = ta.selectionStart
    const lineStart = value.lastIndexOf('\n', pos - 1) + 1
    onChange(value.slice(0, lineStart) + pfx + value.slice(lineStart))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = pos + pfx.length
      ta.selectionEnd = pos + pfx.length
    })
  }, [value, onChange])

  const handleCode = useCallback(() => {
    const ta = ref.current
    if (!ta) return
    const sel = value.slice(ta.selectionStart, ta.selectionEnd)
    sel.includes('\n') ? wrap('```\n', '\n```') : wrap('`', '`')
  }, [value, wrap])

  const toolbar: ToolbarBtn[] = useMemo(() => [
    { label: 'B', title: 'Bold', action: () => wrap('**', '**') },
    { label: 'I', title: 'Italic', action: () => wrap('*', '*') },
    { label: 'H', title: 'Heading', action: () => prefix('## ') },
    { label: 'UL', title: 'Bullet list', action: () => prefix('- ') },
    { label: 'OL', title: 'Numbered list', action: () => prefix('1. ') },
    { label: '<>', title: 'Code', action: handleCode },
    { label: 'Link', title: 'Link', action: () => wrap('[', '](url)') },
  ], [wrap, prefix, handleCode])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return
    if (e.key === 'b') { e.preventDefault(); wrap('**', '**') }
    else if (e.key === 'i') { e.preventDefault(); wrap('*', '*') }
    else if (e.key === 'k') { e.preventDefault(); wrap('[', '](url)') }
  }, [wrap])

  const wordCount = useMemo(() => value.trim().split(/\s+/).filter(Boolean).length, [value])

  return (
    <div className="note-body">
      <div className="note-body__toolbar" role="toolbar" aria-label="Formatting">
        {toolbar.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className="note-body__toolbar-btn"
            title={btn.title}
            disabled={readOnly}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        className="note-body__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-label="Note content"
      />
      <div className="note-body__footer">
        <span>{wordCount} words</span>
      </div>
    </div>
  )
}
