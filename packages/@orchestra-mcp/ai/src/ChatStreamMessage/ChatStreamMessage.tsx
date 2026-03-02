import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMarkdown } from '../ChatMarkdown';
import './ChatStreamMessage.css';

export interface ChatStreamMessageProps {
  content: string;
  streaming: boolean;
  renderMarkdown?: boolean;
  /** Called when streaming=false AND typewriter animation finishes catching up */
  onStreamComplete?: () => void;
  className?: string;
}

/** Characters revealed per tick. Tuned for natural reading speed at ~60fps. */
const CHARS_PER_TICK = 4;
const TICK_MS = 16;

export const ChatStreamMessage = ({
  content,
  streaming,
  renderMarkdown = false,
  onStreamComplete,
  className,
}: ChatStreamMessageProps) => {
  const [visible, setVisible] = useState('');
  const [animating, setAnimating] = useState(false);
  const posRef = useRef(0);
  const contentRef = useRef(content);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  // Always keep contentRef in sync so the rAF reads latest content
  contentRef.current = content;

  const tick = useCallback(() => {
    const now = performance.now();
    if (now - lastTickRef.current >= TICK_MS) {
      lastTickRef.current = now;
      const cur = contentRef.current;
      posRef.current = Math.min(posRef.current + CHARS_PER_TICK, cur.length);
      setVisible(cur.slice(0, posRef.current));

      if (posRef.current >= cur.length) {
        rafRef.current = null;
        setAnimating(false);
        return; // stop — will restart when content grows
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // Has new content to reveal?
    if (posRef.current < content.length) {
      setAnimating(true);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [content, tick]);

  // Fire onStreamComplete when stream ended AND typewriter caught up
  useEffect(() => {
    if (!streaming && !animating) {
      onStreamComplete?.();
    }
  }, [streaming, animating, onStreamComplete]);

  const displayContent = animating ? visible : content;

  const cls = ['chat-stream', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="chat-stream-message">
      <div className="chat-stream__body">
        {renderMarkdown ? (
          <ChatMarkdown content={displayContent} />
        ) : (
          <span className="chat-stream__text">{displayContent}</span>
        )}
      </div>
    </div>
  );
};
