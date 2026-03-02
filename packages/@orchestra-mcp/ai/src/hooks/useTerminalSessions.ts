import { useState, useCallback } from 'react';
import type { BashEvent, TerminalEvent } from '../types/events';

export interface TerminalSession {
  id: string;
  command: string;
  output: string;
  exitCode?: number;
  cwd?: string;
  isRunning: boolean;
  startedAt: string;
  endedAt?: string;
}

export interface UseTerminalSessionsResult {
  sessions: TerminalSession[];
  activeSession: TerminalSession | null;
  activeSessionId: string | null;
  /** Open a terminal session from a BashEvent */
  openFromBash: (event: BashEvent) => string;
  /** Open a terminal session from a TerminalEvent */
  openFromTerminal: (event: TerminalEvent) => string;
  /** Select a session as active */
  setActive: (sessionId: string | null) => void;
  /** Append output to a running session */
  appendOutput: (sessionId: string, chunk: string) => void;
  /** Mark a session as completed */
  completeSession: (sessionId: string, exitCode: number) => void;
  /** Close and remove a session */
  closeSession: (sessionId: string) => void;
}

export function useTerminalSessions(): UseTerminalSessionsResult {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const openFromBash = useCallback((event: BashEvent): string => {
    const session: TerminalSession = {
      id: event.id,
      command: event.command,
      output: event.output ?? '',
      exitCode: event.exitCode,
      cwd: event.cwd,
      isRunning: event.status === 'running',
      startedAt: event.timestamp ?? new Date().toISOString(),
    };
    if (event.exitCode !== undefined) {
      session.endedAt = new Date().toISOString();
    }
    setSessions((prev) => {
      const exists = prev.findIndex((s) => s.id === event.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = session;
        return copy;
      }
      return [...prev, session];
    });
    setActiveSessionId(event.id);
    return event.id;
  }, []);

  const openFromTerminal = useCallback((event: TerminalEvent): string => {
    const session: TerminalSession = {
      id: event.sessionId ?? event.id,
      command: event.command,
      output: event.output ?? '',
      exitCode: event.exitCode,
      cwd: event.cwd,
      isRunning: event.isRunning ?? event.status === 'running',
      startedAt: event.timestamp ?? new Date().toISOString(),
    };
    if (event.exitCode !== undefined) {
      session.endedAt = new Date().toISOString();
    }
    setSessions((prev) => {
      const exists = prev.findIndex((s) => s.id === session.id);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = session;
        return copy;
      }
      return [...prev, session];
    });
    setActiveSessionId(session.id);
    return session.id;
  }, []);

  const setActive = useCallback((id: string | null) => {
    setActiveSessionId(id);
  }, []);

  const appendOutput = useCallback((sessionId: string, chunk: string) => {
    setSessions((prev) =>
      prev.map((s) => s.id === sessionId ? { ...s, output: s.output + chunk } : s),
    );
  }, []);

  const completeSession = useCallback((sessionId: string, exitCode: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, exitCode, isRunning: false, endedAt: new Date().toISOString() }
          : s,
      ),
    );
  }, []);

  const closeSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActiveSessionId((prev) => (prev === sessionId ? null : prev));
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    openFromBash,
    openFromTerminal,
    setActive,
    appendOutput,
    completeSession,
    closeSession,
  };
}
