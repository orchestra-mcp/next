import React, { useRef, useCallback, useState, useEffect } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './LogViewerSession.css';

/** Auto-detect + picker state. */
interface DetectedLogsState {
  files: string[];
  show: boolean;
}

/** Log source types. */
const SOURCE_TYPES = ['file', 'docker', 'cloud'] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

/** Cloud providers available for log streaming. */
const CLOUD_PROVIDERS = ['aws-cloudwatch', 'gcp-logging'] as const;
type CloudProvider = (typeof CLOUD_PROVIDERS)[number];

/** Display labels for source types. */
const SOURCE_LABELS: Record<SourceType, string> = {
  file: 'File',
  docker: 'Docker',
  cloud: 'Cloud',
};

/** Display labels for cloud providers. */
const CLOUD_LABELS: Record<CloudProvider, string> = {
  'aws-cloudwatch': 'AWS CloudWatch',
  'gcp-logging': 'GCP Logging',
};

/** Log levels for filtering. */
const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

/** Maximum log entries kept in memory. */
const MAX_ENTRIES = 5000;

/** A single parsed log entry. */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  meta?: Record<string, unknown>;
}

/** Messages sent to the backend. */
type WsOutMessage =
  | { msgType: 'search'; data: { query: string }; level?: string }
  | { msgType: 'update_filter'; data: { level: string; pattern: string } }
  | { msgType: 'connect'; data: Record<string, unknown> }
  | { msgType: 'detect_logs'; data: { workspace: string } };

/**
 * LogViewerSession streams and displays application logs with
 * level filtering, full-text search, and JSON expansion.
 */
