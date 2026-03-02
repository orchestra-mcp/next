"use client";

import './ChatTypingIndicator.css';

export interface ChatTypingIndicatorProps {
  className?: string;
}

export const ChatTypingIndicator = ({ className }: ChatTypingIndicatorProps) => {
  const cls = ['chat-typing', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="chat-typing-indicator">
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
