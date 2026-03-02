import type { ReactNode } from 'react';
import { WarningIcon, ExtensionsIcon } from '@orchestra-mcp/icons';
import './StatusBar.css';

interface StatusBarProps {
  loadedCount?: number;
  notificationCount?: number;
  status?: string;
  children?: ReactNode;
}

/**
 * Desktop status bar showing app state, plugin count, and notifications.
 * Uses @orchestra-mcp/icons — no inline SVGs.
 */
export function StatusBar({
  loadedCount = 0,
  notificationCount = 0,
  status = 'Ready',
  children,
}: StatusBarProps) {
  return (
    <footer className="desktop-statusbar">
      <div className="desktop-statusbar__left">
        <span>{status}</span>
        <span>Orchestra v0.1.0</span>
        {children}
      </div>

      <div className="desktop-statusbar__right">
        {notificationCount > 0 && (
          <span className="desktop-statusbar__notification">
            <WarningIcon size={12} />
            {notificationCount}
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ExtensionsIcon size={12} />
          {loadedCount}
        </span>
      </div>
    </footer>
  );
}
