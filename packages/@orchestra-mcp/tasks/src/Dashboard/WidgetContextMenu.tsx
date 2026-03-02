import { useEffect, useRef } from 'react';
import './WidgetContextMenu.css';

export interface WidgetContextMenuProps {
  x: number;
  y: number;
  widgetId: string;
  /** Current grid column count (1/2/4/6/12) */
  columns: number;
  /** Current colSpan of this widget */
  currentColSpan: number;
  isLocked?: boolean;
  onColSpanChange: (widgetId: string, colSpan: number) => void;
  onHide: (widgetId: string) => void;
  onLock: (widgetId: string) => void;
  onClose: () => void;
}

/** Generate valid colSpan options: 1 through columns, only divisors that make sense */
function getColSpanOptions(columns: number): number[] {
  if (columns <= 1) return [1];
  const opts: number[] = [];
  for (let i = 1; i <= columns; i++) {
    if (columns % i === 0 || i === columns) opts.push(i);
  }
  // Always include columns itself
  if (!opts.includes(columns)) opts.push(columns);
  return opts;
}

export const WidgetContextMenu = ({
  x,
  y,
  widgetId,
  columns,
  currentColSpan,
  isLocked = false,
  onColSpanChange,
  onHide,
  onLock,
  onClose,
}: WidgetContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Clamp to viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    if (x > maxX) menuRef.current.style.left = `${maxX}px`;
    if (y > maxY) menuRef.current.style.top = `${maxY}px`;
  }, [x, y]);

  const spanOptions = getColSpanOptions(columns);

  return (
    <div
      ref={menuRef}
      className="widget-ctx"
      style={{ left: x, top: y }}
      data-testid="widget-context-menu"
    >
      <div className="widget-ctx__group">
        <span className="widget-ctx__label">Width</span>
        {spanOptions.map((span) => (
          <button
            key={span}
            type="button"
            className={`widget-ctx__item${span === currentColSpan ? ' widget-ctx__item--active' : ''}`}
            onClick={() => { onColSpanChange(widgetId, span); onClose(); }}
          >
            {span === columns ? 'Full width' : `${span} col${span > 1 ? 's' : ''}`}
          </button>
        ))}
      </div>
      <div className="widget-ctx__divider" />
      <button
        type="button"
        className="widget-ctx__item"
        onClick={() => { onHide(widgetId); onClose(); }}
      >
        Hide Widget
      </button>
      <button
        type="button"
        className="widget-ctx__item"
        onClick={() => { onLock(widgetId); onClose(); }}
      >
        {isLocked ? 'Unlock Widget' : 'Lock Widget'}
      </button>
    </div>
  );
};
