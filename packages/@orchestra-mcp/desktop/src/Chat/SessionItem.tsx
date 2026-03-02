import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SessionItem.css';

const SESSION_ICONS = [
  'bx-chat', 'bx-bot', 'bx-code-alt', 'bx-bug', 'bx-bulb',
  'bx-rocket', 'bx-terminal', 'bx-git-branch', 'bx-brain', 'bx-wrench',
  'bx-book-open', 'bx-data', 'bx-shield', 'bx-world', 'bx-star',
];

const SESSION_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export interface SessionItemProps {
  id: string;
  title: string;
  lastMessage?: string;
  date: string;
  model: string;
  active?: boolean;
  pinned?: boolean;
  messageCount?: number;
  icon?: string;
  color?: string;
  /** Whether this item is currently selected in multi-select mode */
  selected?: boolean;
  /** Whether multi-select mode is active (any item is selected) */
  selectionMode?: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onExport?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onIconChange?: (id: string, icon: string) => void;
  onColorChange?: (id: string, color: string) => void;
  /** Toggle selection of this item (enters/manages multi-select) */
  onToggleSelect?: (id: string) => void;
}

/** Map model ID to short human-readable name. */
const MODEL_LABELS: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-5-20250929': 'Sonnet 4.5',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
};

function humanModel(model: string): string {
  return MODEL_LABELS[model] ?? model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
}

/** Shared clock that ticks every 60s — all SessionItems share one timer. */
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

/** Hook: returns a stable `now` timestamp that updates every 60s. */
function useNow(): number {
  return useSyncExternalStore(subscribeClock, getClockNow, getClockNow);
}

/** Format ISO date string as relative time using a stable `now`. */
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

const SWIPE_THRESHOLD = 70;
const HOLD_DELAY = 200;
const LONG_PRESS_DELAY = 500;

