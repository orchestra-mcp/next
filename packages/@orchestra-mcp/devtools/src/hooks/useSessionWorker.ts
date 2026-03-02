import { useCallback, useEffect, useRef } from 'react';
import {
  DevToolsWorkerService,
  buildWsUrl,
  type WsState,
} from '../workers/DevToolsWorkerService';
import type { SessionContentProps } from '../types';

interface UseSessionWorkerOptions {
  /** Session type used to build the WebSocket URL path. */
  sessionType: string;
  /** WebSocket port (default 19191 — settings server). */
  port?: number;
  /** Called when a JSON message arrives from the backend. */
  onMessage: (data: unknown) => void;
}

interface UseSessionWorkerReturn {
  /** Connect this session to the backend. */
  connect: () => void;
  /** Disconnect from the backend. */
  disconnect: () => void;
  /** Send a JSON message to the backend. */
  send: (data: unknown) => void;
  /** Send raw text (for terminal sessions). */
  sendRaw: (data: string) => void;
  /** Whether the session is currently connected. */
  isConnected: boolean;
}

/**
 * React hook that connects a session component to the WorkerService.
 * Automatically cleans up on unmount.
 */
export function useSessionWorker(
  props: SessionContentProps,
  options: UseSessionWorkerOptions,
): UseSessionWorkerReturn {
  const { session, onUpdateState, onConnect, onDisconnect } = props;
  const { sessionType, port = 19191, onMessage } = options;

  const worker = DevToolsWorkerService.getInstance();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const handleStateChange = useCallback(
    (state: WsState) => {
      if (state === 'connecting') {
        onConnect();
      } else if (state === 'connected') {
        onUpdateState({ state: 'connected' });
      } else if (state === 'disconnected') {
        onDisconnect();
      } else if (state === 'error') {
        onUpdateState({ state: 'error' });
      }
    },
    [onConnect, onDisconnect, onUpdateState],
  );

  const connect = useCallback(() => {
    const url = buildWsUrl(sessionType, session.id, port);
    worker.connect(session.id, url, (data) => onMessageRef.current(data), handleStateChange);
  }, [worker, session.id, sessionType, port, handleStateChange]);

  const disconnect = useCallback(() => {
    worker.disconnect(session.id);
    onDisconnect();
  }, [worker, session.id, onDisconnect]);

  const send = useCallback(
    (data: unknown) => worker.send(session.id, data),
    [worker, session.id],
  );

  const sendRaw = useCallback(
    (data: string) => worker.sendRaw(session.id, data),
    [worker, session.id],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      worker.disconnect(session.id);
    };
  }, [worker, session.id]);

  return {
    connect,
    disconnect,
    send,
    sendRaw,
    isConnected: session.state === 'connected',
  };
}
