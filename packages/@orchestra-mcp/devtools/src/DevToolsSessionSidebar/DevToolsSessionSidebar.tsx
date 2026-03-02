import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { EmptyState } from '@orchestra-mcp/ui';
import { useDevToolsStore } from '../stores/useDevToolsStore';
import { NewSessionPicker } from '../NewSessionPicker';
import type { DevSession, SessionState } from '../types';
import './DevToolsSessionSidebar.css';

const SWIPE_THRESHOLD = 70;
const HOLD_DELAY = 200;
const LONG_PRESS_DELAY = 500;

const DEVTOOLS_ICONS = [
  'bx-terminal', 'bx-data', 'bx-server', 'bx-cloud', 'bx-list-ul',
  'bx-cog', 'bx-check-shield', 'bx-bug', 'bx-folder-open', 'bx-code-alt',
  'bx-git-branch', 'bx-wrench', 'bx-brain', 'bx-shield', 'bx-world',
];

const SESSION_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

/* ── Shared clock (one timer for all items) ──────────────── */

let clockNow = Date.now();
const clockListeners = new Set<() => void>();
let clockInterval: ReturnType<typeof setInterval> | null = null;

function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!clockInterval) {
    clockInterval = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((fn) => fn());
    }, 60_000);
  }
  return () => {
    clockListeners.delete(cb);
    if (clockListeners.size === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

function getClockNow() { return clockNow; }

function useNow(): number {
  return useSyncExternalStore(subscribeClock, getClockNow, getClockNow);
}

function formatRelativeTime(isoDate: string, now: number): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  const d = new Date(isoDate);
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ── Helpers ─────────────────────────────────────────────── */

function stateLabel(state: SessionState): string {
  switch (state) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting';
    case 'error': return 'Error';
    case 'disconnected': return 'Disconnected';
    case 'idle':
    default: return 'Idle';
  }
}

function formatSessionType(type: string): string {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ── Swipeable Item ──────────────────────────────────────── */

interface SwipeableItemProps {
  session: DevSession;
  isActive: boolean;
  isRenaming: boolean;
  isSelected: boolean;
  selectionMode: boolean;
  now: number;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onPin: () => void;
  onDelete: () => void;
  onToggleSelect: () => void;
  renameInputRef?: React.Ref<HTMLInputElement>;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameBlur: () => void;
  onRenameKey: (e: React.KeyboardEvent) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({
  session, isActive, isRenaming, isSelected, selectionMode, now,
  onSelect, onContextMenu, onPin, onDelete, onToggleSelect,
  renameInputRef, renameValue, onRenameChange, onRenameBlur, onRenameKey,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const swipingRef = useRef(false);
  const startX = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const cleanup = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    document.removeEventListener('pointermove', handleDocMove);
    document.removeEventListener('pointerup', handleDocUp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDocMove = useCallback((e: PointerEvent) => {
    const dx = e.clientX - startX.current;
    swipingRef.current = true;
    if (longPressTimer.current && Math.abs(dx) > 8) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    const max = SWIPE_THRESHOLD + 20;
    setOffsetX(Math.max(-max, Math.min(max, dx)));
  }, []);

  const handleDocUp = useCallback(() => {
    cleanup();
    setOffsetX((prev) => {
      if (prev >= SWIPE_THRESHOLD) onPin();
      else if (prev <= -SWIPE_THRESHOLD) onDelete();
      return 0;
    });
    setTimeout(() => { swipingRef.current = false; }, 50);
  }, [onPin, onDelete, cleanup]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore right-click — let context menu handle it without triggering swipe
    if (e.button !== 0) return;
    startX.current = e.clientX;
    longPressFired.current = false;
    cleanup();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onToggleSelect();
    }, LONG_PRESS_DELAY);
    holdTimer.current = setTimeout(() => {
      document.addEventListener('pointermove', handleDocMove);
      document.addEventListener('pointerup', handleDocUp, { once: true });
    }, HOLD_DELAY);
  }, [cleanup, handleDocMove, handleDocUp, onToggleSelect]);

  const onPointerUp = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleClick = useCallback(() => {
    if (swipingRef.current || longPressFired.current) return;
    onSelect();
  }, [onSelect]);

  const showPin = offsetX > 10;
  const showDelete = offsetX < -10;

  return (
    <div className={
      'devtools-session-sidebar__wrapper' +
      (isActive ? ' devtools-session-sidebar__wrapper--active' : '') +
      (isSelected ? ' devtools-session-sidebar__wrapper--selected' : '')
    }>
      {/* Swipe action panels */}
      <div className={`devtools-session-sidebar__action devtools-session-sidebar__action--pin${showPin ? ' devtools-session-sidebar__action--visible' : ''}`}>
        <BoxIcon name={session.pinned ? 'bxs-pin' : 'bx-pin'} size={18} />
        <span>{session.pinned ? 'Unpin' : 'Pin'}</span>
      </div>
      <div className={`devtools-session-sidebar__action devtools-session-sidebar__action--delete${showDelete ? ' devtools-session-sidebar__action--visible' : ''}`}>
        <BoxIcon name="bx-trash" size={18} />
        <span>Delete</span>
      </div>

      {/* Swipeable card */}
      <button
        type="button"
        className={
          'devtools-session-sidebar__item' +
          (isActive ? ' devtools-session-sidebar__item--active' : '') +
          (isSelected ? ' devtools-session-sidebar__item--selected' : '')
        }
        onClick={handleClick}
        onContextMenu={onContextMenu}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          transform: offsetX ? `translateX(${offsetX}px)` : undefined,
          transition: offsetX ? 'none' : 'transform 0.25s ease',
        }}
        aria-label={`Switch to ${session.name}`}
        aria-current={isActive ? 'true' : undefined}
      >
        {selectionMode && (
          <span className="devtools-session-sidebar__checkbox">
            <BoxIcon name={isSelected ? 'bx-checkbox-checked' : 'bx-checkbox'} size={16} />
          </span>
        )}
        <span
          className="devtools-session-sidebar__icon"
          style={session.color ? { color: session.color } : undefined}
        >
          <BoxIcon name={session.icon} size={18} />
        </span>

        <span className="devtools-session-sidebar__body">
          {isRenaming ? (
            <input
              ref={renameInputRef}
              className="devtools-session-sidebar__rename-input"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameBlur}
              onKeyDown={onRenameKey}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="devtools-session-sidebar__name">
              {session.name}
            </span>
          )}
          {!isRenaming && (
            <span className="devtools-session-sidebar__type">
              {formatSessionType(session.type)}
            </span>
          )}
        </span>

        <span className="devtools-session-sidebar__meta">
          {session.pinned && (
            <span className="devtools-session-sidebar__pin-badge" title="Pinned">
              <BoxIcon name="bx-pin" size={12} />
            </span>
          )}
          <span
            className={`devtools-session-sidebar__dot devtools-session-sidebar__dot--${session.state}`}
            aria-label={stateLabel(session.state)}
          />
          <span className="devtools-session-sidebar__time">
            {formatRelativeTime(session.createdAt, now)}
          </span>
        </span>
      </button>
    </div>
  );
};

