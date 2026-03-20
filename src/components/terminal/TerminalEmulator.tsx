'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import '@xterm/xterm/css/xterm.css'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TerminalEmulatorProps {
  url?: string
  className?: string
  style?: React.CSSProperties
}

interface TerminalTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

interface TabDef {
  key: string
  label: string
  icon: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: TabDef[] = [
  { key: 'terminal', label: 'Terminal', icon: 'bx bx-terminal' },
  { key: 'ssh', label: 'SSH', icon: 'bx bx-link' },
  { key: 'claude', label: 'Claude Session', icon: 'bx bx-bot' },
]

const DEFAULT_THEME = {
  background: '#0a0a0a',
  foreground: '#e4e4e7',
  cursor: '#a900ff',
  cursorAccent: '#0a0a0a',
  selectionBackground: 'rgba(169, 0, 255, 0.3)',
  selectionForeground: '#e4e4e7',
  black: '#18181b',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  magenta: '#a900ff',
  cyan: '#00e5ff',
  white: '#e4e4e7',
  brightBlack: '#52525b',
  brightRed: '#f87171',
  brightGreen: '#4ade80',
  brightYellow: '#fbbf24',
  brightBlue: '#60a5fa',
  brightMagenta: '#c084fc',
  brightCyan: '#22d3ee',
  brightWhite: '#fafafa',
}

const WELCOME_LINES = [
  '\x1b[38;2;169;0;255m',
  '  ___           _               _             ',
  ' / _ \\ _ __ ___| |__   ___  ___| |_ _ __ __ _ ',
  '| | | |  __/ __| \'_ \\ / _ \\/ __| __| \'__/ _` |',
  '| |_| | | | (__| | | |  __/\\__ \\ |_| | | (_| |',
  ' \\___/|_|  \\___|_| |_|\\___||___/\\__|_|  \\__,_|',
  '\x1b[0m',
  '',
  '\x1b[1mWelcome to Orchestra Terminal\x1b[0m',
  '',
  '\x1b[2mConnect a tunnel to start a remote session.\x1b[0m',
  '',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readCSSColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return value || fallback
}

function buildTheme(): Record<string, string> {
  return {
    ...DEFAULT_THEME,
    background: readCSSColor('--terminal-bg', DEFAULT_THEME.background),
    foreground: readCSSColor('--terminal-fg', DEFAULT_THEME.foreground),
    cursor: readCSSColor('--terminal-cursor', DEFAULT_THEME.cursor),
    selectionBackground: readCSSColor('--terminal-selection', DEFAULT_THEME.selectionBackground),
  }
}

// ---------------------------------------------------------------------------
// TerminalEmulator
// ---------------------------------------------------------------------------

export function TerminalEmulator({ url, className, style }: TerminalEmulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Stable resize handler
  const handleResize = useCallback(() => {
    const fitAddon = fitAddonRef.current
    const terminal = terminalRef.current
    const ws = wsRef.current

    if (!fitAddon || !terminal) return

    try {
      fitAddon.fit()
    } catch {
      // Container may not be visible yet
      return
    }

    // Notify the remote side about the new dimensions
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'resize',
        cols: terminal.cols,
        rows: terminal.rows,
      }))
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ---- Terminal setup ----
    const terminal = new Terminal({
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      lineHeight: 1.35,
      cursorBlink: true,
      cursorStyle: 'bar',
      theme: buildTheme(),
      allowProposedApi: true,
      scrollback: 5000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    terminal.loadAddon(fitAddon)
    terminal.loadAddon(webLinksAddon)
    terminal.open(container)

    terminalRef.current = terminal
    fitAddonRef.current = fitAddon

    // Initial fit after a frame so the container has dimensions
    requestAnimationFrame(() => {
      try {
        fitAddon.fit()
      } catch {
        // ignore
      }
    })

    // ---- Resize handling ----
    const onWindowResize = () => handleResize()
    window.addEventListener('resize', onWindowResize)

    // Also observe the container itself for layout-driven resizes
    const observer = new ResizeObserver(() => handleResize())
    observer.observe(container)
    resizeObserverRef.current = observer

    // ---- WebSocket connection ----
    let ws: WebSocket | null = null

    if (url) {
      ws = new WebSocket(url)
      wsRef.current = ws

      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        terminal.clear()
        terminal.writeln('\x1b[32mConnected to remote session.\x1b[0m')
        terminal.writeln('')

        // Send initial dimensions
        ws!.send(JSON.stringify({
          type: 'resize',
          cols: terminal.cols,
          rows: terminal.rows,
        }))
      }

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          terminal.write(event.data)
        } else if (event.data instanceof ArrayBuffer) {
          terminal.write(new Uint8Array(event.data))
        }
      }

      ws.onerror = () => {
        terminal.writeln('')
        terminal.writeln('\x1b[31mWebSocket connection error.\x1b[0m')
      }

      ws.onclose = (event) => {
        terminal.writeln('')
        terminal.writeln(
          `\x1b[33mConnection closed${event.reason ? `: ${event.reason}` : ''}.\x1b[0m`
        )
      }

      // Forward terminal input to WebSocket
      terminal.onData((data) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(data)
        }
      })
    } else {
      // No URL — show welcome message
      for (const line of WELCOME_LINES) {
        terminal.writeln(line)
      }
    }

    // ---- Cleanup ----
    return () => {
      window.removeEventListener('resize', onWindowResize)

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }

      if (ws) {
        ws.onopen = null
        ws.onmessage = null
        ws.onerror = null
        ws.onclose = null
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
        wsRef.current = null
      }

      terminal.dispose()
      terminalRef.current = null
      fitAddonRef.current = null
    }
  }, [url, handleResize])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 200,
        background: DEFAULT_THEME.background,
        borderRadius: 8,
        overflow: 'hidden',
        padding: 4,
        boxSizing: 'border-box',
        ...style,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// TerminalTabs
// ---------------------------------------------------------------------------

export function TerminalTabs({ activeTab, onTabChange }: TerminalTabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--color-bg-secondary, #111)',
        borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
        paddingInline: 4,
        height: 38,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              height: '100%',
              background: isActive ? 'var(--color-bg-primary, #0a0a0a)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid #a900ff' : '2px solid transparent',
              color: isActive
                ? 'var(--color-fg, #e4e4e7)'
                : 'var(--color-fg-muted, rgba(255,255,255,0.45))',
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'color 0.15s, background 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <i
              className={tab.icon}
              style={{
                fontSize: 14,
                color: isActive ? '#a900ff' : 'inherit',
              }}
            />
            {tab.label}
          </button>
        )
      })}

      {/* Spacer fills remaining width */}
      <div style={{ flex: 1 }} />
    </div>
  )
}
