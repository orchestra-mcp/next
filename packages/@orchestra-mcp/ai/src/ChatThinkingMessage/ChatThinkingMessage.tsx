"use client";

import { useState } from 'react';
import './ChatThinkingMessage.css';

export interface ChatThinkingMessageProps {
  /** Thinking/reasoning content */
  content: string;
  /** Whether thinking is still streaming */
  streaming?: boolean;
  /** Start expanded (default false) */
  defaultExpanded?: boolean;
  /** Header label (default "Thinking...") */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

export const ChatThinkingMessage = ({
  content,
  streaming = false,
  defaultExpanded = false,
  label = 'Thinking...',
  className,
}: ChatThinkingMessageProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const cls = [
    'chat-thinking',
    expanded && 'chat-thinking--expanded',
    streaming && 'chat-thinking--streaming',
    className,
  ].filter(Boolean).join(' ');

  const lines = content.split('\n');

  return (
    <div className={cls} data-testid="chat-thinking">
      <button
        type="button"
        className="chat-thinking__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        data-testid="chat-thinking-toggle"
      >
        <span className="chat-thinking__chevron" aria-hidden="true" />
        <span className="chat-thinking__label">{label}</span>
        {streaming && (
          <span className="chat-thinking__dots" data-testid="chat-thinking-dots">
            <span />
            <span />
            <span />
          </span>
        )}
      </button>

      <div className="chat-thinking__body">
        <div className="chat-thinking__content">
          {lines.map((line, i) => (
            <span key={i} className="chat-thinking__line">
              {line}
              {i < lines.length - 1 && '\n'}
            </span>
          ))}
          {streaming && (
            <span className="chat-thinking__stream-dots" aria-hidden="true">...</span>
          )}
        </div>
      </div>
    </div>
  );
};
