"use client";

import { useMemo, useRef, useCallback } from 'react';
import type { BashEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './BashCard.css';

export interface BashCardProps {
  event: BashEvent;
  defaultCollapsed?: boolean;
  maxOutputHeight?: number;
  /** Callback when user clicks "Open in Terminal". */
  onOpenTerminal?: (event: BashEvent) => void;
  className?: string;
}

const truncateCommand = (cmd: string, max = 80): string =>
  cmd.length > max ? cmd.slice(0, max) + '...' : cmd;

// ---- Lightweight ANSI → React spans ----

interface AnsiSpan {
  text: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const ANSI_COLORS: Record<number, string> = {
  30: '#1e1e1e', 31: '#e06c75', 32: '#98c379', 33: '#e5c07b',
  34: '#61afef', 35: '#c678dd', 36: '#56b6c2', 37: '#abb2bf',
  90: '#5c6370', 91: '#e06c75', 92: '#98c379', 93: '#e5c07b',
  94: '#61afef', 95: '#c678dd', 96: '#56b6c2', 97: '#ffffff',
};

const ANSI_BG_COLORS: Record<number, string> = {
  40: '#1e1e1e', 41: '#e06c75', 42: '#98c379', 43: '#e5c07b',
  44: '#61afef', 45: '#c678dd', 46: '#56b6c2', 47: '#abb2bf',
};

function parseAnsi(text: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;
  let lastIdx = 0;
  let fg: string | undefined;
  let bg: string | undefined;
  let bold = false;
  let dim = false;
  let italic = false;
  let underline = false;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) {
      spans.push({ text: text.slice(lastIdx, match.index), fg, bg, bold, dim, italic, underline });
    }
    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) { fg = undefined; bg = undefined; bold = false; dim = false; italic = false; underline = false; }
      else if (code === 1) bold = true;
      else if (code === 2) dim = true;
      else if (code === 3) italic = true;
      else if (code === 4) underline = true;
      else if (code === 22) { bold = false; dim = false; }
      else if (code === 23) italic = false;
      else if (code === 24) underline = false;
      else if (code >= 30 && code <= 37 || code >= 90 && code <= 97) fg = ANSI_COLORS[code];
      else if (code >= 40 && code <= 47) bg = ANSI_BG_COLORS[code];
      else if (code === 39) fg = undefined;
      else if (code === 49) bg = undefined;
    }
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) {
    spans.push({ text: text.slice(lastIdx), fg, bg, bold, dim, italic, underline });
  }
  return spans;
}

function AnsiOutput({ text }: { text: string }) {
  const spans = useMemo(() => parseAnsi(text), [text]);

  return (
    <>
      {spans.map((span, i) => {
        const style: React.CSSProperties = {};
        if (span.fg) style.color = span.fg;
        if (span.bg) style.backgroundColor = span.bg;
        if (span.bold) style.fontWeight = 700;
        if (span.dim) style.opacity = 0.6;
        if (span.italic) style.fontStyle = 'italic';
        if (span.underline) style.textDecoration = 'underline';

        const hasStyle = span.fg || span.bg || span.bold || span.dim || span.italic || span.underline;
        return hasStyle ? (
          <span key={i} style={style}>{span.text}</span>
        ) : (
          span.text
        );
      })}
    </>
  );
}

export const BashCard = ({
  event,
  defaultCollapsed,
  maxOutputHeight = 300,
  onOpenTerminal,
  className,
}: BashCardProps) => {
  const exitOk = event.exitCode === 0 || event.exitCode === undefined;
  const badgeText = event.exitCode !== undefined ? `exit ${event.exitCode}` : undefined;
  const outputRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    if (event.output) {
      navigator.clipboard.writeText(event.output).catch(() => {});
    }
  }, [event.output]);

  const headerActions = (
    <span className="bash-card__actions">
      {event.output && (
        <button
          type="button"
          className="bash-card__action-btn"
          onClick={handleCopy}
          title="Copy output"
          aria-label="Copy output to clipboard"
        >
          <BoxIcon name="bx-copy" size={14} />
        </button>
      )}
      {onOpenTerminal && (
        <button
          type="button"
          className="bash-card__action-btn"
          onClick={() => onOpenTerminal(event)}
          title="Open in Terminal"
          aria-label="Open in terminal view"
        >
          <BoxIcon name="bx-link-external" size={14} />
        </button>
      )}
    </span>
  );

  return (
    <CardBase
      title={truncateCommand(event.command)}
      icon={<BoxIcon name="bx-terminal" size={16} />}
      badge={badgeText}
      badgeColor={exitOk ? 'success' : 'danger'}
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      headerActions={headerActions}
      className={`bash-card${className ? ` ${className}` : ''}`}
    >
      {event.cwd && (
        <div className="bash-card__cwd" title={event.cwd}>
          <BoxIcon name="bx-folder" size={12} />
          <span>{event.cwd}</span>
        </div>
      )}

      <div className="bash-card__command">
        <span className="bash-card__prompt">$</span>
        <code>{event.command}</code>
      </div>

      {event.output && (
        <pre
          ref={outputRef}
          className={`bash-card__output${!exitOk ? ' bash-card__output--error' : ''}`}
          style={{ maxHeight: maxOutputHeight }}
        >
          <AnsiOutput text={event.output} />
        </pre>
      )}
    </CardBase>
  );
};
