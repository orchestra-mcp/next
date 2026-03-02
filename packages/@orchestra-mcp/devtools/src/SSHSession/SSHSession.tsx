import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Terminal as XTerminal } from '@xterm/xterm';
import type { FitAddon as XFitAddon } from '@xterm/addon-fit';
import { BoxIcon } from '@orchestra-mcp/icons';
import { DevToolsWorkerService, buildWsUrl } from '../workers/DevToolsWorkerService';
import type { SessionContentProps } from '../types';
import './SSHSession.css';

/** Authentication method for SSH connections. */
type AuthMethod = 'password' | 'key';

/** Default SSH port. */
const DEFAULT_PORT = 22;
const SETTINGS_PORT = 19191;

/** SFTP file entry returned by the backend. */
interface SftpFile {
  name: string;
  size: number;
  permissions: string;
  isDir: boolean;
}

/**
 * SSHSession — SSH terminal with connection form and optional SFTP browser.
 *
 * Design principles (mirrors TerminalSession):
 * - xterm opens and fits in its own rAF cycle BEFORE the WS connect is called.
 * - Output messages use {msgType:'output', data:'...'} envelope from Go backend.
 * - Resize uses worker.send() (JSON path), never sendRaw (raw PTY stdin path).
 * - Zero-dimension resize guard: skip if cols=0 or rows=0.
 */
