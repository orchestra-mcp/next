import { useState } from 'react';
import type { ReactNode } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import './Widget.css';

export interface WidgetAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface WidgetProps {
  /** Widget title displayed in header */
  title: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Widget body content */
  children: ReactNode;
  /** Icon displayed before the title */
  icon?: ReactNode;
  /** Action buttons rendered in the header */
  actions?: WidgetAction[];
  /** Whether the widget body can be collapsed */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Show a shimmer loading overlay */
  loading?: boolean;
  /** Error message to display */
  error?: string;
  /** Callback when retry button is clicked */
  onRefresh?: () => void;
  /** Widget size affecting padding */
  size?: 'small' | 'medium' | 'large';
  /** Right-click context menu handler on header */
  onContextMenu?: (e: React.MouseEvent) => void;
  /** Inline styles applied to the root element */
  style?: React.CSSProperties;
}

export const Widget = ({
  title,
  subtitle,
  children,
  icon,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  error,
  onRefresh,
  size = 'medium',
  onContextMenu,
  style,
}: WidgetProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const isCollapsed = collapsible && collapsed;

  const headerClasses = [
    'widget__header',
    isCollapsed ? 'widget__header--collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`widget widget--${size}${isCollapsed ? ' widget--collapsed' : ''}`} data-testid="widget" style={style}>
      <div className={headerClasses} onContextMenu={onContextMenu}>
        {icon && <span className="widget__icon">{icon}</span>}
        <div className="widget__title-group">
          <span className="widget__title">{title}</span>
          {subtitle && <span className="widget__subtitle">{subtitle}</span>}
        </div>
        <div className="widget__actions">
          {actions?.map((action) => (
            <button
              key={action.id}
              className="widget__action-btn"
              onClick={action.onClick}
              aria-label={action.label}
              title={action.label}
              type="button"
            >
              {action.icon ?? action.label}
            </button>
          ))}
          {onRefresh && (
            <button
              className="widget__action-btn"
              onClick={onRefresh}
              aria-label="Refresh"
              title="Refresh"
              type="button"
            >
              <BoxIcon name="bx-refresh" size={14} />
            </button>
          )}
          {collapsible && (
            <button
              className={`widget__collapse-btn${isCollapsed ? ' widget__collapse-btn--collapsed' : ''}`}
              onClick={() => setCollapsed((c) => !c)}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              type="button"
            >
              <BoxIcon name="bx-chevron-down" size={14} />
            </button>
          )}
        </div>
      </div>
      <div className={`widget__body${isCollapsed ? ' widget__body--hidden' : ''}`}>
        {error && (
          <div className="widget__error" role="alert">
            <span className="widget__error-text">{error}</span>
            {onRefresh && (
              <button
                className="widget__retry-btn"
                onClick={onRefresh}
                type="button"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {!error && children}
        {loading && !error && (
          <div className="widget__loading" data-testid="widget-loading">
            <div className="widget__shimmer" />
          </div>
        )}
      </div>
    </div>
  );
};
