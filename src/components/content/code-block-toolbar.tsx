'use client'
import { useState, useCallback } from 'react'

interface CodeBlockToolbarProps {
  code: string
  language?: string
}

/**
 * Hover toolbar for code blocks — copy to clipboard, download as file,
 * and export as image (captures the parent pre element via html2canvas).
 */
export default function CodeBlockToolbar({ code, language }: CodeBlockToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const handleDownload = useCallback(() => {
    const ext = language || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [code, language])

  const handleExportImage = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues.
      const html2canvas = (await import('html2canvas')).default
      // Find the closest <pre> element from the toolbar's parent.
      const toolbar = document.querySelector('[data-code-toolbar="active"]')
      const pre = toolbar?.closest('pre')
      if (!pre) return

      const canvas = await html2canvas(pre as HTMLElement, {
        backgroundColor: '#1e1e2e',
        scale: 2,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `code-${language || 'snippet'}.png`
      a.click()
    } catch {
      // html2canvas not available — fallback to copy.
      await handleCopy()
    }
  }, [language, handleCopy])

  return (
    <div
      data-code-toolbar="active"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 4,
        opacity: 0,
        transition: 'opacity 0.15s',
        zIndex: 10,
      }}
      className="code-block-toolbar"
    >
      <style>{`
        pre:hover .code-block-toolbar { opacity: 1 !important; }
      `}</style>

      {language && (
        <span style={{
          fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '4px 8px',
          userSelect: 'none',
        }}>
          {language}
        </span>
      )}

      <button
        onClick={handleCopy}
        title="Copy code"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          fontSize: 12, cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <button
        onClick={handleDownload}
        title="Download as file"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          fontSize: 12, cursor: 'pointer',
        }}
      >
        File
      </button>

      <button
        onClick={handleExportImage}
        title="Export as image"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
          fontSize: 12, cursor: 'pointer',
        }}
      >
        Image
      </button>
    </div>
  )
}
