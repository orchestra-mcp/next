import React, { useCallback, useRef, useState } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './DatabaseSession.css';

/** Supported database drivers. */
const DRIVERS = ['postgresql', 'mysql', 'sqlite', 'redis', 'mongodb'] as const;
type Driver = (typeof DRIVERS)[number];

/** Default ports per driver. */
const DEFAULT_PORTS: Record<Driver, number> = {
  postgresql: 5432,
  mysql: 3306,
  sqlite: 0,
  redis: 6379,
  mongodb: 27017,
};

/** Driver display labels. */
const DRIVER_LABELS: Record<Driver, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  redis: 'Redis',
  mongodb: 'MongoDB',
};

/** Icon names per driver. */
const DRIVER_ICONS: Record<Driver, string> = {
  postgresql: 'bxl-postgresql',
  mysql: 'bx-data',
  sqlite: 'bx-file',
  redis: 'bxs-bolt',
  mongodb: 'bx-data',
};

/** Drivers that connect at server level (no database name required). */
const SERVER_LEVEL_DRIVERS: ReadonlySet<Driver> = new Set(['postgresql', 'mysql', 'mongodb']);

/** Maximum number of queries kept in history. */
const MAX_HISTORY = 20;

/** Settings server port for REST API calls. */
const SETTINGS_PORT = 19191;

interface SchemaColumn {
  name: string;
  type: string;
  nullable?: boolean;
  primary?: boolean;
}

interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

interface Schema {
  tables: SchemaTable[];
}

interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  duration: string;
}

/** Messages received from the backend (envelope: {msgType, data}). */
interface WsInMessage {
  msgType: string;
  data: any;
}

/**
 * DatabaseSession provides a SQL query editor with a results table
 * and a schema browser sidebar. Uses the design system variables
 * and supports compact/modern variants via `[data-variant]`.
 *
 * UX flow for server-level drivers (PostgreSQL, MySQL, MongoDB):
 *   1. Connect form — no database name required
 *   2. After connect, backend sends list of databases
 *   3. Database picker screen — user selects a database
 *   4. Frontend sends `use_database` message
 *   5. Full query editor becomes available
 */
