import { useEffect, useRef } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import './DashboardSettings.css';

export interface DashboardSettingsProps {
  x: number;
  y: number;
  columns: number;
  onColumnsChange: (cols: number) => void;
  widgets: Array<{ id: string; type: string; title: string; hidden: boolean }>;
  onWidgetToggle: (widgetId: string) => void;
  onClose: () => void;
}

const COLUMN_OPTIONS = [1, 2, 4, 6, 12] as const;

export const DashboardSettings = ({
  x,
  y,
  columns,
  onColumnsChange,
  widgets,
  onWidgetToggle,
  onClose,
}: DashboardSettingsProps) => {
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

  return (
    <div
      ref={menuRef}
      className="dashboard-settings"
      style={{ left: x, top: y }}
      data-testid="dashboard-settings"
    >
      <div className="dashboard-settings__section">
        <label className="dashboard-settings__label">Columns per row</label>
        <div className="dashboard-settings__chips">
          {COLUMN_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`dashboard-settings__chip${columns === n ? ' dashboard-settings__chip--active' : ''}`}
              onClick={() => onColumnsChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-settings__divider" />

      <div className="dashboard-settings__section">
        <label className="dashboard-settings__label">Widgets</label>
        <ul className="dashboard-settings__widget-list">
          {widgets.map((w) => (
            <li key={w.id} className="dashboard-settings__widget-row">
              <span className="dashboard-settings__widget-name">{w.title}</span>
              <button
                type="button"
                className={`dashboard-settings__toggle${w.hidden ? '' : ' dashboard-settings__toggle--on'}`}
                onClick={() => onWidgetToggle(w.id)}
                aria-label={w.hidden ? `Show ${w.title}` : `Hide ${w.title}`}
              >
                <BoxIcon name={w.hidden ? 'bx-hide' : 'bx-show'} size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
