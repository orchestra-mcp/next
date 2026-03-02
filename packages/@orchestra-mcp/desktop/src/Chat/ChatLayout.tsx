import { useState, useCallback, useMemo, useEffect, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { EmptyState } from '@orchestra-mcp/ui';
import type { WindowMode } from '@orchestra-mcp/ai';
import { IconSidebar } from './IconSidebar';
import type { ChatView, UserInfo } from './IconSidebar';
import { SessionSidebar } from './SessionSidebar';
import { SessionItem } from './SessionItem';
import { WelcomeContent } from './WelcomeContent';
import './ChatLayout.css';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  model: string;
  updatedAt: string;
  pinned?: boolean;
  messageCount?: number;
  icon?: string;
  color?: string;
}

export interface ChatLayoutProps {
  /** All sessions to display (pre-sorted by store) */
  sessions: ChatSession[];
  /** Currently active session ID */
  activeSessionId: string | null;
  /** Called when user selects a session */
  onSessionSelect: (id: string) => void;
  /** Called when user deletes a session */
  onSessionDelete: (id: string) => void;
  /** Called when user pins/unpins a session */
  onSessionPin: (id: string) => void;
  /** Called when user renames a session */
  onSessionRename?: (id: string, newTitle: string) => void;
  /** Called when user changes a session icon */
  onSessionIconChange?: (id: string, icon: string) => void;
  /** Called when user changes a session color */
  onSessionColorChange?: (id: string, color: string) => void;
  /** Called when user clicks New Chat */
  onNewChat: () => void;
  /** Number of sessions to show initially / per page */
  pageSize?: number;
  /** Settings content rendered inline when settings view is active */
  settingsContent?: ReactNode;
  /** Notes content rendered inline when notes view is active */
  notesContent?: ReactNode;
  /** Projects sidebar + dashboard rendered when projects view is active */
  projectsSidebar?: ReactNode;
  /** Projects main content (dashboard) rendered when projects view is active */
  projectsContent?: ReactNode;
  /** Tasks sidebar rendered when tasks view is active */
  tasksSidebar?: ReactNode;
  /** Tasks main content (detail panel / dashboard) rendered when tasks view is active */
  tasksContent?: ReactNode;
  /** DevTools sidebar rendered when devtools view is active */
  devtoolsSidebar?: ReactNode;
  /** DevTools content rendered inline when devtools view is active */
  devtoolsContent?: ReactNode;
  /** Integrations content rendered inline when integrations view is active */
  integrationsContent?: ReactNode;
  /** Components browser rendered when components view is active */
  componentsContent?: ReactNode;
  /** Externally controlled active view (e.g. from tray event) */
  activeViewOverride?: ChatView | null;
  /** Called when user manually changes view, clearing the override */
  onViewOverrideClear?: () => void;
  /** Whether the session sidebar is open */
  sidebarOpen?: boolean;
  /** Toggle session sidebar visibility */
  onSidebarToggle?: () => void;
  /** Whether the notes sidebar is open */
  notesSidebarOpen?: boolean;
  /** Toggle notes sidebar visibility */
  onNotesSidebarToggle?: () => void;
  /** Whether the projects sidebar is open */
  projectsSidebarOpen?: boolean;
  /** Toggle projects sidebar visibility */
  onProjectsSidebarToggle?: () => void;
  /** Whether the devtools sidebar is open */
  devtoolsSidebarOpen?: boolean;
  /** Toggle devtools sidebar visibility */
  onDevtoolsSidebarToggle?: () => void;
  /** Authenticated user info shown in icon sidebar */
  userInfo?: UserInfo;
  /** Called when user clicks the avatar to sign out */
  onLogout?: () => void;
  /** Whether the WebSocket/backend sync connection is live */
  syncConnected?: boolean;
  /** ISO timestamp of last received sync event (tasks:changed, workspace:changed, etc.) */
  lastSyncAt?: string | null;
  /** Called when user clicks "Sync Now" in the user menu */
  onSyncNow?: () => void;
  /** Current workspace absolute path (last folder name shown in titlebar) */
  workspacePath?: string;
  /** Called when user changes window mode (embedded/floating/bubble) */
  onWindowModeChange?: (mode: WindowMode) => void;
  /** Logo SVG path for loading animation */
  logoSrc?: string;
  /** Chat content area (ChatPage renders here) */
  children: ReactNode;
}