export function SessionItem({
  id,
  title,
  lastMessage,
  date,
  model,
  active = false,
  pinned = false,
  icon,
  color,
  selected = false,
  selectionMode = false,
  onSelect,
  onDelete,
  onPin,
  onRename,
  onExport,
  onDuplicate,
  onIconChange,
  onColorChange,
  onToggleSelect,
}: SessionItemProps) {
  const now = useNow();

  // ── Swipe ─────────────────────────────────────────────
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
    // Cancel long-press if user is swiping
    if (longPressTimer.current && Math.abs(dx) > 8) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    const max = SWIPE_THRESHOLD + 20;
    const clamped = Math.max(-max, Math.min(max, dx));
    if (clamped > 0 && !onPin) return;
    if (clamped < 0 && !onDelete) return;
    setOffsetX(clamped);
  }, [onPin, onDelete]);

  const handleDocUp = useCallback(() => {
    cleanup();
    setOffsetX((prev) => {
      if (prev >= SWIPE_THRESHOLD && onPin) onPin(id);
      else if (prev <= -SWIPE_THRESHOLD && onDelete) setConfirmDelete(true);
      return 0;
    });
    setTimeout(() => { swipingRef.current = false; }, 50);
  }, [id, onPin, onDelete, cleanup]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore right-click — let context menu handle it without triggering swipe
    if (e.button !== 0) return;
    startX.current = e.clientX;
    longPressFired.current = false;
    cleanup();

    // Long-press to enter selection mode
    if (onToggleSelect) {
      longPressTimer.current = setTimeout(() => {
        longPressFired.current = true;
        onToggleSelect(id);
      }, LONG_PRESS_DELAY);
    }

    holdTimer.current = setTimeout(() => {
      document.addEventListener('pointermove', handleDocMove);
      document.addEventListener('pointerup', handleDocUp, { once: true });
    }, HOLD_DELAY);
  }, [cleanup, handleDocMove, handleDocUp, onToggleSelect, id]);

  const onPointerUp = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleClick = useCallback(() => {
    if (swipingRef.current || longPressFired.current) return;
    // In selection mode, click toggles selection instead of navigating
    if (selectionMode && onToggleSelect) {
      onToggleSelect(id);
      return;
    }
    onSelect(id);
  }, [id, onSelect, selectionMode, onToggleSelect]);

  // ── Context menu ──────────────────────────────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSub, setHoveredSub] = useState<'icon' | 'color' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const openMenu = useCallback((x: number, y: number) => {
    setMenuPos({ x, y });
    setHoveredSub(null);
  }, []);

  const closeMenu = useCallback(() => { setMenuPos(null); setHoveredSub(null); }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  }, [openMenu]);

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

  // ── Delete dialog ─────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (confirmDelete) el.showModal();
    else if (el.open) el.close();
  }, [confirmDelete]);

  const handleConfirmYes = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
    onDelete?.(id);
  }, [id, onDelete]);

  const handleConfirmNo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  }, []);

  const handleDialogBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) setConfirmDelete(false);
  }, []);

  // ── Rename inline ─────────────────────────────────────
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (renaming) {
      setRenameValue(title);
      setTimeout(() => renameInputRef.current?.select(), 30);
    }
  }, [renaming, title]);

  const commitRename = useCallback(() => {
    const v = renameValue.trim();
    if (v && v !== title) onRename?.(id, v);
    setRenaming(false);
  }, [id, renameValue, title, onRename]);

  const handleRenameKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenaming(false);
  }, [commitRename]);

  // ── Context menu actions ──────────────────────────────
  const [copied, setCopied] = useState(false);

  const showPin = offsetX > 10;
  const showDelete = offsetX < -10;

  return (
    <div className={`session-item__wrapper${active ? ' session-item__wrapper--active' : ''}${selected ? ' session-item__wrapper--selected' : ''}`}>
      {/* Swipe action panels */}
      <div className={`session-item__action session-item__action--pin${showPin ? ' session-item__action--visible' : ''}`}>
        <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={18} />
        <span>{pinned ? 'Unpin' : 'Pin'}</span>
      </div>
      <div className={`session-item__action session-item__action--delete${showDelete ? ' session-item__action--visible' : ''}`}>
        <BoxIcon name="bx-trash" size={18} />
        <span>Delete</span>
      </div>

      {/* Swipeable card */}
      <button
        className={`session-item${active ? ' session-item--active' : ''}${selected ? ' session-item--selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          transform: offsetX ? `translateX(${offsetX}px)` : undefined,
          transition: offsetX ? 'none' : 'transform 0.25s ease',
        }}
      >
        {/* Selection checkbox */}
        {selectionMode && (
          <span className={`session-item__checkbox${selected ? ' session-item__checkbox--checked' : ''}`}>
            {selected && <BoxIcon name="bx-check" size={14} />}
          </span>
        )}

        <span className="session-item__icon" style={color ? { color } : undefined}>
          <BoxIcon name={icon || 'bx-chat'} size={18} />
        </span>

        <div className="session-item__body">
          {renaming ? (
            <input
              ref={renameInputRef}
              className="session-item__rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="session-item__title">{title}</span>
          )}
          {lastMessage && !renaming && (
            <span className="session-item__preview">{lastMessage}</span>
          )}
          <span className="session-item__model">{humanModel(model)}</span>
        </div>

        <div className="session-item__meta">
          <span className="session-item__date">{formatRelativeTime(date, now)}</span>
          {pinned && (
            <span className="session-item__pin-badge" aria-label="Pinned">
              <BoxIcon name="bxs-pin" size={12} />
            </span>
          )}
        </div>
      </button>

      {/* Context menu */}
      {menuPos && (
        <div
          ref={menuRef}
          className="session-item__menu"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          {selectionMode ? (
            /* Selection-mode menu: only Pin + Delete */
            <>
              {onPin && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); onPin(id); }} type="button">
                  <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onDelete && (
                <button className="session-item__menu-item session-item__menu-item--danger" onClick={() => { closeMenu(); setConfirmDelete(true); }} type="button">
                  <BoxIcon name="bx-trash" size={15} /> Delete
                </button>
              )}
            </>
          ) : (
            /* Normal menu */
            <>
              {onToggleSelect && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); onToggleSelect(id); }} type="button">
                  <BoxIcon name="bx-select-multiple" size={15} /> Select
                </button>
              )}
              {onRename && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); setRenaming(true); }} type="button">
                  <BoxIcon name="bx-edit-alt" size={15} /> Rename
                </button>
              )}
              <button className="session-item__menu-item" onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => { setCopied(false); closeMenu(); }, 600); }} type="button">
                <BoxIcon name={copied ? 'bx-check' : 'bx-copy-alt'} size={15} /> {copied ? 'Copied!' : 'Copy ID'}
              </button>
              {onPin && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); onPin(id); }} type="button">
                  <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onIconChange && (
                <div
                  className="session-item__menu-parent"
                  onMouseEnter={() => setHoveredSub('icon')}
                  onMouseLeave={() => setHoveredSub(null)}
                >
                  <button className="session-item__menu-item" type="button">
                    <BoxIcon name="bx-palette" size={15} /> Set Icon
                    <span className="session-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                  </button>
                  {hoveredSub === 'icon' && (
                    <div className="session-item__submenu">
                      <div className="session-item__icon-grid">
                        {SESSION_ICONS.map((ic) => (
                          <button
                            key={ic}
                            className={`session-item__icon-pick${ic === icon ? ' session-item__icon-pick--active' : ''}`}
                            onClick={() => { onIconChange(id, ic); closeMenu(); }}
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
              )}
              {onColorChange && (
                <div
                  className="session-item__menu-parent"
                  onMouseEnter={() => setHoveredSub('color')}
                  onMouseLeave={() => setHoveredSub(null)}
                >
                  <button className="session-item__menu-item" type="button">
                    <BoxIcon name="bx-color" size={15} /> Set Color
                    <span className="session-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                  </button>
                  {hoveredSub === 'color' && (
                    <div className="session-item__submenu">
                      <div className="session-item__color-grid">
                        {SESSION_COLORS.map((c) => (
                          <button
                            key={c}
                            className={`session-item__color-pick${c === color ? ' session-item__color-pick--active' : ''}`}
                            style={{ background: c }}
                            onClick={() => { onColorChange(id, c); closeMenu(); }}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {onDuplicate && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); onDuplicate(id); }} type="button">
                  <BoxIcon name="bx-copy" size={15} /> Duplicate
                </button>
              )}
              {onExport && (
                <button className="session-item__menu-item" onClick={() => { closeMenu(); onExport(id); }} type="button">
                  <BoxIcon name="bx-export" size={15} /> Export
                </button>
              )}
              {onDelete && (
                <button className="session-item__menu-item session-item__menu-item--danger" onClick={() => { closeMenu(); setConfirmDelete(true); }} type="button">
                  <BoxIcon name="bx-trash" size={15} /> Delete
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <dialog
        ref={dialogRef}
        className="session-item__dialog"
        onClick={handleDialogBackdrop}
      >
        <div className="session-item__dialog-inner">
          <div className="session-item__dialog-icon">
            <BoxIcon name="bx-trash" size={28} />
          </div>
          <h3 className="session-item__dialog-title">Delete conversation?</h3>
          <p className="session-item__dialog-body">
            "<strong>{title}</strong>" will be permanently deleted and cannot be recovered.
          </p>
          <div className="session-item__dialog-actions">
            <button
              className="session-item__dialog-btn session-item__dialog-btn--cancel"
              onClick={handleConfirmNo}
              type="button"
            >
              Cancel
            </button>
            <button
              className="session-item__dialog-btn session-item__dialog-btn--delete"
              onClick={handleConfirmYes}
              type="button"
            >
              <BoxIcon name="bx-trash" size={14} />
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
