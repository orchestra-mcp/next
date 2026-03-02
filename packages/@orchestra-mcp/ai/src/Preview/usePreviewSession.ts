import { useState, useEffect, useRef, useCallback } from 'react';
import type { PreviewCode, PreviewViewport } from './PreviewFrame';

export interface UsePreviewSessionOptions {
  sessionId: string;
  wsBaseUrl?: string;
  onCodeUpdate?: (code: PreviewCode) => void;
  onViewportUpdate?: (viewport: PreviewViewport) => void;
}

export interface UsePreviewSessionReturn {
  code: PreviewCode | null;
  viewport: PreviewViewport;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  updateCode: (code: Partial<PreviewCode>) => void;
  setViewport: (viewport: PreviewViewport) => void;
}

interface WsMessage {
  id?: string;
  type: string;
  event?: string;
  command?: string;
  data?: unknown;
  timestamp?: string;
}

const DEFAULT_VIEWPORT: PreviewViewport = {
  preset: 'desktop',
  width: 1280,
  height: 800,
};

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function usePreviewSession({
  sessionId,
  wsBaseUrl = 'ws://localhost:8765',
  onCodeUpdate,
  onViewportUpdate,
}: UsePreviewSessionOptions): UsePreviewSessionReturn {
  const [code, setCode] = useState<PreviewCode | null>(null);
  const [viewport, setViewportState] = useState<PreviewViewport>(DEFAULT_VIEWPORT);
  const [status, setStatus] = useState<UsePreviewSessionReturn['status']>('connecting');

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const send = useCallback((msg: WsMessage): void => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const url = `${wsBaseUrl}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(url);
    } catch {
      setStatus('error');
      return;
    }

    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      retryCountRef.current = 0;
      setStatus('connected');

      // Join the preview session
      send({
        id: generateId(),
        type: 'command',
        command: 'preview:join',
        data: { session_id: sessionId },
        timestamp: new Date().toISOString(),
      });
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;

      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string) as WsMessage;
      } catch {
        return;
      }

      const eventType = msg.event ?? msg.type;

      if (eventType === 'preview:update') {
        const newCode = msg.data as PreviewCode;
        if (newCode) {
          setCode(newCode);
          onCodeUpdate?.(newCode);
        }
      } else if (eventType === 'preview:viewport') {
        const newViewport = msg.data as PreviewViewport;
        if (newViewport) {
          setViewportState(newViewport);
          onViewportUpdate?.(newViewport);
        }
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus('disconnected');
      wsRef.current = null;

      // Auto-reconnect with exponential backoff
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = BASE_BACKOFF_MS * Math.pow(2, retryCountRef.current);
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connect();
          }
        }, delay);
      } else {
        setStatus('error');
      }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus('error');
      // onclose will fire after onerror and handle reconnection
    };
  }, [sessionId, wsBaseUrl, send, onCodeUpdate, onViewportUpdate]);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, wsBaseUrl]);

  const updateCode = useCallback(
    (partial: Partial<PreviewCode>): void => {
      setCode((prev) => {
        const merged: PreviewCode = {
          framework: 'html',
          ...prev,
          ...partial,
        };
        send({
          id: generateId(),
          type: 'command',
          command: 'preview:update',
          data: merged,
          timestamp: new Date().toISOString(),
        });
        return merged;
      });
    },
    [send],
  );

  const setViewport = useCallback(
    (newViewport: PreviewViewport): void => {
      setViewportState(newViewport);
      send({
        id: generateId(),
        type: 'command',
        command: 'preview:viewport',
        data: newViewport,
        timestamp: new Date().toISOString(),
      });
    },
    [send],
  );

  return { code, viewport, status, updateCode, setViewport };
}
