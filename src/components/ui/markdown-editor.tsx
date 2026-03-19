'use client'

import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { OnMount, OnChange } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'

const MonacoEditorDynamic = dynamic(() => import('@monaco-editor/react').then(m => m.default), {
  ssr: false,
  loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4, fontSize: 13 }}>Loading editor...</div>,
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
  isDark?: boolean
}

interface ToolbarAction {
  icon: string
  title: string
  prefix: string
  suffix: string
  block?: boolean
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: 'bx-bold', title: 'Bold', prefix: '**', suffix: '**' },
  { icon: 'bx-italic', title: 'Italic', prefix: '_', suffix: '_' },
  { icon: 'bx-strikethrough', title: 'Strikethrough', prefix: '~~', suffix: '~~' },
  { icon: 'bx-heading', title: 'Heading', prefix: '## ', suffix: '', block: true },
  { icon: 'bx-link', title: 'Link', prefix: '[', suffix: '](url)' },
  { icon: 'bx-code', title: 'Inline code', prefix: '`', suffix: '`' },
  { icon: 'bx-code-block', title: 'Code block', prefix: '```\n', suffix: '\n```', block: true },
  { icon: 'bx-list-ul', title: 'Bullet list', prefix: '- ', suffix: '', block: true },
  { icon: 'bx-list-ol', title: 'Numbered list', prefix: '1. ', suffix: '', block: true },
  { icon: 'bx-quote-left', title: 'Quote', prefix: '> ', suffix: '', block: true },
]

export default function MarkdownEditor({ value, onChange, height = 300, placeholder, isDark = false }: MarkdownEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    if (!value && placeholder) {
      // Set placeholder via aria-label (Monaco doesn't have placeholder natively)
    }
  }, [value, placeholder])

  const handleChange: OnChange = useCallback((val) => {
    onChange(val ?? '')
  }, [onChange])

  const applyAction = useCallback((action: ToolbarAction) => {
    const editor = editorRef.current
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return

    const model = editor.getModel()
    if (!model) return

    const selectedText = model.getValueInRange(selection) || 'text'

    let newText: string
    if (action.block && selection.startColumn === 1) {
      newText = `${action.prefix}${selectedText}${action.suffix}`
    } else if (action.block) {
      newText = `\n${action.prefix}${selectedText}${action.suffix}`
    } else {
      newText = `${action.prefix}${selectedText}${action.suffix}`
    }

    editor.executeEdits('markdown-toolbar', [{
      range: selection,
      text: newText,
      forceMoveMarkers: true,
    }])
    editor.focus()
  }, [])

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const toolbarBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  const btnColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)'
  const btnHoverColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'
  const tabActive = '#a900ff'
  const tabInactive = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '4px 8px',
        background: toolbarBg,
        borderBottom: `1px solid ${borderColor}`,
      }}>
        {/* Write / Preview tabs */}
        <button
          type="button"
          onClick={() => setMode('write')}
          style={{
            padding: '4px 10px', borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 12, fontWeight: mode === 'write' ? 600 : 400,
            color: mode === 'write' ? tabActive : tabInactive,
            fontFamily: 'inherit',
          }}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          style={{
            padding: '4px 10px', borderRadius: 6, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 12, fontWeight: mode === 'preview' ? 600 : 400,
            color: mode === 'preview' ? tabActive : tabInactive,
            fontFamily: 'inherit',
          }}
        >
          Preview
        </button>

        <div style={{ width: 1, height: 16, background: borderColor, margin: '0 6px' }} />

        {/* Format buttons */}
        {mode === 'write' && TOOLBAR_ACTIONS.map(action => (
          <button
            key={action.icon}
            type="button"
            title={action.title}
            onClick={() => applyAction(action)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 5, border: 'none',
              background: 'transparent', cursor: 'pointer', color: btnColor,
              fontSize: 16, padding: 0, flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = btnHoverColor; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = btnColor; e.currentTarget.style.background = 'transparent' }}
          >
            <i className={`bx ${action.icon}`} />
          </button>
        ))}
      </div>

      {/* Editor / Preview */}
      {mode === 'write' ? (
        <MonacoEditorDynamic
          height={height}
          language="markdown"
          theme={isDark ? 'vs-dark' : 'vs'}
          value={value}
          onChange={handleChange}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'off',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', 'SF Mono', Monaco, Menlo, monospace",
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
              verticalScrollbarSize: 8,
            },
            folding: false,
            glyphMargin: false,
            lineDecorationsWidth: 12,
            lineNumbersMinChars: 0,
            bracketPairColorization: { enabled: false },
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            parameterHints: { enabled: false },
          }}
        />
      ) : (
        <div
          style={{
            height,
            overflow: 'auto',
            padding: '16px 20px',
            fontSize: 14,
            lineHeight: 1.7,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{
            __html: value
              ? simpleMarkdownToHtml(value)
              : `<span style="opacity:0.4">${placeholder || 'Nothing to preview'}</span>`,
          }}
        />
      )}
    </div>
  )
}

/** Lightweight markdown → HTML for preview (no external dep) */
function simpleMarkdownToHtml(md: string): string {
  return md
    // Code blocks first (before other transforms)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.05);padding:12px;border-radius:6px;overflow-x:auto;font-size:12px;line-height:1.5"><code>$2</code></pre>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:600;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:28px 0 12px">$1</h1>')
    // Bold, italic, strikethrough
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 5px;border-radius:3px;font-size:12px">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#a900ff;text-decoration:none" target="_blank">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #a900ff;padding-left:14px;margin:8px 0;opacity:0.8">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<div style="padding-left:18px;position:relative"><span style="position:absolute;left:6px">•</span>$1</div>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:22px;position:relative"><span style="position:absolute;left:0;font-weight:600;font-size:12px;opacity:0.6">$1.</span>$2</div>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}
