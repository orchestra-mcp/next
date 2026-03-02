import { useState } from 'react';
import type { ClaudeCodeEvent } from '../types/events';
import { CardBase } from './CardBase';
import { humanizeKey } from './humanize';
import './RawCard.css';

export interface RawCardProps {
  event: ClaudeCodeEvent;
  title?: string;
  className?: string;
}

/** Syntax highlight JSON with CSS classes */
function highlightJson(value: unknown, depth = 0): string {
  if (value === null) return '<span class="raw-card__null">null</span>';
  if (typeof value === 'boolean') return `<span class="raw-card__bool">${value}</span>`;
  if (typeof value === 'number') return `<span class="raw-card__number">${value}</span>`;
  if (typeof value === 'string') {
    const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (escaped.length > 200) {
      return `<span class="raw-card__string">"${escaped.slice(0, 200)}…"</span>`;
    }
    return `<span class="raw-card__string">"${escaped}"</span>`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const indent = '  '.repeat(depth + 1);
    const closing = '  '.repeat(depth);
    const items = value.map(v => `${indent}${highlightJson(v, depth + 1)}`).join(',\n');
    return `[\n${items}\n${closing}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const indent = '  '.repeat(depth + 1);
    const closing = '  '.repeat(depth);
    const items = entries.map(([k, v]) =>
      `${indent}<span class="raw-card__key">"${k}"</span>: ${highlightJson(v, depth + 1)}`
    ).join(',\n');
    return `{\n${items}\n${closing}}`;
  }
  return String(value);
}

export const RawCard = ({ event, title, className }: RawCardProps) => {
  const [showRaw, setShowRaw] = useState(false);

  // Extract displayable data from the event
  const { id, type, timestamp, toolUseId, status, ...data } = event;
  const displayTitle = title || humanizeKey(type);

  // Try to render key-value pairs for simple objects
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  const hasSimpleValues = entries.every(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');

  return (
    <CardBase
      title={displayTitle}
      badge={type}
      badgeColor="gray"
      status={status}
      defaultCollapsed={true}
      className={`raw-card${className ? ` ${className}` : ''}`}
      headerActions={
        <button
          type="button"
          className="raw-card__toggle"
          onClick={() => setShowRaw(s => !s)}
          title={showRaw ? 'Show formatted' : 'Show raw JSON'}
        >
          {showRaw ? '{ }' : '< >'}
        </button>
      }
    >
      <div className="raw-card__body">
        {!showRaw && hasSimpleValues ? (
          <div className="raw-card__pairs">
            {entries.map(([key, val]) => (
              <div key={key} className="raw-card__pair">
                <span className="raw-card__pair-key">{humanizeKey(key)}</span>
                <span className="raw-card__pair-val">{String(val)}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre
            className="raw-card__pre"
            dangerouslySetInnerHTML={{ __html: highlightJson(data) }}
          />
        )}
      </div>
    </CardBase>
  );
};
