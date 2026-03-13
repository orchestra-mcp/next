import { useState, useRef, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import './ChatHeader.css';

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatHeaderProps {
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  /** @deprecated Use primaryActions instead. */
  actions?: ReactNode;
  /** Right side: model selector, etc. */
  primaryActions?: ReactNode;
  /** Center strip: mode selector, thinking toggle, etc. */
  secondaryActions?: ReactNode;
  /** Session list for the title dropdown */
  sessions?: ChatSession[];
  /** Currently active session ID */
  activeSessionId?: string | null;
  /** Called when user picks a different session */
  onSessionSelect?: (id: string) => void;
  /** Called when user deletes a session */
  onSessionDelete?: (id: string) => void;
  /** Called when user renames a session */
  onSessionRename?: (id: string, title: string) => void;
  /** Called when user clicks the + new chat button */
  onNewChat?: () => void;
  /** Expand to fullscreen/panel */
  onExpand?: () => void;
  /** Collapse back to bubble */
  onCollapse?: () => void;
  /** Current dock mode */
  dockMode?: string;
  className?: string;
}

export const ChatHeader = ({
  title = 'Chat',
  onClose,
  onMinimize,
  actions,
  primaryActions,
  secondaryActions,
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionRename,
  onNewChat,
  onExpand,
  onCollapse,
  dockMode,
  className,
}: ChatHeaderProps) => {
  const cls = ['chat-header', className].filter(Boolean).join(' ');
  const resolvedPrimaryActions = primaryActions ?? actions;

  // Session dropdown
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Focus rename input when editing
  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  const commitRename = (id: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && onSessionRename) {
      onSessionRename(id, trimmed);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  // Active session title
  const activeTitle = useMemo(() => {
    if (!sessions || !activeSessionId) return title;
    return sessions.find((s) => s.id === activeSessionId)?.title || title;
  }, [sessions, activeSessionId, title]);

  // Filter + sort
  const filtered = useMemo(() => {
    if (!sessions) return [];
    const q = search.trim().toLowerCase();
    const list = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions;
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [sessions, search]);

  const hasSessions = sessions && sessions.length > 0;

  return (
    <div className={cls} data-testid="chat-header">
      <div className="chat-header__toolbar">
        {/* Left: new chat + session title */}
        <div className="chat-header__left" ref={wrapRef}>
          {onNewChat && (
            <button
              type="button"
              className="chat-header__icon-btn chat-header__icon-btn--new"
              onClick={onNewChat}
              aria-label="New chat"
              data-testid="chat-header-new-chat"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {hasSessions ? (
            <>
              <button
                type="button"
                className="chat-header__session-btn"
                onClick={() => setOpen(!open)}
                data-testid="chat-header-session-toggle"
              >
                <span className="chat-header__title">{activeTitle}</span>
                <svg
                  className={`chat-header__chevron${open ? ' chat-header__chevron--open' : ''}`}
                  width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open && (
                <div className="chat-header__dropdown" data-testid="chat-header-dropdown">
                  <div className="chat-header__dropdown-search">
                    <input
                      ref={inputRef}
                      type="text"
                      className="chat-header__dropdown-input"
                      placeholder="Search sessions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="chat-header__dropdown-list">
                    {filtered.length === 0 && (
                      <div className="chat-header__dropdown-empty">
                        {search.trim() ? 'No matches' : 'No sessions'}
                      </div>
                    )}
                    {filtered.map((s) => (
                      <div
                        key={s.id}
                        className={`chat-header__dropdown-item${s.id === activeSessionId ? ' chat-header__dropdown-item--active' : ''}`}
                        onClick={() => {
                          if (renamingId === s.id) return;
                          onSessionSelect?.(s.id); setOpen(false); setSearch('');
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (renamingId === s.id) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSessionSelect?.(s.id);
                            setOpen(false);
                            setSearch('');
                          }
                        }}
                      >
                        {renamingId === s.id ? (
                          <input
                            ref={renameInputRef}
                            type="text"
                            className="chat-header__dropdown-rename-input"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); commitRename(s.id); }
                              if (e.key === 'Escape') { e.preventDefault(); setRenamingId(null); }
                            }}
                            onBlur={() => commitRename(s.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="chat-header__dropdown-item-title">{s.title}</span>
                        )}
                        <div className="chat-header__dropdown-item-right">
                          {s.messageCount > 0 && (
                            <span className="chat-header__dropdown-item-badge">{s.messageCount}</span>
                          )}
                          {onSessionRename && renamingId !== s.id && (
                            <button
                              type="button"
                              className="chat-header__dropdown-item-rename"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(s.id);
                                setRenameValue(s.title);
                              }}
                              aria-label={`Rename ${s.title}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M10.5 1.5l2 2-7.5 7.5H3v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )}
                          {onSessionDelete && (
                            <button
                              type="button"
                              className="chat-header__dropdown-item-delete"
                              onClick={(e) => { e.stopPropagation(); onSessionDelete(s.id); }}
                              aria-label={`Delete ${s.title}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="chat-header__title">{title}</span>
          )}
        </div>

        {/* Center: fused control strip */}
        {(secondaryActions || resolvedPrimaryActions) && (
          <div className="chat-header__strip" data-testid="chat-header-strip">
            {secondaryActions}
            {secondaryActions && resolvedPrimaryActions && (
              <span className="chat-header__strip-divider" aria-hidden="true" />
            )}
            {resolvedPrimaryActions}
          </div>
        )}

        {/* Right: window controls */}
        <div className="chat-header__right">
          {onExpand && dockMode !== 'fullscreen' && dockMode !== 'sideover' && (
            <button type="button" className="chat-header__icon-btn" onClick={onExpand} aria-label="Expand" data-testid="chat-header-expand">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2h4M2 2v4M12 12h-4M12 12v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {onCollapse && (dockMode === 'fullscreen' || dockMode === 'sideover' || dockMode === 'modal') && (
            <button type="button" className="chat-header__icon-btn" onClick={onCollapse} aria-label="Collapse" data-testid="chat-header-collapse">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5 2v3H2M9 12V9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {onMinimize && (
            <button type="button" className="chat-header__icon-btn" onClick={onMinimize} aria-label="Minimize" data-testid="chat-header-minimize">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {onClose && (
            <button type="button" className="chat-header__icon-btn chat-header__icon-btn--close" onClick={onClose} aria-label="Close" data-testid="chat-header-close">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