export const SSHSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState, onConnect, onDisconnect } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerminal | null>(null);
  const fitRef = useRef<XFitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const connectedRef = useRef(false);
  const termOpenedRef = useRef(false);

  const [xtermLoaded, setXtermLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Connection form state
  const [host, setHost] = useState<string>(
    (session.connectionConfig?.host as string) ?? '',
  );
  const [port, setPort] = useState<number>(
    (session.connectionConfig?.port as number) ?? DEFAULT_PORT,
  );
  const [username, setUsername] = useState<string>(
    (session.connectionConfig?.username as string) ?? '',
  );
  const [authMethod, setAuthMethod] = useState<AuthMethod>(
    (session.connectionConfig?.authMethod as AuthMethod) ?? 'password',
  );
  const [password, setPassword] = useState<string>(
    (session.connectionConfig?.password as string) ?? '',
  );
  const [privateKey, setPrivateKey] = useState<string>(
    (session.connectionConfig?.privateKey as string) ?? '',
  );

  // SFTP state
  const [sftpOpen, setSftpOpen] = useState(false);
  const [sftpPath, setSftpPath] = useState('/');
  const [sftpFiles, setSftpFiles] = useState<SftpFile[]>([]);

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Worker singleton ────────────────────────────────────────────
  const worker = DevToolsWorkerService.getInstance();

  // ── Message handler ─────────────────────────────────────────────
  const handleMessage = useCallback((data: unknown) => {
    const term = termRef.current;

    if (typeof data === 'string') {
      term?.write(data);
      return;
    }

    if (data && typeof data === 'object') {
      const msg = data as Record<string, unknown>;

      if (msg.msgType === 'output' && typeof msg.data === 'string') {
        term?.write(msg.data);
        return;
      }
      if (msg.msgType === 'connected') {
        // SSH shell is ready — send terminal dimensions
        if (term) {
          const { cols, rows } = term;
          if (cols > 0 && rows > 0) {
            worker.send(session.id, { msgType: 'resize', cols, rows });
          }
        }
        return;
      }
      if (msg.msgType === 'exited') {
        term?.write('\r\n\x1b[31m[SSH session ended]\x1b[0m\r\n');
        return;
      }
      if (msg.msgType === 'error' && typeof msg.data === 'string') {
        term?.write(`\r\n\x1b[31mSSH Error: ${msg.data}\x1b[0m\r\n`);
        return;
      }
      if (msg.type === 'sftp' && Array.isArray(msg.files)) {
        setSftpFiles(msg.files as SftpFile[]);
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

  // ── Load xterm.js dynamically ────────────────────────────────────
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
            background: '#1a1a1a',
            foreground: '#e0e0e0',
            cursor: '#e0e0e0',
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

  // ── Attach terminal to DOM once loaded ───────────────────────────
  // We open xterm as soon as it loads (not gated on isConnected) so the
  // container has real dimensions when we later call fit.fit().
  useEffect(() => {
    if (!xtermLoaded) return;

    const term = termRef.current;
    const fit = fitRef.current;
    const container = containerRef.current;
    if (!term || !fit || !container) return;

    if (!term.element) {
      term.open(container);
      termOpenedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try { fit.fit(); } catch { /* not visible yet */ }
        });
      });
    }

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
  }, [xtermLoaded]);

  // ── Wire terminal events to WebSocket ─────────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term || !xtermLoaded) return;

    const dataDisposable = term.onData((data: string) => {
      worker.sendRaw(session.id, data);
    });

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

  // ── Cleanup on unmount ────────────────────────────────────────────
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

  // ── Connect to SSH backend ─────────────────────────────────────────
  const connectSsh = useCallback(() => {
    const config: Record<string, unknown> = {
      host,
      port: String(port),
      username,
      authMethod,
      password: authMethod === 'password' ? password : undefined,
      private_key: authMethod === 'key' ? privateKey : undefined,
    };

    onUpdateState({ connectionConfig: config });

    // Fit terminal before connecting so first resize carries real dimensions.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try { fitRef.current?.fit(); } catch { /* ignore */ }

        const url = buildWsUrl('ssh', session.id, SETTINGS_PORT);
        worker.connect(session.id, url, handleMessage, handleStateChange);

        // After WS opens, send the connect message with SSH credentials.
        setTimeout(() => {
          worker.send(session.id, { msgType: 'connect', data: config });
        }, 150);

        setTimeout(() => termRef.current?.focus(), 400);
      });
    });
  }, [host, port, username, authMethod, password, privateKey, onUpdateState,
      worker, session.id, handleMessage, handleStateChange]);

  // ── Disconnect ─────────────────────────────────────────────────────
  const disconnectSsh = useCallback(() => {
    worker.disconnect(session.id);
    onDisconnect();
    setSftpOpen(false);
    setSftpFiles([]);
  }, [worker, session.id, onDisconnect]);

  // ── Request SFTP directory listing ──────────────────────────────────
  const requestSftpList = useCallback(
    (path: string) => {
      worker.send(session.id, { msgType: 'exec', data: { command: `sftp:ls:${path}` } });
      setSftpPath(path);
    },
    [worker, session.id],
  );

  // ── Form handlers ──────────────────────────────────────────────────
  const handleHostChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value), []);
  const handlePortChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPort(Number(e.target.value) || DEFAULT_PORT), []);
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value), []);
  const handleAuthMethodChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setAuthMethod(e.target.value as AuthMethod), []);
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handlePrivateKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => setPrivateKey(e.target.value), []);

  const handleConnectSubmit = useCallback(
    (e: React.FormEvent) => { e.preventDefault(); connectSsh(); }, [connectSsh]);

  const handleToggleSftp = useCallback(() => {
    const next = !sftpOpen;
    setSftpOpen(next);
    if (next) requestSftpList(sftpPath);
  }, [sftpOpen, sftpPath, requestSftpList]);

  const handleSftpNavigateUp = useCallback(() => {
    const parent = sftpPath === '/' ? '/' : sftpPath.replace(/\/[^/]+\/?$/, '') || '/';
    requestSftpList(parent);
  }, [sftpPath, requestSftpList]);

  const handleSftpEntryClick = useCallback(
    (file: SftpFile) => {
      if (file.isDir) {
        const next = sftpPath === '/' ? `/${file.name}` : `${sftpPath}/${file.name}`;
        requestSftpList(next);
      }
    },
    [sftpPath, requestSftpList],
  );

  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // ── Status dot class ────────────────────────────────────────────────
  const statusDotClass = [
    'ssh-session__status-dot',
    isConnected
      ? 'ssh-session__status-dot--connected'
      : isConnecting
        ? 'ssh-session__status-dot--connecting'
        : session.state === 'error'
          ? 'ssh-session__status-dot--error'
          : '',
  ].filter(Boolean).join(' ');

  // ── Loading error ───────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="ssh-session">
        <div className="ssh-session__loading">
          Terminal failed to load: {loadError}
        </div>
      </div>
    );
  }

  if (!xtermLoaded) {
    return (
      <div className="ssh-session">
        <div className="ssh-session__loading">Loading terminal...</div>
      </div>
    );
  }

  // ── Connection form (shown when not yet connected) ──────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="ssh-session">
        {/* Terminal container kept in DOM so it retains its open state */}
        <div className="ssh-session__terminal ssh-session__terminal--hidden" ref={containerRef} />

        <form className="ssh-session__connection-form" onSubmit={handleConnectSubmit}>
          <h3 className="ssh-session__form-title">SSH Connection</h3>

          <label className="ssh-session__label">
            Host
            <input
              className="ssh-session__input"
              type="text"
              value={host}
              onChange={handleHostChange}
              placeholder="e.g. 192.168.1.100"
              required
              aria-label="Host"
            />
          </label>

          <label className="ssh-session__label">
            Port
            <input
              className="ssh-session__input ssh-session__input--port"
              type="number"
              value={port}
              onChange={handlePortChange}
              min={1}
              max={65535}
              aria-label="Port"
            />
          </label>

          <label className="ssh-session__label">
            Username
            <input
              className="ssh-session__input"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="root"
              required
              aria-label="Username"
            />
          </label>

          <label className="ssh-session__label">
            Auth Method
            <select
              className="ssh-session__select"
              value={authMethod}
              onChange={handleAuthMethodChange}
              aria-label="Authentication method"
            >
              <option value="password">Password</option>
              <option value="key">Private Key</option>
            </select>
          </label>

          {authMethod === 'password' ? (
            <label className="ssh-session__label">
              Password
              <input
                className="ssh-session__input"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                aria-label="Password"
              />
            </label>
          ) : (
            <label className="ssh-session__label">
              Private Key
              <textarea
                className="ssh-session__textarea"
                value={privateKey}
                onChange={handlePrivateKeyChange}
                placeholder="Paste your private key here..."
                rows={6}
                aria-label="Private key"
              />
            </label>
          )}

          <button className="ssh-session__connect-btn" type="submit">
            <BoxIcon name="bx-link" size={14} />
            Connect
          </button>
        </form>

        {session.state === 'error' && (
          <div className="ssh-session__error">
            Connection failed. Check your credentials and try again.
          </div>
        )}
      </div>
    );
  }

  // ── Connected / connecting state ─────────────────────────────────────
  return (
    <div className="ssh-session">
      {/* Toolbar */}
      <div className="ssh-session__toolbar">
        <span className="ssh-session__toolbar-label">
          <BoxIcon name="bx-terminal" size={14} />
          {username}@{host}:{port}
        </span>

        <button
          className={
            'ssh-session__sftp-btn' +
            (sftpOpen ? ' ssh-session__sftp-btn--active' : '')
          }
          onClick={handleToggleSftp}
          type="button"
          aria-label="Toggle SFTP browser"
        >
          <BoxIcon name="bx-folder" size={14} />
          SFTP
        </button>

        <button
          className="ssh-session__connect-btn ssh-session__connect-btn--disconnect"
          onClick={disconnectSsh}
          type="button"
        >
          <BoxIcon name="bx-power-off" size={14} />
          Disconnect
        </button>
      </div>

      {/* Terminal + SFTP wrapper */}
      <div className="ssh-session__body">
        <div className="ssh-session__terminal" ref={containerRef} />

        {sftpOpen && (
          <div className="ssh-session__sftp">
            <div className="ssh-session__sftp-header">
              <button
                className="ssh-session__sftp-up"
                onClick={handleSftpNavigateUp}
                type="button"
                aria-label="Navigate up"
                disabled={sftpPath === '/'}
              >
                <BoxIcon name="bx-arrow-back" size={12} />
                ..
              </button>
              <span className="ssh-session__sftp-path" title={sftpPath}>
                {sftpPath}
              </span>
            </div>

            <ul className="ssh-session__sftp-list">
              {sftpFiles.map((file) => (
                <li
                  key={file.name}
                  className={
                    'ssh-session__sftp-item' +
                    (file.isDir ? ' ssh-session__sftp-item--dir' : '')
                  }
                  onClick={() => handleSftpEntryClick(file)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSftpEntryClick(file);
                  }}
                >
                  <span className="ssh-session__sftp-name">
                    {file.isDir ? (
                      <BoxIcon name="bx-folder" size={12} />
                    ) : (
                      <BoxIcon name="bx-file" size={12} />
                    )}
                    {' '}{file.name}
                  </span>
                  <span className="ssh-session__sftp-meta">
                    <span className="ssh-session__sftp-perms">{file.permissions}</span>
                    <span className="ssh-session__sftp-size">{formatSize(file.size)}</span>
                  </span>
                </li>
              ))}
              {sftpFiles.length === 0 && (
                <li className="ssh-session__sftp-empty">No files</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="ssh-session__status">
        <span className={statusDotClass} />
        <span>
          {isConnected
            ? `Connected to ${username}@${host}:${port}`
            : isConnecting
              ? 'Connecting...'
              : session.state === 'error'
                ? 'Connection error'
                : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
