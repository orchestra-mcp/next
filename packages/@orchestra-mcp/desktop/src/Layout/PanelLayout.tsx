import type { ReactNode } from 'react';
import { PanelTitleBar } from './PanelTitleBar';
import './PanelLayout.css';

interface PanelLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  titleBarActions?: ReactNode;
  children: ReactNode;
  showSidebar?: boolean;
  sidebar?: ReactNode;
}

/**
 * Standard layout for panel windows opened via window manager.
 * Provides title bar, optional sidebar, header, and scrollable content.
 */
export function PanelLayout({
  title,
  description,
  actions,
  titleBarActions,
  children,
  showSidebar = false,
  sidebar,
}: PanelLayoutProps) {
  return (
    <div className="desktop-panel">
      <PanelTitleBar title={title} actions={titleBarActions} />

      <div className="desktop-panel__body">
        {showSidebar && sidebar && (
          <div className="desktop-panel__sidebar">{sidebar}</div>
        )}

        <div className="desktop-panel__content-wrapper">
          {(description || actions) && (
            <div className="desktop-panel__header">
              {description && (
                <p className="desktop-panel__description">{description}</p>
              )}
              {actions && (
                <div className="desktop-panel__actions">{actions}</div>
              )}
            </div>
          )}

          <div className="desktop-panel__content">{children}</div>
        </div>
      </div>
    </div>
  );
}