/**
 * WhatsApp-style 3-panel layout: IconSidebar | SessionSidebar | ChatContent.
 * Handles session filtering, search, pagination, and view switching.
 */
export function ChatLayout({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionPin,
  onSessionRename,
  onSessionIconChange,
  onSessionColorChange,
  onNewChat,
  pageSize = 20,
  settingsContent,
  notesContent,
  projectsSidebar,
  projectsContent,
  tasksSidebar,
  tasksContent,
  devtoolsSidebar,
  devtoolsContent,
  integrationsContent,
  componentsContent,
  activeViewOverride,
  onViewOverrideClear,
  sidebarOpen = true,
  onSidebarToggle,
  userInfo,
  onLogout,
  syncConnected,
  lastSyncAt,
  onSyncNow,
  notesSidebarOpen = true,
  onNotesSidebarToggle,
  projectsSidebarOpen = true,
  onProjectsSidebarToggle,
  devtoolsSidebarOpen = true,
  onDevtoolsSidebarToggle,
  workspacePath,
  onWindowModeChange,
  logoSrc,
  children,
}: ChatLayoutProps) {
  const [activeView, setActiveView] = useState<ChatView>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // ── Multi-select for sessions ────────────────────────
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const sessionSelectionMode = selectedSessions.size > 0;

  const handleToggleSessionSelect = useCallback((id: string) => {
    setSelectedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSessionDeleteInSelection = useCallback((id: string) => {
    // Delete all selected items (or just the one if right-clicked on unselected)
    const ids = selectedSessions.has(id) ? [...selectedSessions] : [id];
    ids.forEach((sid) => onSessionDelete(sid));
    setSelectedSessions(new Set());
  }, [selectedSessions, onSessionDelete]);

  const handleSessionPinInSelection = useCallback((id: string) => {
    const ids = selectedSessions.has(id) ? [...selectedSessions] : [id];
    ids.forEach((sid) => onSessionPin(sid));
    setSelectedSessions(new Set());
  }, [selectedSessions, onSessionPin]);

  const clearSessionSelection = useCallback(() => setSelectedSessions(new Set()), []);

  // Escape key clears selection
  useEffect(() => {
    if (!sessionSelectionMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSessionSelection();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sessionSelectionMode, clearSessionSelection]);

  // Allow parent to force the active view (e.g. tray event)
  const effectiveView = activeViewOverride ?? activeView;

  const handleViewChange = useCallback((view: ChatView) => {
    // Clicking chat icon toggles sidebar when already on chat view
    if (view === 'chat' && effectiveView === 'chat' && onSidebarToggle) {
      onSidebarToggle();
      return;
    }
    // Clicking notes icon toggles notes sidebar when already on notes view
    if (view === 'notes' && effectiveView === 'notes' && onNotesSidebarToggle) {
      onNotesSidebarToggle();
      return;
    }
    // Clicking projects icon toggles sidebar when already on projects view
    if (view === 'projects' && effectiveView === 'projects' && onProjectsSidebarToggle) {
      onProjectsSidebarToggle();
      return;
    }
    // Clicking devtools icon toggles sidebar when already on devtools view
    if (view === 'devtools' && effectiveView === 'devtools' && onDevtoolsSidebarToggle) {
      onDevtoolsSidebarToggle();
      return;
    }
    setActiveView(view);
    onViewOverrideClear?.();
  }, [effectiveView, onSidebarToggle, onNotesSidebarToggle, onProjectsSidebarToggle, onDevtoolsSidebarToggle, onViewOverrideClear]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + pageSize);
  }, [pageSize]);

  // Filter sessions and float pinned to top (preserve store order otherwise)
  const filteredSessions = useMemo(() => {
    let list = sessions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.lastMessage && s.lastMessage.toLowerCase().includes(q)),
      );
    }

    const pinned = list.filter((s) => s.pinned);
    const unpinned = list.filter((s) => !s.pinned);
    return [...pinned, ...unpinned];
  }, [sessions, searchQuery]);

  const visibleSessions = filteredSessions.slice(0, visibleCount);
  const loadingMore = visibleCount < filteredSessions.length;

  return (
    <div className="chat-layout">
      {/* Full-width titlebar — pushes all content below OS buttons */}
      <div className="chat-layout__titlebar">
        <span className="chat-layout__titlebar-title">Orchestra MCP</span>
        {workspacePath && (
          <span className="chat-layout__titlebar-path" title={workspacePath}>
            <BoxIcon name="bx-folder" size={13} />
            {workspacePath.split('/').filter(Boolean).pop() || workspacePath}
          </span>
        )}
      </div>

      {/* 3-panel body row */}
      <div className="chat-layout__body">
        <IconSidebar
          activeView={effectiveView}
          onViewChange={handleViewChange}
          userInfo={userInfo}
          onLogout={onLogout}
          syncConnected={syncConnected}
          lastSyncAt={lastSyncAt}
          onSyncNow={onSyncNow}
        />

        {effectiveView === 'projects' && projectsSidebar && projectsSidebarOpen && (
          <div className="chat-layout__projects-sidebar">{projectsSidebar}</div>
        )}

        {effectiveView === 'tasks' && tasksSidebar && (
          <div className="chat-layout__tasks-sidebar">{tasksSidebar}</div>
        )}

        {effectiveView === 'devtools' && devtoolsSidebar && devtoolsSidebarOpen && (
          <div className="chat-layout__devtools-sidebar">{devtoolsSidebar}</div>
        )}

        {effectiveView === 'chat' && sidebarOpen && (
          <SessionSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewChat={onNewChat}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
            logoSrc={logoSrc}
          >
            {sessionSelectionMode && (
              <div className="chat-layout__selection-bar">
                <span>{selectedSessions.size} selected</span>
                <button type="button" onClick={clearSessionSelection}>
                  <BoxIcon name="bx-x" size={16} /> Cancel
                </button>
              </div>
            )}
            {visibleSessions.map((s) => (
              <SessionItem
                key={s.id}
                id={s.id}
                title={s.title}
                lastMessage={s.lastMessage}
                date={s.updatedAt}
                model={s.model}
                active={s.id === activeSessionId}
                pinned={s.pinned}
                messageCount={s.messageCount}
                icon={s.icon}
                color={s.color}
                selected={selectedSessions.has(s.id)}
                selectionMode={sessionSelectionMode}
                onSelect={onSessionSelect}
                onDelete={sessionSelectionMode ? handleSessionDeleteInSelection : onSessionDelete}
                onPin={sessionSelectionMode ? handleSessionPinInSelection : onSessionPin}
                onRename={sessionSelectionMode ? undefined : onSessionRename}
                onIconChange={sessionSelectionMode ? undefined : onSessionIconChange}
                onColorChange={sessionSelectionMode ? undefined : onSessionColorChange}
                onToggleSelect={handleToggleSessionSelect}
              />
            ))}
          </SessionSidebar>
        )}

        <div className="chat-layout__content">
          {effectiveView === 'settings' && settingsContent ? (
            <div className="chat-layout__settings">{settingsContent}</div>
          ) : effectiveView === 'notes' && notesContent ? (
            <div className="chat-layout__notes">{notesContent}</div>
          ) : effectiveView === 'projects' && projectsContent ? (
            <div className="chat-layout__projects">{projectsContent}</div>
          ) : effectiveView === 'tasks' && tasksContent ? (
            <div className="chat-layout__tasks">{tasksContent}</div>
          ) : effectiveView === 'devtools' && devtoolsContent ? (
            <div className="chat-layout__devtools">{devtoolsContent}</div>
          ) : effectiveView === 'integrations' && integrationsContent ? (
            <div className="chat-layout__integrations">{integrationsContent}</div>
          ) : effectiveView === 'components' && componentsContent ? (
            <div className="chat-layout__components">{componentsContent}</div>
          ) : activeSessionId ? (
            isValidElement(children)
              ? cloneElement(children, { activeView: effectiveView, onViewChange: handleViewChange } as any)
              : children
          ) : (
            logoSrc ? (
              <WelcomeContent logoSrc={logoSrc} />
            ) : (
              <EmptyState
                size="lg"
                icon={<BoxIcon name="bx-chat" size={48} />}
                title="No chat selected"
                description="Select a chat or start a new one"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
