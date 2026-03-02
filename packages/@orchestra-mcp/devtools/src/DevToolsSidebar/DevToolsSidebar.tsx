import React from 'react';
import type { ReactNode } from 'react';
import { useDevToolsStore } from '../stores/useDevToolsStore';
import { SessionContent } from '../SessionContent';
import './DevToolsSidebar.css';

export interface DevToolsSidebarProps {
  className?: string;
  /** Welcome content shown when no session is selected */
  welcomeContent?: ReactNode;
}

export const DevToolsSidebar: React.FC<DevToolsSidebarProps> = ({ className, welcomeContent }) => {
  const sessions = useDevToolsStore((s) => s.sessions);
  const activeSessionId = useDevToolsStore((s) => s.activeSessionId);
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const cls = ['devtools-sidebar', className].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="devtools-sidebar__content">
        {activeSession ? (
          <SessionContent />
        ) : welcomeContent ? (
          welcomeContent
        ) : null}
      </div>
    </div>
  );
};
