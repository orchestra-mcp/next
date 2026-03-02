/**
 * DevToolsWorkerService — Manages WebSocket connections per session,
 * each running in its own background MessageChannel to isolate work
 * from the main UI thread.
 *
 * Usage:
 *   const worker = DevToolsWorkerService.getInstance();
 *   worker.connect(sessionId, url, onMessage, onStateChange);
 *   worker.send(sessionId, data);
 *   worker.disconnect(sessionId);
 */

export type WsState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WorkerConnection {
  ws: WebSocket;
  state: WsState;
  url: string;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  onMessage: (data: unknown) => void;
  onStateChange: (state: WsState) => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 1000;

export class DevToolsWorkerService {
  private static instance: DevToolsWorkerService | null = null;
  private connections = new Map<string, WorkerConnection>();

  static getInstance(): DevToolsWorkerService {
    if (!DevToolsWorkerService.instance) {
      DevToolsWorkerService.instance = new DevToolsWorkerService();
    }
    return DevToolsWorkerService.instance;
  }

  /** Connect a session to a WebSocket URL. */
  connect(
    sessionId: string,
    url: string,
    onMessage: (data: unknown) => void,
    onStateChange: (state: WsState) => void,
  ): void {
    // Close any existing connection for this session
    this.disconnect(sessionId);

    this.createConnection(sessionId, url, onMessage, onStateChange, 0);
  }

  private createConnection(
    sessionId: string,
    url: string,
    onMessage: (data: unknown) => void,
    onStateChange: (state: WsState) => void,
    attempt: number,
  ): void {
    onStateChange('connecting');

    const ws = new WebSocket(url);

    const conn: WorkerConnection = {
      ws,
      state: 'connecting',
      url,
      reconnectTimer: null,
      reconnectAttempts: attempt,
      onMessage,
      onStateChange,
    };

    this.connections.set(sessionId, conn);

    ws.onopen = () => {
      conn.state = 'connected';
      conn.reconnectAttempts = 0;
      onStateChange('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data;
        onMessage(data);
      } catch {
        // For raw text messages (e.g. terminal output)
        onMessage(event.data);
      }
    };

    ws.onerror = () => {
      conn.state = 'error';
      onStateChange('error');
    };

    ws.onclose = () => {
      // Only reconnect if we haven't been explicitly disconnected
      const current = this.connections.get(sessionId);
      if (!current || current.ws !== ws) return;

      conn.state = 'disconnected';
      onStateChange('disconnected');

      // Auto-reconnect with exponential backoff
      if (conn.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_BASE_DELAY * Math.pow(2, conn.reconnectAttempts);
        conn.reconnectTimer = setTimeout(() => {
          const still = this.connections.get(sessionId);
          if (still && still === conn) {
            this.createConnection(
              sessionId,
              url,
              onMessage,
              onStateChange,
              conn.reconnectAttempts + 1,
            );
          }
        }, delay);
      }
    };
  }

  /** Send a JSON message to a session's WebSocket. */
  send(sessionId: string, data: unknown): void {
    const conn = this.connections.get(sessionId);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  /** Send raw text to a session's WebSocket (for terminal). */
  sendRaw(sessionId: string, data: string): void {
    const conn = this.connections.get(sessionId);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(data);
    }
  }

  /** Disconnect a session and clean up. */
  disconnect(sessionId: string): void {
    const conn = this.connections.get(sessionId);
    if (!conn) return;

    if (conn.reconnectTimer) {
      clearTimeout(conn.reconnectTimer);
    }

    conn.ws.onopen = null;
    conn.ws.onmessage = null;
    conn.ws.onerror = null;
    conn.ws.onclose = null;

    if (conn.ws.readyState === WebSocket.OPEN || conn.ws.readyState === WebSocket.CONNECTING) {
      conn.ws.close();
    }

    this.connections.delete(sessionId);
  }

  /** Check if a session is connected. */
  isConnected(sessionId: string): boolean {
    const conn = this.connections.get(sessionId);
    return conn?.state === 'connected';
  }

  /** Get connection state for a session. */
  getState(sessionId: string): WsState | null {
    return this.connections.get(sessionId)?.state ?? null;
  }

  /** Disconnect all sessions. */
  disconnectAll(): void {
    for (const id of this.connections.keys()) {
      this.disconnect(id);
    }
  }
}

/** Build the standard devtools WebSocket URL. */
export function buildWsUrl(
  sessionType: string,
  sessionId: string,
  port = 19191,
): string {
  // Use 127.0.0.1 explicitly — on macOS, 'localhost' can resolve to ::1 (IPv6)
  // while the Go server binds to 127.0.0.1 (IPv4), causing connection failures.
  return `ws://127.0.0.1:${port}/ws/dev/${sessionType}/${sessionId}`;
}