export const DatabaseSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState } = props;
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Connection fields
  const [driver, setDriver] = useState<Driver>(
    (session.connectionConfig?.driver as Driver) ?? 'postgresql',
  );
  const [host, setHost] = useState<string>(
    (session.connectionConfig?.host as string) ?? 'localhost',
  );
  const [port, setPort] = useState<string>(
    (session.connectionConfig?.port as string) ?? String(DEFAULT_PORTS.postgresql),
  );
  const [username, setUsername] = useState<string>(
    (session.connectionConfig?.username as string) ?? '',
  );
  const [password, setPassword] = useState<string>(
    (session.connectionConfig?.password as string) ?? '',
  );
  const [database, setDatabase] = useState<string>(
    (session.connectionConfig?.database as string) ?? '',
  );

  // Server-level connection state
  const [databases, setDatabases] = useState<string[] | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');

  // Editor and results state
  const [query, setQuery] = useState<string>(
    (session.sessionData?.query as string) ?? '',
  );
  const [results, setResults] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>(
    (session.sessionData?.queryHistory as string[]) ?? [],
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const isConnectedState = session.state === 'connected';
  const isConnecting = session.state === 'connecting';
  const isSqlite = driver === 'sqlite';
  const isServerLevel = SERVER_LEVEL_DRIVERS.has(driver);

  // canConnect: SQLite requires file path, server-level drivers connect without a database name
  const canConnect = isSqlite ? database.trim() !== '' : true;

  // Track pending schema requests to build full schema tree.
  const pendingSchemaRef = useRef<{ tables: string[]; collected: SchemaTable[] }>({
    tables: [],
    collected: [],
  });

  // Ref to send fn (populated after useSessionWorker).
  const sendRef = useRef<(data: unknown) => void>(() => {});

  // ── Load schema for all tables sequentially ─────────────────
  const fetchSchemaForTables = useCallback((tableNames: string[]) => {
    if (tableNames.length === 0) {
      setSchema({ tables: [] });
      return;
    }
    pendingSchemaRef.current = { tables: tableNames, collected: [] };
    // Request schema for the first table
    sendRef.current({ msgType: 'schema', data: { table: tableNames[0] } });
  }, []);

  // ── WebSocket via useSessionWorker ──────────────────────────
  const handleMessage = useCallback(
    (data: unknown) => {
      try {
        const msg = data as WsInMessage;

        if (msg.msgType === 'connected') {
          // System message from ws_handler — WS is open; send connect config now
          onUpdateState({ state: 'connected' });
          setError(null);
          setTimeout(() => {
            sendRef.current({
              msgType: 'connect',
              config: { driver, host, port: Number(port), username, password, database },
            });
          }, 100);
        } else if (msg.msgType === 'connect') {
          // Provider response — DB (or server) connected
          onUpdateState({ state: 'connected' });
          setError(null);
          setSchema(null);
          setResults(null);
          if (isServerLevel && !database && !selectedDatabase) {
            // Server-level connect — request list of databases
            setTimeout(() => sendRef.current({ msgType: 'databases' }), 50);
          } else {
            // Specific database already selected (SQLite / Redis / after use_database)
            setTimeout(() => sendRef.current({ msgType: 'tables' }), 50);
          }
        } else if (msg.msgType === 'databases') {
          // Backend sends string[] of database names
          const dbList = msg.data as string[];
          setDatabases(dbList);
        } else if (msg.msgType === 'use_database') {
          // Successfully switched to a specific database
          const dbName = (msg.data as { database?: string })?.database ?? selectedDatabase;
          if (dbName) setSelectedDatabase(dbName);
          setDatabases(null); // hide database picker
          setSchema(null);
          setTimeout(() => sendRef.current({ msgType: 'tables' }), 50);
        } else if (msg.msgType === 'tables') {
          // Backend returns string[] of table names
          const tableNames = msg.data as string[];
          fetchSchemaForTables(tableNames);
        } else if (msg.msgType === 'schema') {
          // Backend returns ColumnInfo[] for a single table.
          const pending = pendingSchemaRef.current;
          const tableIdx = pending.collected.length;
          const tableName = pending.tables[tableIdx];
          if (tableName) {
            const columns = (msg.data as SchemaColumn[]) ?? [];
            pending.collected.push({ name: tableName, columns });
            const nextIdx = tableIdx + 1;
            if (nextIdx < pending.tables.length) {
              sendRef.current({ msgType: 'schema', data: { table: pending.tables[nextIdx] } });
            } else {
              setSchema({ tables: pending.collected });
            }
          }
        } else if (msg.msgType === 'query') {
          const result = msg.data as QueryResult;
          setResults(result);
          setError(null);
          setIsExecuting(false);
        } else if (msg.msgType === 'error') {
          setError(typeof msg.data === 'string' ? msg.data : 'Unknown error');
          setIsExecuting(false);
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [onUpdateState, fetchSchemaForTables, driver, host, port, username, password, database, isServerLevel, selectedDatabase],
  );

  const { connect, disconnect, send, isConnected } = useSessionWorker(
    props,
    { sessionType: 'database', onMessage: handleMessage },
  );

  // Keep sendRef in sync so callbacks can use it.
  sendRef.current = send;

  // ── Connect to server/database ───────────────────────────────
  const handleConnect = useCallback(() => {
    onUpdateState({
      connectionConfig: { driver, host, port, username, password, database },
    });
    connect();
    // Config is sent once WS opens (handled by handleMessage 'connected')
  }, [driver, host, port, username, password, database, onUpdateState, connect]);

  // ── Disconnect ──────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    disconnect();
    setSchema(null);
    setResults(null);
    setError(null);
    setDatabases(null);
    setSelectedDatabase('');
  }, [disconnect]);

  // ── SQLite file picker ────────────────────────────────────
  const [isBrowsing, setIsBrowsing] = useState(false);

  const handleBrowseSqlite = useCallback(async () => {
    setIsBrowsing(true);
    try {
      const resp = await fetch(`http://localhost:${SETTINGS_PORT}/api/dialog/open-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Select SQLite Database',
          filters: [
            { displayName: 'SQLite Databases', pattern: '*.db;*.sqlite;*.sqlite3' },
            { displayName: 'All Files', pattern: '*' },
          ],
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.path) {
          setDatabase(data.path);
        }
      }
    } catch {
      // Dialog cancelled or API unavailable
    } finally {
      setIsBrowsing(false);
    }
  }, []);

  // ── Execute query ───────────────────────────────────────────
  const executeQuery = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || !isConnectedState) return;

    setIsExecuting(true);
    setError(null);
    send({ msgType: 'query', sql: trimmed });

    // Add to history (deduplicate, cap at MAX_HISTORY)
    setQueryHistory((prev) => {
      const filtered = prev.filter((q) => q !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      onUpdateState({ sessionData: { ...session.sessionData, query: trimmed, queryHistory: next } });
      return next;
    });
  }, [query, isConnectedState, send, onUpdateState, session.sessionData]);

  // ── Keyboard shortcut (Ctrl+Enter / Cmd+Enter) ─────────────
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    },
    [executeQuery],
  );

  // ── Schema: toggle table expansion ──────────────────────────
  const toggleTable = useCallback((tableName: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  }, []);

  // ── Schema: click table name inserts SELECT ─────────────────
  const handleTableClick = useCallback(
    (tableName: string) => {
      const sql = `SELECT * FROM ${tableName} LIMIT 100`;
      setQuery(sql);
      editorRef.current?.focus();
    },
    [],
  );

  // ── Select from history ─────────────────────────────────────
  const handleHistorySelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val) {
        setQuery(val);
        editorRef.current?.focus();
      }
    },
    [],
  );

  // ── Driver change updates default port ──────────────────────
  const handleDriverChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as Driver;
      setDriver(value);
      setPort(String(DEFAULT_PORTS[value]));
    },
    [],
  );

  // ── Status dot class ────────────────────────────────────────
  const statusDotClass = [
    'database-session__status-dot',
    isConnected
      ? 'database-session__status-dot--connected'
      : isConnecting
        ? 'database-session__status-dot--connecting'
        : session.state === 'error'
          ? 'database-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Render: connection form ─────────────────────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="database-session">
        <div className="database-session__connection-form">
          <div className="database-session__form-header">
            <BoxIcon name="bx-data" size={20} className="database-session__form-icon" />
            <h3 className="database-session__form-title">Connect to Database</h3>
          </div>

          <label className="database-session__field">
            <span className="database-session__label">Driver</span>
            <div className="database-session__select-wrap">
              <select
                className="database-session__select"
                value={driver}
                onChange={handleDriverChange}
                aria-label="Database driver"
              >
                {DRIVERS.map((d) => (
                  <option key={d} value={d}>{DRIVER_LABELS[d]}</option>
                ))}
              </select>
              <BoxIcon name={DRIVER_ICONS[driver]} size={14} className="database-session__select-icon" />
            </div>
          </label>

          {isSqlite ? (
            <div className="database-session__field">
              <span className="database-session__label">Database File</span>
              <div className="database-session__file-picker">
                <div className="database-session__file-path">
                  <BoxIcon name="bx-file" size={14} className="database-session__file-path-icon" />
                  <span className="database-session__file-path-text">
                    {database || 'No file selected'}
                  </span>
                </div>
                <button
                  className="database-session__browse-btn"
                  onClick={handleBrowseSqlite}
                  disabled={isBrowsing}
                  type="button"
                >
                  <BoxIcon name="bx-folder-open" size={14} />
                  {isBrowsing ? 'Opening...' : 'Browse'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="database-session__field-row">
                <label className="database-session__field database-session__field--grow">
                  <span className="database-session__label">Host</span>
                  <input
                    className="database-session__input"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    aria-label="Host"
                  />
                </label>

                {DEFAULT_PORTS[driver] > 0 && (
                  <label className="database-session__field database-session__field--port">
                    <span className="database-session__label">Port</span>
                    <input
                      className="database-session__input"
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder={String(DEFAULT_PORTS[driver])}
                      aria-label="Port"
                    />
                  </label>
                )}
              </div>

              <div className="database-session__field-row">
                <label className="database-session__field database-session__field--grow">
                  <span className="database-session__label">Username</span>
                  <input
                    className="database-session__input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="postgres"
                    aria-label="Username"
                  />
                </label>

                <label className="database-session__field database-session__field--grow">
                  <span className="database-session__label">Password</span>
                  <div className="database-session__input-wrap">
                    <BoxIcon name="bx-lock-alt" size={14} className="database-session__input-icon" />
                    <input
                      className="database-session__input database-session__input--with-icon"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      aria-label="Password"
                    />
                  </div>
                </label>
              </div>
            </>
          )}

          <button
            className="database-session__connect-btn"
            onClick={handleConnect}
            disabled={!canConnect}
            type="button"
          >
            <BoxIcon name="bx-link" size={14} />
            Connect
          </button>
        </div>

        {/* Status bar */}
        <div className="database-session__status">
          <span className={statusDotClass} />
          <span className="database-session__status-text">
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: database picker (server-level connect) ──────────
  if (isConnected && databases !== null && !selectedDatabase) {
    return (
      <div className="database-session">
        <div className="database-session__db-picker">
          <div className="database-session__db-picker-header">
            <BoxIcon name="bx-server" size={16} />
            <span>Select Database</span>
            <span className="database-session__schema-count">{databases.length} databases</span>
          </div>
          <div className="database-session__db-list">
            {databases.map((db) => (
              <button
                key={db}
                className="database-session__db-item"
                onClick={() => {
                  setSelectedDatabase(db);
                  send({ msgType: 'use_database', data: db });
                }}
                type="button"
              >
                <BoxIcon name="bx-data" size={14} />
                {db}
              </button>
            ))}
            {databases.length === 0 && (
              <div className="database-session__schema-empty">No databases found</div>
            )}
          </div>
        </div>
        <div className="database-session__status">
          <span className={statusDotClass} />
          <span className="database-session__status-text">
            Connected to {DRIVER_LABELS[driver]} server — select a database
          </span>
          <button className="database-session__disconnect-btn" onClick={handleDisconnect} type="button">
            <BoxIcon name="bx-unlink" size={14} /> Disconnect
          </button>
        </div>
      </div>
    );
  }

  // ── Render: connected workspace ─────────────────────────────
  return (
    <div className="database-session">
      <div className="database-session__workspace">
        {/* Schema sidebar — always visible when connected */}
        <div className="database-session__schema">
          <div className="database-session__schema-header">
            <BoxIcon name="bx-sitemap" size={14} className="database-session__schema-header-icon" />
            <span>Schema</span>
            {selectedDatabase && (
              <span className="database-session__schema-db-name" title={selectedDatabase}>
                {selectedDatabase}
              </span>
            )}
            {schema && (
              <span className="database-session__schema-count">
                {schema.tables.length} table{schema.tables.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="database-session__schema-tree">
            {!schema && (
              <div className="database-session__schema-empty">
                <BoxIcon name="bx-loader-alt" size={14} className="database-session__schema-loading" />
                Loading schema...
              </div>
            )}
            {schema && schema.tables.map((table) => (
              <div key={table.name} className="database-session__schema-table">
                <button
                  className="database-session__schema-table-name"
                  onClick={() => toggleTable(table.name)}
                  onDoubleClick={() => handleTableClick(table.name)}
                  type="button"
                  title="Double-click to query"
                >
                  <BoxIcon
                    name={expandedTables.has(table.name) ? 'bx-chevron-down' : 'bx-chevron-right'}
                    size={14}
                    className="database-session__schema-arrow"
                  />
                  <BoxIcon name="bx-table" size={12} className="database-session__schema-table-icon" />
                  <span className="database-session__schema-table-label">{table.name}</span>
                  {expandedTables.has(table.name) && (
                    <span className="database-session__schema-col-count">
                      {table.columns.length}
                    </span>
                  )}
                </button>
                {expandedTables.has(table.name) && (
                  <div className="database-session__schema-columns">
                    {table.columns.map((col) => (
                      <div
                        key={col.name}
                        className="database-session__schema-column"
                      >
                        <BoxIcon
                          name={col.primary ? 'bx-key' : 'bx-columns'}
                          size={10}
                          className={`database-session__schema-col-icon${col.primary ? ' database-session__schema-col-icon--primary' : ''}`}
                        />
                        <span className="database-session__schema-col-name">
                          {col.name}
                        </span>
                        <span className="database-session__schema-col-type">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {schema && schema.tables.length === 0 && (
              <div className="database-session__schema-empty">
                <BoxIcon name="bx-info-circle" size={14} />
                No tables found
              </div>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="database-session__editor-area">
          {/* Toolbar */}
          <div className="database-session__toolbar">
            <button
              className="database-session__run-btn"
              onClick={executeQuery}
              disabled={isExecuting || !query.trim()}
              type="button"
            >
              <BoxIcon name={isExecuting ? 'bx-loader-alt' : 'bx-play'} size={14} />
              {isExecuting ? 'Running...' : 'Run'}
            </button>

            <span className="database-session__shortcut-hint">
              <BoxIcon name="bx-command" size={10} />
              Enter
            </span>

            {queryHistory.length > 0 && (
              <select
                className="database-session__history-select"
                onChange={handleHistorySelect}
                value=""
                aria-label="Query history"
              >
                <option value="">History ({queryHistory.length})</option>
                {queryHistory.map((q, i) => (
                  <option key={i} value={q}>
                    {q.length > 60 ? q.slice(0, 60) + '...' : q}
                  </option>
                ))}
              </select>
            )}

            <div className="database-session__toolbar-spacer" />

            <button
              className="database-session__disconnect-btn"
              onClick={handleDisconnect}
              type="button"
            >
              <BoxIcon name="bx-unlink" size={14} />
              Disconnect
            </button>
          </div>

          {/* Editor */}
          <div className="database-session__editor">
            <textarea
              ref={editorRef}
              className="database-session__textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              placeholder="Enter SQL query..."
              spellCheck={false}
              aria-label="SQL query editor"
            />
          </div>

          {/* Results */}
          <div className="database-session__results">
            {error && (
              <div className="database-session__error">
                <BoxIcon name="bx-error-circle" size={14} className="database-session__error-icon" />
                <span>{error}</span>
              </div>
            )}

            {!error && results && (
              <div className="database-session__table-wrap">
                <table className="database-session__table">
                  <thead>
                    <tr>
                      {results.columns.map((col) => (
                        <th key={col} className="database-session__th">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="database-session__tr">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="database-session__td">
                            {cell === null ? (
                              <span className="database-session__null">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!error && !results && (
              <div className="database-session__empty">
                <BoxIcon name="bx-terminal" size={20} className="database-session__empty-icon" />
                <span>Run a query to see results</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="database-session__status">
        <span className={statusDotClass} />
        <span className="database-session__status-text">
          {isConnecting
            ? 'Connecting...'
            : selectedDatabase
              ? `${DRIVER_LABELS[driver]} — ${selectedDatabase}`
              : `Connected — ${DRIVER_LABELS[driver]}`}
        </span>
        {results && (
          <span className="database-session__status-results">
            <BoxIcon name="bx-check" size={12} />
            {results.rowCount} row{results.rowCount !== 1 ? 's' : ''} in {results.duration}
          </span>
        )}
      </div>
    </div>
  );
};
