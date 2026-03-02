'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

export interface WebSocketState {
  connected: boolean;
  send: (type: string, payload: unknown) => void;
  lastMessage: WebSocketMessage | null;
  subscribe: (type: string, handler: (payload: unknown) => void) => () => void;
}

const DEFAULT_URL = 'ws://localhost:8765';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
// Delay before first connection attempt — must be long enough for React
// StrictMode's double-invoke (mount → unmount → mount) to cancel the first
// timer before any WebSocket object is created.
const INITIAL_CONNECT_DELAY = 200;

/**
 * WebSocket connection hook with auto-reconnect.
 * Connects to the Go backend WebSocket server for real-time sync.
 */
export function useWebSocket(url?: string): WebSocketState {
  const wsUrl = url ?? DEFAULT_URL;
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<(payload: unknown) => void>>>(new Map());
  const reconnectDelayRef = useRef(RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    const delay = reconnectDelayRef.current;
    reconnectTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      reconnectDelayRef.current = Math.min(delay * 1.5, MAX_RECONNECT_DELAY);
      connectNow();
    }, delay);
  }, [wsUrl]);

  const connectNow = useCallback(() => {
    if (!mountedRef.current) {
      console.log('[WebSocket] Skipping connect - not mounted');
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Skipping connect - already connected/connecting');
      return;
    }

    console.log('[WebSocket] Creating new WebSocket connection to', wsUrl);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) {
          console.log('[WebSocket] Open but unmounted - closing');
          ws.close();
          return;
        }
        console.log('[WebSocket] Connected to', wsUrl);
        setConnected(true);
        reconnectDelayRef.current = RECONNECT_DELAY;
      };

      ws.onclose = () => {
        if (!mountedRef.current) {
          console.log('[WebSocket] Close but unmounted - ignoring');
          return;
        }
        console.log('[WebSocket] Disconnected');
        setConnected(false);
        wsRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('[WebSocket] Raw message:', msg);

          // Backend format: { type: "event", event: "ai:chunk", data: {...} }
          // Convert to frontend format: { type: "ai:chunk", payload: {...} }
          const eventType = msg.event || msg.type;
          const payload = msg.data || msg.payload;

          console.log('[WebSocket] Normalized:', { eventType, payload });

          const normalizedMsg: WebSocketMessage = {
            type: eventType,
            payload,
            timestamp: msg.timestamp || Date.now(),
          };

          setLastMessage(normalizedMsg);
          const typeHandlers = handlersRef.current.get(eventType);
          if (typeHandlers && typeHandlers.size > 0) {
            console.log('[WebSocket] Found', typeHandlers.size, 'handlers for', eventType);
            typeHandlers.forEach((handler) => handler(payload));
          } else {
            console.warn('[WebSocket] No handlers registered for event:', eventType);
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };
    } catch {
      scheduleReconnect();
    }
  }, [wsUrl, scheduleReconnect]);

  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const msg: WebSocketMessage = { type, payload, timestamp: Date.now() };
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  const subscribe = useCallback(
    (type: string, handler: (payload: unknown) => void): (() => void) => {
      if (!handlersRef.current.has(type)) {
        handlersRef.current.set(type, new Set());
      }
      const handlers = handlersRef.current.get(type)!;

      // Prevent duplicate handler registration (can happen with React StrictMode or HMR)
      if (handlers.has(handler)) {
        console.warn('[WebSocket] Duplicate handler registration prevented for:', type);
        return () => {}; // Return no-op unsubscribe
      }

      console.log('[WebSocket] Subscribing handler for:', type, 'Total handlers:', handlers.size + 1);
      handlers.add(handler);

      return () => {
        console.log('[WebSocket] Unsubscribing handler for:', type);
        handlersRef.current.get(type)?.delete(handler);
      };
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;

    // Defer connection so React StrictMode's double-invoke cycle
    // (mount → cleanup → mount) cancels the first timer before any
    // WebSocket object is created, avoiding browser "closed before
    // established" console errors.
    connectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) connectNow();
    }, INITIAL_CONNECT_DELAY);

    return () => {
      mountedRef.current = false;
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, ignore connectNow changes

  return { connected, send, lastMessage, subscribe };
}