export const LogViewerSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState } = props;

  const entriesRef = useRef<HTMLDivElement>(null);

  // Connection form state
  const [sourceType, setSourceType] = useState<SourceType>(
    (session.connectionConfig?.sourceType as SourceType) ?? 'file',
  );
  const [filePath, setFilePath] = useState<string>(
    (session.connectionConfig?.filePath as string) ?? '',
  );
  const [containerName, setContainerName] = useState<string>(
    (session.connectionConfig?.containerName as string) ?? '',
  );
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>(
    (session.connectionConfig?.cloudProvider as CloudProvider) ?? 'aws-cloudwatch',
  );

  // Auto-detect log files state
  const [detectedLogs, setDetectedLogs] = useState<DetectedLogsState>({
    files: [],
    show: false,
  });

  // Log viewer state
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(
    new Set(LOG_LEVELS),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isTailing, setIsTailing] = useState(true);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(
    new Set(),
  );

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Auto-scroll when tailing ─────────────────────────────────
  useEffect(() => {
    if (isTailing && entriesRef.current) {
      entriesRef.current.scrollTop = entriesRef.current.scrollHeight;
    }
  }, [entries, isTailing]);

  // ── Handle incoming WebSocket messages ─────────────────────────
  const handleMessage = useCallback((data: unknown) => {
    const msg = data as { msgType?: string; files?: string[] } & LogEntry;

    // Handle detect_logs response from backend
    if (msg.msgType === 'detect_logs') {
      const files = Array.isArray(msg.files) ? msg.files : [];
      setDetectedLogs({ files, show: files.length > 0 });
      return;
    }

    // Otherwise treat as a log entry
    const entry = data as LogEntry;
    setEntries((prev) => {
      const next = [...prev, entry];
      if (next.length > MAX_ENTRIES) {
        return next.slice(next.length - MAX_ENTRIES);
      }
      return next;
    });
  }, []);

  const { connect, disconnect, send } = useSessionWorker(props, {
    sessionType: 'logs',
    onMessage: handleMessage,
  });

  // ── Auto-detect log files on connection ───────────────────────
  useEffect(() => {
    if (session.state === 'connected') {
      const workspace = (session.connectionConfig?.workspace as string) ?? '';
      send({ msgType: 'detect_logs', data: { workspace } });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state]);

  // ── Connect to log stream ─────────────────────────────────────
  const handleConnect = useCallback(() => {
    const config: Record<string, unknown> = {
      source_type: sourceType,
    };
    if (sourceType === 'file') config.file_path = filePath;
    if (sourceType === 'docker') config.container_name = containerName;
    if (sourceType === 'cloud') config.cloud_provider = cloudProvider;

    onUpdateState({ connectionConfig: config });
    connect();

    // Send a "connect" message so the backend starts streaming.
    setTimeout(() => {
      send({ msgType: 'connect', data: config });
    }, 100);
  }, [sourceType, filePath, containerName, cloudProvider, onUpdateState, connect, send]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // ── Toggle a log level filter ─────────────────────────────────
  const toggleLevel = useCallback((level: LogLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) {
          next.delete(level);
        }
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  // ── Select all levels ─────────────────────────────────────────
  const selectAllLevels = useCallback(() => {
    setActiveLevels(new Set(LOG_LEVELS));
  }, []);

  // ── Search input handler ──────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      send({ msgType: 'search', data: { query } });
    },
    [send],
  );

  // ── Toggle tail mode ──────────────────────────────────────────
  const toggleTailing = useCallback(() => {
    setIsTailing((prev) => !prev);
  }, []);

  // ── Toggle expanded entry (JSON) ──────────────────────────────
  const toggleExpand = useCallback((index: number) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // ── Filter entries by active levels and search ────────────────
  const filteredEntries = entries.filter((entry) => {
    if (!activeLevels.has(entry.level)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.message.toLowerCase().includes(q) ||
      entry.source?.toLowerCase().includes(q) ||
      entry.timestamp.toLowerCase().includes(q)
    );
  });

  // ── Derived values ────────────────────────────────────────────
  const sourceLabel =
    sourceType === 'file' ? `File: ${filePath || 'unknown'}`
    : sourceType === 'docker' ? `Docker: ${containerName || 'unknown'}`
    : `Cloud: ${CLOUD_LABELS[cloudProvider]}`;

  // ── Status dot class ──────────────────────────────────────────
  const statusDotClass = [
    'log-viewer-session__status-dot',
    isConnected
      ? 'log-viewer-session__status-dot--connected'
      : isConnecting
        ? 'log-viewer-session__status-dot--connecting'
        : session.state === 'error'
          ? 'log-viewer-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Form submit ──────────────────────────────────────────────
  const handleConnectSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleConnect();
    },
    [handleConnect],
  );

  // ── Render: connection form (disconnected state) ──────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="log-viewer-session">
        <form
          className="log-viewer-session__connection-form"
          onSubmit={handleConnectSubmit}
        >
          <h3 className="log-viewer-session__form-title">Log Source</h3>

          <label className="log-viewer-session__field">
            <span className="log-viewer-session__label">Source Type</span>
            <select
              className="log-viewer-session__select"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              aria-label="Log source type"
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SOURCE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

          {sourceType === 'file' && (
            <label className="log-viewer-session__field">
              <span className="log-viewer-session__label">File Path</span>
              <input
                className="log-viewer-session__input"
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/var/log/app.log"
                required
                aria-label="Log file path"
              />
            </label>
          )}

          {sourceType === 'docker' && (
            <label className="log-viewer-session__field">
              <span className="log-viewer-session__label">
                Container Name / ID
              </span>
              <input
                className="log-viewer-session__input"
                type="text"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                placeholder="my-container"
                required
                aria-label="Docker container name or ID"
              />
            </label>
          )}

          {sourceType === 'cloud' && (
            <label className="log-viewer-session__field">
              <span className="log-viewer-session__label">Provider</span>
              <select
                className="log-viewer-session__select"
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value as CloudProvider)}
                aria-label="Cloud logging provider"
              >
                {CLOUD_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {CLOUD_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button className="log-viewer-session__connect-btn" type="submit">
            <BoxIcon name="bx-link" size={14} />
            Connect
          </button>
        </form>

        {session.state === 'error' && (
          <div className="log-viewer-session__error">
            Connection failed. Check your configuration and try again.
          </div>
        )}

        {/* Status bar */}
        <div className="log-viewer-session__status">
          <span className={statusDotClass} />
          <span>
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: connected log viewer ──────────────────────────────
  return (
    <div className="log-viewer-session">
      {/* Detected log files picker */}
      {detectedLogs.show && detectedLogs.files.length > 0 && (
        <div className="log-viewer-session__log-picker">
          <span className="log-viewer-session__log-picker-header">
            Detected log files:
          </span>
          <div className="log-viewer-session__log-picker-files">
            {detectedLogs.files.map((f) => (
              <button
                key={f}
                className="log-viewer-session__log-picker-item"
                type="button"
                onClick={() => {
                  setFilePath(f);
                  setDetectedLogs((prev) => ({ ...prev, show: false }));
                }}
                title={f}
              >
                <BoxIcon name="bx-file" size={12} />
                {f}
              </button>
            ))}
          </div>
          <button
            className="log-viewer-session__log-picker-dismiss"
            type="button"
            onClick={() => setDetectedLogs((prev) => ({ ...prev, show: false }))}
            aria-label="Dismiss log file picker"
          >
            <BoxIcon name="bx-x" size={14} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="log-viewer-session__toolbar">
        <div className="log-viewer-session__level-chips">
          <button
            className={
              'log-viewer-session__level-chip' +
              (activeLevels.size === LOG_LEVELS.length
                ? ' log-viewer-session__level-chip--active'
                : '')
            }
            onClick={selectAllLevels}
            type="button"
          >
            All
          </button>
          {LOG_LEVELS.map((level) => (
            <button
              key={level}
              className={
                'log-viewer-session__level-chip' +
                ` log-viewer-session__level-chip--${level}` +
                (activeLevels.has(level)
                  ? ' log-viewer-session__level-chip--active'
                  : '')
              }
              onClick={() => toggleLevel(level)}
              type="button"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <input
          className="log-viewer-session__search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search logs..."
          aria-label="Search logs"
        />

        <button
          className={
            'log-viewer-session__tail-btn' +
            (isTailing ? ' log-viewer-session__tail-btn--active' : '')
          }
          onClick={toggleTailing}
          type="button"
          aria-label="Toggle tail mode"
          title={isTailing ? 'Tail mode: ON' : 'Tail mode: OFF'}
        >
          <BoxIcon name="bx-down-arrow-alt" size={14} />
          Tail
        </button>

        <button
          className="log-viewer-session__disconnect-btn"
          onClick={handleDisconnect}
          type="button"
        >
          <BoxIcon name="bx-power-off" size={14} />
          Disconnect
        </button>
      </div>

      {/* Log entries */}
      <div className="log-viewer-session__entries" ref={entriesRef}>
        {filteredEntries.length === 0 && (
          <div className="log-viewer-session__empty">
            {entries.length === 0
              ? 'Waiting for log entries...'
              : 'No entries match the current filter'}
          </div>
        )}

        {filteredEntries.map((entry, idx) => {
          const isExpanded = expandedEntries.has(idx);
          const expandable = entry.meta !== undefined && Object.keys(entry.meta).length > 0;

          return (
            <div
              key={idx}
              className={
                'log-viewer-session__entry' +
                ` log-viewer-session__entry--${entry.level}`
              }
              onClick={expandable ? () => toggleExpand(idx) : undefined}
              role={expandable ? 'button' : undefined}
              tabIndex={expandable ? 0 : undefined}
              onKeyDown={
                expandable
                  ? (e) => {
                      if (e.key === 'Enter') toggleExpand(idx);
                    }
                  : undefined
              }
            >
              <span className="log-viewer-session__entry-ts">
                [{entry.timestamp}]
              </span>
              <span className="log-viewer-session__entry-level">
                [{entry.level.toUpperCase()}]
              </span>
              <span className="log-viewer-session__entry-msg">
                {entry.message}
              </span>
              {expandable && (
                <span className="log-viewer-session__entry-expand-icon">
                  {isExpanded ? (
                    <BoxIcon name="bx-chevron-down" size={12} />
                  ) : (
                    <BoxIcon name="bx-chevron-right" size={12} />
                  )}
                </span>
              )}
              {isExpanded && entry.meta && (
                <pre className="log-viewer-session__entry-expand">
                  {JSON.stringify(entry.meta, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="log-viewer-session__status">
        <span className={statusDotClass} />
        <span className="log-viewer-session__status-count">
          {filteredEntries.length.toLocaleString()} entries
        </span>
        <span className="log-viewer-session__status-source">
          {sourceLabel}
        </span>
        <span className="log-viewer-session__status-state">
          {isConnecting ? 'Connecting...' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
