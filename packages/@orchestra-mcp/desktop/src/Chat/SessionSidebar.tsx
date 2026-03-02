import { useCallback, useRef, Children, isValidElement } from 'react';
import type { ReactNode, UIEvent } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { EmptyState } from '@orchestra-mcp/ui';
import { LoadingLogo } from './LoadingLogo';
import './SessionSidebar.css';

export interface SessionSidebarProps {
  /** Search query, controlled */
  searchQuery: string;
  onSearchChange: (query: string) => void;
  /** Filter dropdown */
  filterModel?: string;
  onFilterModelChange?: (model: string | undefined) => void;
  availableModels?: Array<{ id: string; name: string }>;
  /** The session list -- rendered via children for flexibility */
  children: ReactNode;
  /** New chat button callback */
  onNewChat: () => void;
  /** Title shown at top */
  title?: string;
  /** Loading more indicator */
  loadingMore?: boolean;
  /** Trigger to load more sessions */
  onLoadMore?: () => void;
  /** Logo SVG path for loading animation */
  logoSrc?: string;
}

const SCROLL_THRESHOLD = 100;

export function SessionSidebar({
  searchQuery,
  onSearchChange,
  filterModel,
  onFilterModelChange,
  availableModels = [],
  children,
  onNewChat,
  title = 'Chats',
  loadingMore = false,
  onLoadMore,
  logoSrc,
}: SessionSidebarProps) {
  const loadingRef = useRef(false);

  const handleScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || loadingRef.current) return;
      const el = e.currentTarget;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom < SCROLL_THRESHOLD) {
        loadingRef.current = true;
        onLoadMore();
        requestAnimationFrame(() => {
          loadingRef.current = false;
        });
      }
    },
    [onLoadMore],
  );

  const handleFilterClick = useCallback(
    (modelId: string | undefined) => () => {
      onFilterModelChange?.(modelId);
    },
    [onFilterModelChange],
  );

  const showFilters = availableModels.length > 0 && onFilterModelChange;

  return (
    <aside className="session-sidebar">
      <div className="session-sidebar__header">
        <h2 className="session-sidebar__title">{title}</h2>
        <button
          className="session-sidebar__new-btn"
          onClick={onNewChat}
          aria-label="New chat"
        >
          <BoxIcon name="bx-plus" size={18} />
        </button>
      </div>

      <div className="session-sidebar__search">
        <span className="session-sidebar__search-icon">
          <BoxIcon name="bx-search" size={16} />
        </span>
        <input
          className="session-sidebar__search-input"
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {Children.toArray(children).some((c) => isValidElement(c)) ? (
        <div className="session-sidebar__list" onScroll={handleScroll}>
          {children}
        </div>
      ) : (
        <EmptyState
          icon={<BoxIcon name="bx-chat" size={40} />}
          title="No conversations yet"
          description="Start a new chat to get going"
        />
      )}

      {loadingMore && logoSrc && (
        <div className="session-sidebar__loading" aria-label="Loading more sessions">
          <LoadingLogo size={24} logoSrc={logoSrc} />
        </div>
      )}
    </aside>
  );
}