/* ── Component ───────────────────────────────────────────── */

export interface DevToolsSessionSidebarProps {
  className?: string;
  /** Active workspace path — passed to new sessions for workspace-aware tools */
  workspace?: string;
}

export const DevToolsSessionSidebar: React.FC<DevToolsSessionSidebarProps> = ({
  className,
  workspace,
}) => {
  const sessions = useDevToolsStore((s) => s.sessions);
  const activeSessionId = useDevToolsStore((s) => s.activeSessionId);
  const switchSession = useDevToolsStore((s) => s.switchSession);
  const closeSession = useDevToolsStore((s) => s.closeSession);
  const createSession = useDevToolsStore((s) => s.createSession);
  const renameSession = useDevToolsStore((s) => s.renameSession);
  const setSessionIcon = useDevToolsStore((s) => s.setSessionIcon);
  const setSessionColor = useDevToolsStore((s) => s.setSessionColor);
  const togglePin = useDevToolsStore((s) => s.togglePin);

  const now = useNow();

  // ── Picker state ───────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Search state ───────────────────────────────────────
  const [search, setSearch] = useState('');

  // ── Multi-select state ─────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedIds.size > 0;

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleDeleteInSelection = useCallback((id: string) => {
    const ids = selectedIds.has(id) ? [...selectedIds] : [id];
    ids.forEach((sid) => closeSession(sid));
    setSelectedIds(new Set());
  }, [selectedIds, closeSession]);

  const handlePinInSelection = useCallback((id: string) => {
    const ids = selectedIds.has(id) ? [...selectedIds] : [id];
    ids.forEach((sid) => togglePin(sid));
    setSelectedIds(new Set());
  }, [selectedIds, togglePin]);

  // Escape key clears selection
  useEffect(() => {
    if (!selectionMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSelection();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectionMode, clearSelection]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? sessions.filter((s) => s.name.toLowerCase().includes(q)) : sessions;
    const pinned = list.filter((s) => s.pinned);
    const unpinned = list.filter((s) => !s.pinned);
    return [...pinned, ...unpinned];
  }, [sessions, search]);

  // ── Context menu state ─────────────────────────────────
  const [menuTarget, setMenuTarget] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSub, setHoveredSub] = useState<'icon' | 'color' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenu = useCallback((id: string, x: number, y: number) => {
    setMenuTarget(id);
    setMenuPos({ x, y });
    setHoveredSub(null);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuTarget(null);
    setMenuPos(null);
    setHoveredSub(null);
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      openMenu(id, e.clientX, e.clientY);
    },
    [openMenu],
  );

  // Close menu on outside click
  useEffect(() => {
    if (!menuPos) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuPos, closeMenu]);

  // ── Copy ID ────────────────────────────────────────────
  const [copied, setCopied] = useState(false);

  // ── Rename state ───────────────────────────────────────
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const startRename = useCallback((session: DevSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
    closeMenu();
    setTimeout(() => renameInputRef.current?.select(), 30);
  }, [closeMenu]);

  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const v = renameValue.trim();
    if (v && v !== sessions.find((s) => s.id === renamingId)?.name) {
      renameSession(renamingId, v);
    }
    setRenamingId(null);
  }, [renamingId, renameValue, sessions, renameSession]);

  const handleRenameKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenamingId(null);
  }, [commitRename]);

  // ── Delete dialog state ────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (confirmDeleteId) el.showModal();
    else if (el.open) el.close();
  }, [confirmDeleteId]);

  const handleConfirmYes = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId) closeSession(confirmDeleteId);
    setConfirmDeleteId(null);
  }, [confirmDeleteId, closeSession]);

  const handleConfirmNo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  }, []);

  const handleDialogBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) setConfirmDeleteId(null);
  }, []);

  const deleteTargetSession = sessions.find((s) => s.id === confirmDeleteId);
  const menuSession = sessions.find((s) => s.id === menuTarget);

  const cls = ['devtools-session-sidebar', className].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      {/* Header */}
      <div className="devtools-session-sidebar__header">
        <h2 className="devtools-session-sidebar__title">Developer Tools</h2>
        <button
          type="button"
          className="devtools-session-sidebar__new-btn"
          onClick={() => setPickerOpen(true)}
          aria-label="New session"
        >
          <BoxIcon name="bx-plus" size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="devtools-session-sidebar__search">
        <span className="devtools-session-sidebar__search-icon">
          <BoxIcon name="bx-search" size={16} />
        </span>
        <input
          type="text"
          className="devtools-session-sidebar__search-input"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Session list */}
      {filteredSessions.length > 0 ? (
        <div className="devtools-session-sidebar__list">
          {selectionMode && (
            <div className="devtools-session-sidebar__selection-bar">
              <span>{selectedIds.size} selected</span>
              <button type="button" onClick={clearSelection}>
                <BoxIcon name="bx-x" size={16} /> Cancel
              </button>
            </div>
          )}
          {filteredSessions.map((session) => (
            <SwipeableItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              isRenaming={session.id === renamingId}
              isSelected={selectedIds.has(session.id)}
              selectionMode={selectionMode}
              now={now}
              onSelect={() => selectionMode ? handleToggleSelect(session.id) : switchSession(session.id)}
              onContextMenu={(e) => handleContextMenu(e, session.id)}
              onPin={() => togglePin(session.id)}
              onDelete={() => setConfirmDeleteId(session.id)}
              onToggleSelect={() => handleToggleSelect(session.id)}
              renameInputRef={session.id === renamingId ? renameInputRef : undefined}
              renameValue={renameValue}
              onRenameChange={(v) => setRenameValue(v)}
              onRenameBlur={commitRename}
              onRenameKey={handleRenameKey}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BoxIcon name="bx-terminal" size={40} />}
          title="No open sessions"
          description="Click + to create one"
        />
      )}

      {/* Context menu */}
      {menuPos && menuSession && (
        <div
          ref={menuRef}
          className="devtools-session-sidebar__menu"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          {/* Rename */}
          <button
            className="devtools-session-sidebar__menu-item"
            onClick={() => startRename(menuSession)}
            type="button"
          >
            <BoxIcon name="bx-edit-alt" size={15} /> Rename
          </button>

          {/* Copy ID */}
          <button
            className="devtools-session-sidebar__menu-item"
            onClick={() => {
              navigator.clipboard.writeText(menuSession.id);
              setCopied(true);
              setTimeout(() => { setCopied(false); closeMenu(); }, 600);
            }}
            type="button"
          >
            <BoxIcon name={copied ? 'bx-check' : 'bx-copy-alt'} size={15} />
            {copied ? 'Copied!' : 'Copy ID'}
          </button>

          {/* Set Icon submenu */}
          <div
            className="devtools-session-sidebar__menu-parent"
            onMouseEnter={() => setHoveredSub('icon')}
            onMouseLeave={() => setHoveredSub(null)}
          >
            <button className="devtools-session-sidebar__menu-item" type="button">
              <BoxIcon name="bx-palette" size={15} /> Set Icon
              <span className="devtools-session-sidebar__menu-chevron">
                <BoxIcon name="bx-chevron-right" size={14} />
              </span>
            </button>
            {hoveredSub === 'icon' && (
              <div className="devtools-session-sidebar__submenu">
                <div className="devtools-session-sidebar__icon-grid">
                  {DEVTOOLS_ICONS.map((ic) => (
                    <button
                      key={ic}
                      className={
                        'devtools-session-sidebar__icon-pick' +
                        (ic === menuSession.icon ? ' devtools-session-sidebar__icon-pick--active' : '')
                      }
                      onClick={() => { setSessionIcon(menuSession.id, ic); closeMenu(); }}
                      type="button"
                      title={ic.replace('bx-', '')}
                    >
                      <BoxIcon name={ic} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Set Color submenu */}
          <div
            className="devtools-session-sidebar__menu-parent"
            onMouseEnter={() => setHoveredSub('color')}
            onMouseLeave={() => setHoveredSub(null)}
          >
            <button className="devtools-session-sidebar__menu-item" type="button">
              <BoxIcon name="bx-color" size={15} /> Set Color
              <span className="devtools-session-sidebar__menu-chevron">
                <BoxIcon name="bx-chevron-right" size={14} />
              </span>
            </button>
            {hoveredSub === 'color' && (
              <div className="devtools-session-sidebar__submenu">
                <div className="devtools-session-sidebar__color-grid">
                  {SESSION_COLORS.map((c) => (
                    <button
                      key={c}
                      className={
                        'devtools-session-sidebar__color-pick' +
                        (c === menuSession.color ? ' devtools-session-sidebar__color-pick--active' : '')
                      }
                      style={{ background: c }}
                      onClick={() => { setSessionColor(menuSession.id, c); closeMenu(); }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pin / Unpin */}
          <button
            className="devtools-session-sidebar__menu-item"
            onClick={() => { closeMenu(); togglePin(menuSession.id); }}
            type="button"
          >
            <BoxIcon name={menuSession.pinned ? 'bx-unpin' : 'bx-pin'} size={15} />
            {menuSession.pinned ? 'Unpin' : 'Pin'}
          </button>

          {/* Select */}
          <button
            className="devtools-session-sidebar__menu-item"
            onClick={() => { closeMenu(); handleToggleSelect(menuSession.id); }}
            type="button"
          >
            <BoxIcon name="bx-checkbox-checked" size={15} /> Select
          </button>

          {/* Delete */}
          <button
            className="devtools-session-sidebar__menu-item devtools-session-sidebar__menu-item--danger"
            onClick={() => { closeMenu(); setConfirmDeleteId(menuSession.id); }}
            type="button"
          >
            <BoxIcon name="bx-trash" size={15} /> Delete
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <dialog
        ref={dialogRef}
        className="devtools-session-sidebar__dialog"
        onClick={handleDialogBackdrop}
      >
        <div className="devtools-session-sidebar__dialog-inner">
          <div className="devtools-session-sidebar__dialog-icon">
            <BoxIcon name="bx-trash" size={28} />
          </div>
          <h3 className="devtools-session-sidebar__dialog-title">Delete session?</h3>
          <p className="devtools-session-sidebar__dialog-body">
            "<strong>{deleteTargetSession?.name ?? 'Session'}</strong>" will be
            permanently removed and cannot be recovered.
          </p>
          <div className="devtools-session-sidebar__dialog-actions">
            <button
              className="devtools-session-sidebar__dialog-btn devtools-session-sidebar__dialog-btn--cancel"
              onClick={handleConfirmNo}
              type="button"
            >
              Cancel
            </button>
            <button
              className="devtools-session-sidebar__dialog-btn devtools-session-sidebar__dialog-btn--delete"
              onClick={handleConfirmYes}
              type="button"
            >
              <BoxIcon name="bx-trash" size={14} />
              Delete
            </button>
          </div>
        </div>
      </dialog>

      {/* New Session Picker */}
      {pickerOpen && (
        <NewSessionPicker
          onClose={() => setPickerOpen(false)}
          onCreate={createSession}
          workspace={workspace}
        />
      )}
    </div>
  );
};
