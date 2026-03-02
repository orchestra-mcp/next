import React from 'react';
import type { ReactNode } from 'react';
import { useAutoScroll } from '../hooks/useAutoScroll';
import './ChatBody.css';

export interface ChatBodyProps {
  children: ReactNode;
  autoScroll?: boolean;
  showScrollButton?: boolean;
  emptyContent?: ReactNode;
  /** Explicitly mark as empty (overrides child count detection) */
  isEmpty?: boolean;
  /** Whether there are more messages to load */
  hasMoreMessages?: boolean;
  /** Callback when user scrolls to top */
  onLoadMore?: () => void;
  /** When this key changes, scroll resets to bottom (e.g. activeSessionId) */
  scrollKey?: string | null;
  className?: string;
}

export const ChatBody = ({
  children,
  autoScroll = true,
  showScrollButton = true,
  emptyContent,
  isEmpty: isEmptyProp,
  hasMoreMessages,
  onLoadMore,
  scrollKey,
  className,
}: ChatBodyProps) => {
  const childCount = React.Children.count(children);
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll(
    autoScroll ? [childCount] : [],
  );

  // Reset scroll to bottom when scrollKey changes (e.g. session switch).
  // Defer to next frame so React has rendered the new messages first.
  // Use double RAF to ensure DOM is fully painted.
  const prevKeyRef = React.useRef(scrollKey);
  React.useEffect(() => {
    if (prevKeyRef.current !== scrollKey) {
      prevKeyRef.current = scrollKey;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
      });
    }
  }, [scrollKey, scrollToBottom]);

  // Intersection observer for load more trigger
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!hasMoreMessages || !onLoadMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          onLoadMore();
          // Reset after a delay to allow re-triggering
          setTimeout(() => setIsLoading(false), 500);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreMessages, onLoadMore, isLoading]);

  const isEmpty = isEmptyProp ?? childCount === 0;
  const cls = ['chat-body', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="chat-body">
      <div
        ref={containerRef}
        className="chat-body__scroll"
        data-testid="chat-body-scroll"
      >
        {isEmpty && emptyContent ? (
          <div className="chat-body__empty" data-testid="chat-body-empty">
            {emptyContent}
          </div>
        ) : (
          <div className="chat-body__messages">
            {hasMoreMessages && (
              <div ref={loadMoreRef} className="chat-body__load-trigger">
                {isLoading ? 'Loading...' : 'Scroll up for older messages'}
              </div>
            )}
            {children}
          </div>
        )}
      </div>

      {showScrollButton && !isAtBottom && !isEmpty && (
        <button
          type="button"
          className="chat-body__scroll-btn"
          onClick={() => scrollToBottom()}
          aria-label="Scroll to bottom"
          data-testid="chat-body-scroll-btn"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 5v6m0 0l-2.5-2.5M8 11l2.5-2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
