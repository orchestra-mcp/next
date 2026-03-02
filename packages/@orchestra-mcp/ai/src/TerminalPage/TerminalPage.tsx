"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { TerminalSession } from '../hooks/useTerminalSessions';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TerminalPage.css';

export interface TerminalPageProps {
  /** The active terminal session to display */
  session: TerminalSession;
  /** All sessions for the tab sidebar */
  sessions?: TerminalSession[];
  /** Called when user switches tabs */
  onSelectSession?: (sessionId: string) => void;
  /** Called when user closes a session tab */
  onCloseSession?: (sessionId: string) => void;
  /** Called when user clicks back/close */
  onBack?: () => void;
  className?: string;
}

// ---- ANSI parser (shared with BashCard) ----

interface AnsiSpan {
  text: string;
  fg?: string;
  bold?: boolean;
  dim?: boolean;
}

const ANSI_COLORS: Record<number, string> = {
  30: '#1e1e1e', 31: '#e06c75', 32: '#98c379', 33: '#e5c07b',
  34: '#61afef', 35: '#c678dd', 36: '#56b6c2', 37: '#abb2bf',
  90: '#5c6370', 91: '#e06c75', 92: '#98c379', 93: '#e5c07b',
  94: '#61afef', 95: '#c678dd', 96: '#56b6c2', 97: '#ffffff',
};

function parseAnsi(text: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;
  let lastIdx = 0;
  let fg: string | undefined;
  let bold = false;
  let dim = false;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) {
      spans.push({ text: text.slice(lastIdx, match.index), fg, bold, dim });
    }
    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) { fg = undefined; bold = false; dim = false; }
      else if (code === 1) bold = true;
      else if (code === 2) dim = true;
      else if (code === 22) { bold = false; dim = false; }
      else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) fg = ANSI_COLORS[code];
      else if (code === 39) fg = undefined;
    }
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) {
    spans.push({ text: text.slice(lastIdx), fg, bold, dim });
  }
  return spans;
}

function AnsiRenderer({ text }: { text: string }) {
  const spans = useMemo(() => parseAnsi(text), [text]);
  return (
    <>
      {spans.map((span, i) => {
        const style: React.CSSProperties = {};
        if (span.fg) style.color = span.fg;
        if (span.bold) style.fontWeight = 700;
        if (span.dim) style.opacity = 0.6;
        return (span.fg || span.bold || span.dim)
          ? <span key={i} style={style}>{span.text}</span>
          : span.text;
      })}
    </>
  );
}

export const TerminalPage = ({
  session,
  sessions,
  onSelectSession,
  onCloseSession,
  onBack,
  className,
}: TerminalPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when running
  useEffect(() => {
    if (session.isRunning && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [session.output, session.isRunning]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleCopy = useCallback(() => {
    if (session.output) {
      navigator.clipboard.writeText(session.output).catch(() => {});
    }
  }, [session.output]);

  const toggleSearch = useCallback(() => {
    setSearchOpen((o) => !o);
    if (searchOpen) setSearchQuery('');
  }, [searchOpen]);

  const exitOk = session.exitCode === 0 || session.exitCode === undefined;
  const hasTabs = sessions && sessions.length > 1;

  return (
    <div className={`terminal-page${className ? ` ${className}` : ''}`}>
      {/* Header */}
      <div className="terminal-page__header">
        {onBack && (
          <button type="button" className="terminal-page__back-btn" onClick={onBack}>
            <BoxIcon name="bx-arrow-back" size={16} />
          </button>
        )}

        {/* Session tabs */}
        {hasTabs && (
          <div className="terminal-page__tabs">
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`terminal-page__tab${s.id === session.id ? ' terminal-page__tab--active' : ''}`}
                onClick={() => onSelectSession?.(s.id)}
                title={s.command}
              >
                <BoxIcon name="bx-terminal" size={12} />
                <span className="terminal-page__tab-text">
                  {s.command.length > 30 ? s.command.slice(0, 30) + '...' : s.command}
                </span>
                {s.isRunning && <span className="terminal-page__tab-dot" />}
                {onCloseSession && (
                  <span
                    className="terminal-page__tab-close"
                    onClick={(e) => { e.stopPropagation(); onCloseSession(s.id); }}
                    role="button"
                    tabIndex={0}
                  >
                    <BoxIcon name="bx-x" size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {!hasTabs && (
          <div className="terminal-page__title">
            <BoxIcon name="bx-terminal" size={16} />
            <span>{session.command}</span>
          </div>
        )}

        <div className="terminal-page__header-actions">
          {session.isRunning && (
            <span className="terminal-page__status terminal-page__status--running">Running</span>
          )}
          {!session.isRunning && session.exitCode !== undefined && (
            <span className={`terminal-page__status terminal-page__status--${exitOk ? 'success' : 'error'}`}>
              exit {session.exitCode}
            </span>
          )}
          <button type="button" className="terminal-page__action-btn" onClick={toggleSearch} title="Search">
            <BoxIcon name="bx-search" size={14} />
          </button>
          <button type="button" className="terminal-page__action-btn" onClick={handleCopy} title="Copy output">
            <BoxIcon name="bx-copy" size={14} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="terminal-page__search">
          <BoxIcon name="bx-search" size={14} />
          <input
            ref={searchInputRef}
            type="text"
            className="terminal-page__search-input"
            placeholder="Search output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="terminal-page__search-close" onClick={toggleSearch}>
            <BoxIcon name="bx-x" size={14} />
          </button>
        </div>
      )}

      {/* CWD */}
      {session.cwd && (
        <div className="terminal-page__cwd">
          <BoxIcon name="bx-folder" size={12} />
          <span>{session.cwd}</span>
        </div>
      )}

      {/* Command */}
      <div className="terminal-page__command">
        <span className="terminal-page__prompt">$</span>
        <code>{session.command}</code>
      </div>

      {/* Output */}
      <pre ref={outputRef} className="terminal-page__output">
        {session.output ? <AnsiRenderer text={session.output} /> : (
          session.isRunning
            ? <span className="terminal-page__waiting">Waiting for output...</span>
            : <span className="terminal-page__waiting">No output</span>
        )}
        {session.isRunning && <span className="terminal-page__cursor" />}
      </pre>
    </div>
  );
};
