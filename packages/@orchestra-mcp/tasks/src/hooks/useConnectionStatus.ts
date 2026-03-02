import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

const DEFAULT_WS_URL = 'ws://127.0.0.1:8765';
const RECONNECT_DELAY = 3000;
const MAX_RETRIES = 3;

export function useConnectionStatus(wsUrl?: string): {
  status: ConnectionState;
  lastConnected: Date | null;
} {
  const url = wsUrl ?? DEFAULT_WS_URL;
  const [status, setStatus] = useState<ConnectionState>('reconnecting');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const pausedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current || pausedRef.current) return;
    cleanup();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        retriesRef.current = 0;
        setStatus('connected');
        setLastConnected(new Date());
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        wsRef.current = null;

        if (retriesRef.current >= MAX_RETRIES) {
          setStatus('disconnected');
          return;
        }

        retriesRef.current += 1;
        setStatus('reconnecting');
        timerRef.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => {
        // onclose will fire after onerror, so reconnection is handled there
      };
    } catch {
      if (!mountedRef.current) return;
      if (retriesRef.current >= MAX_RETRIES) {
        setStatus('disconnected');
        return;
      }
      retriesRef.current += 1;
      setStatus('reconnecting');
      timerRef.current = setTimeout(connect, RECONNECT_DELAY);
    }
  }, [url, cleanup]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    const handleVisibility = () => {
      if (document.hidden) {
        pausedRef.current = true;
        cleanup();
      } else {
        pausedRef.current = false;
        retriesRef.current = 0;
        setStatus('reconnecting');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      cleanup();
    };
  }, [connect, cleanup]);

  return { status, lastConnected };
}
