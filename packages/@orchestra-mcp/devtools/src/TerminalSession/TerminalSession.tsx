import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Terminal as XTerminal } from '@xterm/xterm';
import type { FitAddon as XFitAddon } from '@xterm/addon-fit';
import type { SessionContentProps } from '../types';
import { BoxIcon } from '@orchestra-mcp/icons';
import { DevToolsWorkerService, buildWsUrl } from '../workers/DevToolsWorkerService';
import './TerminalSession.css';

const SETTINGS_PORT = 19191;

/**
 * TerminalSession — xterm.js terminal connected to a backend PTY via WebSocket.
 *
 * Design principles:
 * - xterm opens and fits BEFORE connecting, so dimensions are known.
 * - Resize messages use worker.send() (JSON path), never sendRaw (raw input path).
 * - Zero-dimension resize guard: never send cols=0 or rows=0 to backend.
 * - Auto-connects once xterm is ready; re-spawns the PTY on every mount.
 */
export const TerminalSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState, onConnect, onDisconnect } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitRef = useRef<XFitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const connectedRef = useRef(false);

  const [xtermLoaded, setXtermLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const shell = (session.connectionConfig?.shell as string) ?? 'zsh';
  const workdir = (session.connectionConfig?.work_dir as string) ?? '';
  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Worker singleton ────────────────────────────────────────────
  const worker = DevToolsWorkerService.getInstance();

  // ── Message handler ─────────────────────────────────────────────
  const handleMessage = useCallback((data: unknown) => {
    const term = termRef.current;
    if (!term) return;

    if (typeof data === 'string') {
      term.write(data);
      return;
    }

    if (data && typeof data === 'object') {
      const msg = data as Record<string, unknown>;

      if (msg.msgType === 'output' && typeof msg.data === 'string') {
        term.write(msg.data);
        return;
      }
      if (msg.msgType === 'connected') {
        // PTY is ready — send current terminal dimensions
        const { cols, rows } = term;
        if (cols > 0 && rows > 0) {
          worker.send(session.id, { msgType: 'resize', cols, rows });
        }
        return;
      }
      if (msg.msgType === 'exited') {
        term.write('\r\n\x1b[31m[Process exited]\x1b[0m\r\n');
        return;
      }
      if (msg.msgType === 'error' && typeof msg.data === 'string') {
        term.write(`\r\n\x1b[31mError: ${msg.data}\x1b[0m\r\n`);
        return;
      }
    }
  }, [worker, session.id]);

  // ── State change handler ─────────────────────────────────────────
  const handleStateChange = useCallback((state: string) => {
    if (state === 'connecting') {
      connectedRef.current = false;
      onConnect();
    } else if (state === 'connected') {
      connectedRef.current = true;
      onUpdateState({ state: 'connected' });
    } else if (state === 'disconnected') {
      connectedRef.current = false;
      onDisconnect();
    } else if (state === 'error') {
      connectedRef.current = false;
      onUpdateState({ state: 'error' });
    }
  }, [onConnect, onDisconnect, onUpdateState]);

  // ── Connect / disconnect helpers ────────────────────────────────
  const connect = useCallback(() => {
    const url = buildWsUrl('terminal', session.id, SETTINGS_PORT);
    worker.connect(session.id, url, handleMessage, handleStateChange);
  }, [worker, session.id, handleMessage, handleStateChange]);

  const disconnect = useCallback(() => {
    worker.disconnect(session.id);
    onDisconnect();
  }, [worker, session.id, onDisconnect]);

  // ── 1. Load xterm.js dynamically ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadXterm() {
      try {
        const [xtermMod, fitMod] = await Promise.all([
          import('@xterm/xterm'),
          import('@xterm/addon-fit'),
        ]);
        await import('@xterm/xterm/css/xterm.css');

        if (cancelled) return;

        const term = new xtermMod.Terminal({
          cursorBlink: true,
          fontSize: 13,
          fontFamily: "'Menlo', 'Consolas', 'Courier New', monospace",
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#d4d4d4',
            selectionBackground: '#264f78',
          },
          allowProposedApi: true,
        });

        const fit = new fitMod.FitAddon();
        term.loadAddon(fit);

        termRef.current = term;
        fitRef.current = fit;
        setXtermLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load terminal');
        }
      }
    }

    loadXterm();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Attach to DOM, fit, then connect ─────────────────────────
  // Runs once when xterm is loaded. Opens the terminal, fits it so dimensions
  // are real, then connects the WebSocket so the first resize carries valid dims.
  useEffect(() => {
    if (!xtermLoaded) return;

    const term = termRef.current;
    const fit = fitRef.current;
    const container = containerRef.current;
    if (!term || !fit || !container) return;

    // Open xterm into the container (only once)
    if (!term.element) {
      term.open(container);
    }

    // Fit now — container is always visible (visibility:hidden, not display:none)
    // Double rAF ensures the browser has painted the container layout.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try { fit.fit(); } catch { /* not visible yet */ }

        // Store current dimensions in connectionConfig so the Go backend
        // spawns the PTY at the correct size — shell renders prompt correctly
        // without needing a post-spawn resize.
        const t = termRef.current;
        if (t && t.cols > 0 && t.rows > 0) {
          onUpdateState({ connectionConfig: { cols: t.cols, rows: t.rows } });
        }

        // Connect AFTER fitting so we know the real terminal dimensions.
        connect();

        // Send resize shortly after connect to ensure the PTY uses the
        // correct dimensions even if the 'connected' handler fires late.
        setTimeout(() => {
          const t = termRef.current;
          const f = fitRef.current;
          if (t && f) {
            try { f.fit(); } catch { /* ignore */ }
            if (t.cols > 0 && t.rows > 0) {
              worker.send(session.id, { msgType: 'resize', cols: t.cols, rows: t.rows });
            }
          }
          termRef.current?.focus();
        }, 150);
      });
    });

    // ResizeObserver keeps the terminal fitted when the panel resizes.
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try { fit.fit(); } catch { /* panel hidden */ }
      });
    });
    observer.observe(container);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xtermLoaded]);

  // ── 3. Wire terminal events to WebSocket ─────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term || !xtermLoaded) return;

    // Keyboard input: raw text to backend (treated as PTY stdin)
    const dataDisposable = term.onData((data: string) => {
      worker.sendRaw(session.id, data);
    });

    // Resize: JSON message to backend (NOT sendRaw — that is PTY input)
    const resizeDisposable = term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
      if (cols > 0 && rows > 0 && connectedRef.current) {
        worker.send(session.id, { msgType: 'resize', cols, rows });
      }
    });

    return () => {
      dataDisposable.dispose();
      resizeDisposable.dispose();
    };
  }, [xtermLoaded, worker, session.id]);

  // ── 4. Cleanup on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
      worker.disconnect(session.id);
      termRef.current?.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ───────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    termRef.current?.clear();
  }, []);

  const handleReconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
      setTimeout(() => termRef.current?.focus(), 200);
    }, 300);
  }, [connect, disconnect]);

  // ── Status dot class ──────────────────────────────────────────────
  const statusDotCls = [
    'terminal-session__status-dot',
    isConnected
      ? 'terminal-session__status-dot--connected'
      : isConnecting
        ? 'terminal-session__status-dot--connecting'
        : session.state === 'error'
          ? 'terminal-session__status-dot--error'
          : '',
  ].filter(Boolean).join(' ');

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="terminal-session">
      {/* Header — hidden while loading */}
      {xtermLoaded && (
        <div className="terminal-session__header">
          <span className="terminal-session__header-title">
            <BoxIcon name="bx-terminal" size={14} />
            {shell}
          </span>
          <div className="terminal-session__header-actions">
            <button
              className="terminal-session__header-btn"
              title="Clear"
              onClick={handleClear}
              type="button"
            >
              <BoxIcon name="bx-eraser" size={15} />
            </button>
            <button
              className="terminal-session__header-btn"
              title="Reconnect"
              onClick={handleReconnect}
              type="button"
            >
              <BoxIcon name="bx-refresh" size={15} />
            </button>
            {isConnected ? (
              <button
                className="terminal-session__header-btn terminal-session__header-btn--danger"
                title="Disconnect"
                onClick={disconnect}
                type="button"
              >
                <BoxIcon name="bx-stop-circle" size={15} />
              </button>
            ) : (
              <button
                className="terminal-session__header-btn terminal-session__header-btn--accent"
                title="Connect"
                onClick={() => { connect(); setTimeout(() => termRef.current?.focus(), 200); }}
                type="button"
              >
                <BoxIcon name="bx-play-circle" size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Terminal container — always in DOM so containerRef is valid */}
      <div
        className="terminal-session__container"
        ref={containerRef}
        style={xtermLoaded ? undefined : { display: 'none' }}
      />

      {/* Loading / error overlay */}
      {!xtermLoaded && (
        <div className="terminal-session__loading-overlay">
          {loadError ? (
            <div className="terminal-session__loading terminal-session__loading--error">
              <span className="terminal-session__loading-icon">
                <BoxIcon name="bx-error-circle" size={32} />
              </span>
              Terminal failed to load: {loadError}
            </div>
          ) : (
            <div className="terminal-session__loading">
              <span className="terminal-session__loading-icon">
                <BoxIcon name="bx-loader-alt" size={28} />
              </span>
              Loading terminal...
            </div>
          )}
        </div>
      )}

      {/* Status bar */}
      {xtermLoaded && (
        <div className="terminal-session__status">
          <span className={statusDotCls} />
          <span className="terminal-session__status-label">
            {isConnected
              ? 'Connected'
              : isConnecting
                ? 'Connecting...'
                : session.state === 'error'
                  ? 'Connection error'
                  : 'Disconnected'}
          </span>
          <span className="terminal-session__status-path">{workdir || '~'}</span>
        </div>
      )}
    </div>
  );
};
