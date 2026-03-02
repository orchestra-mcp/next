/**
 * PlaywrightBridge — WebSocket bridge that receives browser automation
 * commands from the Go backend and dispatches them to action handlers.
 * Runs inside the Chrome Extension context (content script or service worker).
 */

import {
  navigateAction,
  queryAction,
  clickAction,
  typeAction,
  screenshotAction,
  evaluateAction,
  waitAction,
  interceptAction,
} from './BrowserActions';

export type BrowserAction =
  | 'navigate'
  | 'query'
  | 'click'
  | 'type'
  | 'screenshot'
  | 'evaluate'
  | 'wait'
  | 'intercept';

export interface BrowserCommand {
  id: string;
  action: BrowserAction;
  params: Record<string, unknown>;
}

export interface BrowserResult {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

type ActionHandler = (params: Record<string, unknown>) => Promise<BrowserResult>;

const DEFAULT_PORT = 19191;

export class PlaywrightBridge {
  private ws: WebSocket | null = null;
  private handlers: Map<BrowserAction, ActionHandler>;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private extensionId: string;

  constructor(extensionId?: string) {
    this.extensionId = extensionId ?? chrome?.runtime?.id ?? 'unknown';
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  /** Connect to the Go backend WebSocket endpoint. */
  connect(url?: string): void {
    this.disconnect();

    const endpoint =
      url ?? `ws://localhost:${DEFAULT_PORT}/ws/dev/playwright/${this.extensionId}`;

    const ws = new WebSocket(endpoint);
    this.ws = ws;

    ws.onopen = () => {
      console.log('[PlaywrightBridge] Connected to', endpoint);
      this.clearReconnectTimer();
    };

    ws.onmessage = (event: MessageEvent) => {
      this.onMessage(event);
    };

    ws.onerror = (event: Event) => {
      console.error('[PlaywrightBridge] WebSocket error', event);
    };

    ws.onclose = () => {
      console.log('[PlaywrightBridge] Disconnected');
      this.ws = null;
    };
  }

  /** Close the WebSocket connection. */
  disconnect(): void {
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  /** Register a custom action handler (extends or overrides defaults). */
  registerHandler(action: BrowserAction, handler: ActionHandler): void {
    this.handlers.set(action, handler);
  }

  /** Whether the WebSocket is currently open. */
  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // -- Private ----------------------------------------------------------------

  private registerDefaultHandlers(): void {
    this.handlers.set('navigate', (p) => navigateAction(p));
    this.handlers.set('query', (p) => queryAction(p));
    this.handlers.set('click', (p) => clickAction(p));
    this.handlers.set('type', (p) => typeAction(p));
    this.handlers.set('screenshot', (p) => screenshotAction(p));
    this.handlers.set('evaluate', (p) => evaluateAction(p));
    this.handlers.set('wait', (p) => waitAction(p));
    this.handlers.set('intercept', (p) => interceptAction(p));
  }

  private async onMessage(event: MessageEvent): Promise<void> {
    let cmd: BrowserCommand;
    try {
      cmd = JSON.parse(typeof event.data === 'string' ? event.data : '');
    } catch {
      console.warn('[PlaywrightBridge] Invalid message payload');
      return;
    }

    if (!cmd.id || !cmd.action) {
      console.warn('[PlaywrightBridge] Missing id or action in command');
      return;
    }

    const handler = this.handlers.get(cmd.action);
    if (!handler) {
      this.sendResult({
        id: cmd.id,
        success: false,
        error: `Unknown action: ${cmd.action}`,
      });
      return;
    }

    try {
      const result = await handler(cmd.params ?? {});
      this.sendResult({ ...result, id: cmd.id });
    } catch (err) {
      this.sendResult({
        id: cmd.id,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private sendResult(result: BrowserResult): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(result));
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
