"use client";

import { ReactNode, useState } from 'react';
import './Panel.css';

export interface PanelProps {
  /** Panel title */
  title?: string;
  /** Panel content */
  children: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state (only works if collapsible is true) */
  defaultCollapsed?: boolean;
  /** Custom className */
  className?: string;
  /** Optional header actions (buttons, etc.) */
  headerActions?: ReactNode;
}

export const Panel = ({
  title,
  children,
  footer,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  headerActions,
}: PanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`panel ${className}`}>
      {title && (
        <div
          className={`panel-header ${collapsible ? 'collapsible' : ''}`}
          onClick={toggleCollapse}
        >
          <div className="panel-header-left">
            {collapsible && (
              <span className={`panel-collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            <h3 className="panel-title">{title}</h3>
          </div>
          {headerActions && (
            <div className="panel-header-actions" onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
        </div>
      )}
      {!isCollapsed && (
        <>
          <div className="panel-content">{children}</div>
          {footer && <div className="panel-footer">{footer}</div>}
        </>
      )}
    </div>
  );
};
