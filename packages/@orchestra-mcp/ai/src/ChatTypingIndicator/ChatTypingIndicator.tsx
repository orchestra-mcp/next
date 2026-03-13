"use client";

import type { ReactNode } from 'react';
import './ChatTypingIndicator.css';

export interface ChatTypingIndicatorProps {
  avatar?: ReactNode;
  className?: string;
}

export const ChatTypingIndicator = ({ avatar, className }: ChatTypingIndicatorProps) => {
  const cls = ['chat-typing', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="chat-typing-indicator">
      {avatar && (
        <div className="chat-typing__avatar">{avatar}</div>
      )}
      <div className="chat-typing__bubble">
        <div className="chat-typing__dots">
          <span className="chat-typing__dot" />
          <span className="chat-typing__dot" />
          <span className="chat-typing__dot" />
        </div>
      </div>
    </div>
  );
};
