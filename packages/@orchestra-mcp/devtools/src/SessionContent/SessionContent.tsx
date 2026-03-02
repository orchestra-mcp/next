import React, { useMemo, useCallback } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useDevToolsStore } from '../stores/useDevToolsStore';
import { getSessionProvider } from '../registry/SessionRegistry';
import type { DevSession } from '../types';
import './SessionContent.css';

export interface SessionContentProps {
  className?: string;
}

export const SessionContent: React.FC<SessionContentProps> = ({ className }) => {
  const { sessions, activeSessionId, updateSession } = useDevToolsStore();

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const handleUpdateState = useCallback(
    (session: DevSession) => (data: Record<string, unknown>) => {
      // If updating state or connectionConfig, apply directly to session root
      // Otherwise, merge into sessionData
      const updates: Partial<DevSession> = {};

      if (data.state !== undefined) {
        updates.state = data.state as DevSession['state'];
      }
      if (data.connectionConfig !== undefined) {
        updates.connectionConfig = { ...session.connectionConfig, ...(data.connectionConfig as Record<string, unknown>) };
      }

      // Merge remaining fields into sessionData
      const sessionDataFields = Object.keys(data).filter(k => k !== 'state' && k !== 'connectionConfig');
      if (sessionDataFields.length > 0) {
        const sessionDataUpdate: Record<string, unknown> = {};
        sessionDataFields.forEach(k => { sessionDataUpdate[k] = data[k]; });
        updates.sessionData = { ...session.sessionData, ...sessionDataUpdate };
      }

      updateSession(session.id, updates);
    },
    [updateSession],
  );

  const handleConnect = useCallback(
    (session: DevSession) => () => {
      updateSession(session.id, { state: 'connecting' });
    },
    [updateSession],
  );

  const handleDisconnect = useCallback(
    (session: DevSession) => () => {
      updateSession(session.id, { state: 'disconnected' });
    },
    [updateSession],
  );

  const cls = ['session-content', className].filter(Boolean).join(' ');

  if (!activeSession) {
    return (
      <div className={cls}>
        <div className="session-content__empty">
          No session selected.
        </div>
      </div>
    );
  }

  return (
    <div className={cls}>
      {sessions.map((session) => {
        const provider = getSessionProvider(session.type);
        const isActive = session.id === activeSessionId;
        const Component = provider?.component;

        return (
          <div
            key={session.id}
            className={
              'session-content__panel' +
              (isActive ? ' session-content__panel--active' : '')
            }
            aria-hidden={!isActive}
          >
            {Component ? (
              <Component
                session={session}
                onUpdateState={handleUpdateState(session)}
                onConnect={handleConnect(session)}
                onDisconnect={handleDisconnect(session)}
              />
            ) : (
              <div className="session-content__fallback">
                <BoxIcon name={session.icon} size={28} className="session-content__fallback-icon" />
                <p>No provider registered for &ldquo;{session.type}&rdquo;.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
