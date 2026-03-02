import { useEffect, useRef, useState, useCallback } from 'react';
import type * as monacoNs from 'monaco-editor';
import type { LspConnection } from './lsp-bridge';

export type LspStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseLspOptions {
  /** Monaco namespace */
  monaco: typeof monacoNs | null;
  /** Monaco editor instance */
  editor: monacoNs.editor.IStandaloneCodeEditor | null;
  /** Language ID for the LSP server */
  languageId?: string;
  /** WebSocket URL of the language server */
  lspUrl?: string;
  /** Called when LSP status changes */
  onStatusChange?: (status: LspStatus) => void;
}

export interface UseLspResult {
  status: LspStatus;
  reconnect: () => void;
}

const RECONNECT_DELAY = 3000;
const MAX_RETRIES = 3;

export function useLsp({
  monaco,
  editor,
  languageId,
  lspUrl,
  onStatusChange,
}: UseLspOptions): UseLspResult {
  const [status, setStatus] = useState<LspStatus>('disconnected');
  const connectionRef = useRef<LspConnection | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateStatus = useCallback(
    (next: LspStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange],
  );

  const disconnect = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (connectionRef.current) {
      connectionRef.current.dispose();
      connectionRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!monaco || !editor || !languageId || !lspUrl) return;

    disconnect();
    updateStatus('connecting');

    try {
      const { connectLanguageServer } = await import('./lsp-bridge');
      const conn = await connectLanguageServer(monaco, editor, languageId, lspUrl);
      connectionRef.current = conn;
      retriesRef.current = 0;
      updateStatus('connected');
    } catch {
      updateStatus('error');
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        timerRef.current = setTimeout(() => connect(), RECONNECT_DELAY);
      }
    }
  }, [monaco, editor, languageId, lspUrl, disconnect, updateStatus]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  // Auto-connect when all params are available
  useEffect(() => {
    if (monaco && editor && languageId && lspUrl) {
      connect();
    }
    return () => disconnect();
  }, [monaco, editor, languageId, lspUrl, connect, disconnect]);

  return { status, reconnect };
}
