import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ProjectItem.css';

const PROJECT_ICONS = [
  'bx-folder', 'bx-code-alt', 'bx-bug', 'bx-rocket', 'bx-terminal',
  'bx-git-branch', 'bx-wrench', 'bx-book-open', 'bx-data', 'bx-shield',
  'bx-world', 'bx-star', 'bx-bolt', 'bx-layer', 'bx-cube',
];

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export interface ProjectItemProps {
  slug: string;
  name: string;
  status: string;
  taskCount: number;
  completionPercent: number;
  active?: boolean;
  pinned?: boolean;
  icon?: string;
  color?: string;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect: (slug: string) => void;
  onDelete?: (slug: string) => void;
  onPin?: (slug: string) => void;
  onRename?: (slug: string, newName: string) => void;
  onIconChange?: (slug: string, icon: string) => void;
  onColorChange?: (slug: string, color: string) => void;
  onUpdateKey?: (slug: string) => void;
  onToggleSelect?: (slug: string) => void;
  onIconClick?: (slug: string) => void;
}

const SWIPE_THRESHOLD = 70;
const HOLD_DELAY = 200;
const LONG_PRESS_DELAY = 500;

export function ProjectItem({
  slug,
  name,
  status,
  taskCount,
  completionPercent,
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
  onIconChange,
  onColorChange,
  onUpdateKey,
  onToggleSelect,
  onIconClick,
}: ProjectItemProps) {
  // -- Swipe ------------------------------------------------
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
    const clamped = Math.max(-max, Math.min(max, dx));
    if (clamped > 0 && !onPin) return;
    if (clamped < 0 && !onDelete) return;
    setOffsetX(clamped);
  }, [onPin, onDelete]);

  const handleDocUp = useCallback(() => {
    cleanup();
    setOffsetX((prev) => {
      if (prev >= SWIPE_THRESHOLD && onPin) onPin(slug);
      else if (prev <= -SWIPE_THRESHOLD && onDelete) setConfirmDelete(true);
      return 0;
    });
    setTimeout(() => { swipingRef.current = false; }, 50);
  }, [slug, onPin, onDelete, cleanup]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore right-click — let context menu handle it without triggering swipe
    if (e.button !== 0) return;
    startX.current = e.clientX;
    longPressFired.current = false;
    cleanup();

    if (onToggleSelect) {
      longPressTimer.current = setTimeout(() => {
        longPressFired.current = true;
        onToggleSelect(slug);
      }, LONG_PRESS_DELAY);
    }

    holdTimer.current = setTimeout(() => {
      document.addEventListener('pointermove', handleDocMove);
      document.addEventListener('pointerup', handleDocUp, { once: true });
    }, HOLD_DELAY);
  }, [cleanup, handleDocMove, handleDocUp, onToggleSelect, slug]);

  const onPointerUp = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleClick = useCallback(() => {
    if (swipingRef.current || longPressFired.current) return;
    if (selectionMode && onToggleSelect) {
      onToggleSelect(slug);
      return;
    }
    onSelect(slug);
  }, [slug, onSelect, selectionMode, onToggleSelect]);

  // -- Context menu -----------------------------------------
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

  // After the menu mounts, clamp it inside the viewport so it never clips off-screen.
  const clamped = useRef(false);
  useLayoutEffect(() => {
    if (!menuPos) { clamped.current = false; return; }
    if (clamped.current || !menuRef.current) return;
    clamped.current = true;
    const rect = menuRef.current.getBoundingClientRect();
    let { x, y } = menuPos;
    if (y + rect.height > window.innerHeight - 8) {
      y = Math.max(8, window.innerHeight - rect.height - 8);
    }
    if (x + rect.width > window.innerWidth - 8) {
      x = Math.max(8, window.innerWidth - rect.width - 8);
    }
    if (x !== menuPos.x || y !== menuPos.y) {
      setMenuPos({ x, y });
    }
  });

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

  // -- Delete dialog ----------------------------------------
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
    onDelete?.(slug);
  }, [slug, onDelete]);

  const handleConfirmNo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
  }, []);

  const handleDialogBackdrop = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) setConfirmDelete(false);
  }, []);

  // -- Rename inline ----------------------------------------
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (renaming) {
      setRenameValue(name);
      setTimeout(() => renameInputRef.current?.select(), 30);
    }
  }, [renaming, name]);

  const commitRename = useCallback(() => {
    const v = renameValue.trim();
    if (v && v !== name) onRename?.(slug, v);
    setRenaming(false);
  }, [slug, renameValue, name, onRename]);

  const handleRenameKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setRenaming(false);
  }, [commitRename]);

  // -- Context menu actions ---------------------------------
  const [copied, setCopied] = useState(false);

  const showPin = offsetX > 10;
  const showDelete = offsetX < -10;

  return (
    <div className={`project-item__wrapper${active ? ' project-item__wrapper--active' : ''}${selected ? ' project-item__wrapper--selected' : ''}`}>
      {/* Swipe action panels */}
      <div className={`project-item__action project-item__action--pin${showPin ? ' project-item__action--visible' : ''}`}>
        <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={18} />
        <span>{pinned ? 'Unpin' : 'Pin'}</span>
      </div>
      <div className={`project-item__action project-item__action--delete${showDelete ? ' project-item__action--visible' : ''}`}>
        <BoxIcon name="bx-trash" size={18} />
        <span>Delete</span>
      </div>

      {/* Swipeable card */}
      <button
        className={`project-item${active ? ' project-item--active' : ''}${selected ? ' project-item--selected' : ''}`}
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
          <span className={`project-item__checkbox${selected ? ' project-item__checkbox--checked' : ''}`}>
            {selected && <BoxIcon name="bx-check" size={14} />}
          </span>
        )}

        <span
          className="project-item__icon"
          style={color ? { color } : undefined}
          onClick={(e) => {
            if (onIconClick) {
              e.stopPropagation();
              onIconClick(slug);
            }
          }}
        >
          <BoxIcon name={icon || 'bx-folder'} size={18} />
        </span>

        <div className="project-item__body">
          {renaming ? (
            <input
              ref={renameInputRef}
              className="project-item__rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="project-item__title">{name}</span>
          )}
          {!renaming && (
            <span className="project-item__preview">
              {taskCount} tasks &middot; {Math.round(completionPercent)}%
            </span>
          )}
          <span className="project-item__status">{status}</span>
        </div>

        <div className="project-item__meta">
          {pinned && (
            <span className="project-item__pin-badge" aria-label="Pinned">
              <BoxIcon name="bxs-pin" size={12} />
            </span>
          )}
        </div>
      </button>

      {/* Context menu */}
      {menuPos && (
        <div
          ref={menuRef}
          className="project-item__menu"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          {selectionMode ? (
            <>
              {onPin && (
                <button className="project-item__menu-item" onClick={() => { closeMenu(); onPin(slug); }} type="button">
                  <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onDelete && (
                <button className="project-item__menu-item project-item__menu-item--danger" onClick={() => { closeMenu(); setConfirmDelete(true); }} type="button">
                  <BoxIcon name="bx-trash" size={15} /> Delete
                </button>
              )}
            </>
          ) : (
            <>
              {onToggleSelect && (
                <button className="project-item__menu-item" onClick={() => { closeMenu(); onToggleSelect(slug); }} type="button">
                  <BoxIcon name="bx-select-multiple" size={15} /> Select
                </button>
              )}
              {onRename && (
                <button className="project-item__menu-item" onClick={() => { closeMenu(); setRenaming(true); }} type="button">
                  <BoxIcon name="bx-edit-alt" size={15} /> Rename
                </button>
              )}
              <button className="project-item__menu-item" onClick={() => { navigator.clipboard.writeText(slug); setCopied(true); setTimeout(() => { setCopied(false); closeMenu(); }, 600); }} type="button">
                <BoxIcon name={copied ? 'bx-check' : 'bx-copy-alt'} size={15} /> {copied ? 'Copied!' : 'Copy Slug'}
              </button>
              {onPin && (
                <button className="project-item__menu-item" onClick={() => { closeMenu(); onPin(slug); }} type="button">
                  <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onIconChange && (
                <div
                  className="project-item__menu-parent"
                  onMouseEnter={() => setHoveredSub('icon')}
                  onMouseLeave={() => setHoveredSub(null)}
                >
                  <button className="project-item__menu-item" type="button">
                    <BoxIcon name="bx-palette" size={15} /> Set Icon
                    <span className="project-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                  </button>
                  {hoveredSub === 'icon' && (
                    <div className="project-item__submenu">
                      <div className="project-item__icon-grid">
                        {PROJECT_ICONS.map((ic) => (
                          <button
                            key={ic}
                            className={`project-item__icon-pick${ic === icon ? ' project-item__icon-pick--active' : ''}`}
                            onClick={() => { onIconChange(slug, ic); closeMenu(); }}
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
                  className="project-item__menu-parent"
                  onMouseEnter={() => setHoveredSub('color')}
                  onMouseLeave={() => setHoveredSub(null)}
                >
                  <button className="project-item__menu-item" type="button">
                    <BoxIcon name="bx-color" size={15} /> Set Color
                    <span className="project-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                  </button>
                  {hoveredSub === 'color' && (
                    <div className="project-item__submenu">
                      <div className="project-item__color-grid">
                        {PROJECT_COLORS.map((c) => (
                          <button
                            key={c}
                            className={`project-item__color-pick${c === color ? ' project-item__color-pick--active' : ''}`}
                            style={{ background: c }}
                            onClick={() => { onColorChange(slug, c); closeMenu(); }}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {onUpdateKey && (
                <button className="project-item__menu-item" onClick={() => { closeMenu(); onUpdateKey(slug); }} type="button">
                  <BoxIcon name="bx-key" size={15} /> Update Key
                </button>
              )}
              {onDelete && (
                <button className="project-item__menu-item project-item__menu-item--danger" onClick={() => { closeMenu(); setConfirmDelete(true); }} type="button">
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
        className="project-item__dialog"
        onClick={handleDialogBackdrop}
      >
        <div className="project-item__dialog-inner">
          <div className="project-item__dialog-icon">
            <BoxIcon name="bx-trash" size={28} />
          </div>
          <h3 className="project-item__dialog-title">Delete project?</h3>
          <p className="project-item__dialog-body">
            "<strong>{name}</strong>" will be permanently deleted and cannot be recovered.
          </p>
          <div className="project-item__dialog-actions">
            <button
              className="project-item__dialog-btn project-item__dialog-btn--cancel"
              onClick={handleConfirmNo}
              type="button"
            >
              Cancel
            </button>
            <button
              className="project-item__dialog-btn project-item__dialog-btn--delete"
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
