import type { ReactNode } from 'react';
import './PanelTitleBar.css';

interface PanelTitleBarProps {
  title: string;
  actions?: ReactNode;
}

/**
 * Draggable title bar for Wails panel windows.
 * macOS traffic lights handled via MacTitleBarHiddenInset in Go.
 * Double-click zoom handled natively via Objective-C clickCount detection.
 */
export function PanelTitleBar({ title, actions }: PanelTitleBarProps) {
  return (
    <div className="desktop-panel-titlebar" style={{ position: 'relative' }}>
      <span className="desktop-panel-titlebar__title">{title}</span>
      {actions && (
        <div className="desktop-panel-titlebar__actions">{actions}</div>
      )}
    </div>
  );
}
