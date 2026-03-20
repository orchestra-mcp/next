'use client'
import { useState, useCallback } from 'react'

interface TableExportToolbarProps {
  /** 2D array of cell values: rows × columns */
  data: string[][]
  /** Optional headers (first row) */
  headers?: string[]
}

/**
 * Hover toolbar for tables — export as CSV, markdown table, or plain text.
 * Attach this inside a table wrapper with position: relative.
 */
export default function TableExportToolbar({ data, headers }: TableExportToolbarProps) {
  const [copied, setCopied] = useState(false)

  const allRows = headers ? [headers, ...data] : data

  const toCSV = useCallback(() => {
    return allRows
      .map(row => row.map(cell => {
        const escaped = cell.replace(/"/g, '""')
        return cell.includes(',') || cell.includes('"') || cell.includes('\n')
          ? `"${escaped}"`
          : cell
      }).join(','))
      .join('\n')
  }, [allRows])

  const toMarkdown = useCallback(() => {
    if (allRows.length === 0) return ''
    const header = '| ' + allRows[0].join(' | ') + ' |'
    const separator = '| ' + allRows[0].map(() => '---').join(' | ') + ' |'
    const body = allRows.slice(1)
      .map(row => '| ' + row.join(' | ') + ' |')
      .join('\n')
    return [header, separator, body].join('\n')
  }, [allRows])

  const toPlainText = useCallback(() => {
    return allRows.map(row => row.join('\t')).join('\n')
  }, [allRows])

  const handleExport = useCallback(async (format: 'csv' | 'markdown' | 'text') => {
    let content: string
    let filename: string
    let mimeType: string

    switch (format) {
      case 'csv':
        content = toCSV()
        filename = 'table.csv'
        mimeType = 'text/csv'
        break
      case 'markdown':
        content = toMarkdown()
        filename = 'table.md'
        mimeType = 'text/markdown'
        break
      case 'text':
        content = toPlainText()
        filename = 'table.txt'
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [toCSV, toMarkdown, toPlainText])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(toCSV())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [toCSV])

  return (
    <div
      style={{
        position: 'absolute',
        top: -32,
        right: 0,
        display: 'flex',
        gap: 4,
        opacity: 0,
        transition: 'opacity 0.15s',
        zIndex: 10,
      }}
      className="table-export-toolbar"
    >
      <style>{`
        .table-wrapper:hover .table-export-toolbar { opacity: 1 !important; }
      `}</style>

      <button
        onClick={handleCopy}
        title="Copy as CSV"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)',
          fontSize: 11, cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <button
        onClick={() => handleExport('csv')}
        title="Download CSV"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)',
          fontSize: 11, cursor: 'pointer',
        }}
      >
        CSV
      </button>

      <button
        onClick={() => handleExport('markdown')}
        title="Download Markdown"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)',
          fontSize: 11, cursor: 'pointer',
        }}
      >
        MD
      </button>

      <button
        onClick={() => handleExport('text')}
        title="Download Text"
        style={{
          padding: '4px 8px', borderRadius: 6, border: 'none',
          background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.6)',
          fontSize: 11, cursor: 'pointer',
        }}
      >
        TXT
      </button>
    </div>
  )
}
