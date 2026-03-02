import React, { useRef, useCallback, useState, useEffect } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './TestingSession.css';

/** A single test result from the runner. */
interface TestResult {
  type: 'pass' | 'fail' | 'skip';
  name: string;
  duration: number;
  output?: string;
  error?: string;
}

/** Summary returned when a test run completes. */
interface RunSummary {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

/** Messages sent to the testing backend. */
type WsOutMessage =
  | { msgType: 'detect'; data: { work_dir: string } }
  | { msgType: 'list_runners'; data: { work_dir: string } }
  | { msgType: 'run'; data: { runner: string; pattern: string; parallel: boolean; verbose: boolean } }
  | { msgType: 'stop' };

/** Messages received from the testing backend (envelope: {msgType, data}). */
interface WsInMessage {
  msgType: string;
  data: any;
}

/**
 * TestingSession provides a multi-framework test runner UI with runner
 * detection, real-time output streaming, and a collapsible results tree.
 */
export const TestingSession: React.FC<SessionContentProps> = (props) => {
  const { session } = props;
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Runner state
  const [runners, setRunners] = useState<string[]>([]);
  const [selectedRunner, setSelectedRunner] = useState('');
  const [detecting, setDetecting] = useState(false);

  // Config state
  const [pattern, setPattern] = useState('');
  const [parallel, setParallel] = useState(true);
  const [verbose, setVerbose] = useState(false);

  // Run state
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<RunSummary | null>(null);

  // UI state
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Auto-scroll output to bottom ────────────────────────────────
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // ── Handle incoming WebSocket messages ──────────────────────────
  const handleMessage = useCallback(
    (data: unknown) => {
      const msg = data as WsInMessage;

      if (msg.msgType === 'detect' || msg.msgType === 'list_runners') {
        const detected = msg.data as string[];
        setRunners(detected ?? []);
        setDetecting(false);
        if (detected?.length > 0 && !selectedRunner) {
          setSelectedRunner(detected[0]);
        }
      } else if (msg.msgType === 'run') {
        const events = msg.data as TestResult[];
        setResults(events ?? []);
        // Calculate summary from events
        const passed = events?.filter((e) => e.type === 'pass').length ?? 0;
        const failed = events?.filter((e) => e.type === 'fail').length ?? 0;
        const skipped = events?.filter((e) => e.type === 'skip').length ?? 0;
        const totalDuration = events?.reduce((sum, e) => sum + (e.duration ?? 0), 0) ?? 0;
        setSummary({ passed, failed, skipped, duration: totalDuration });
        setRunning(false);
      } else if (msg.msgType === 'stop') {
        setRunning(false);
      } else if (msg.msgType === 'error') {
        setErrorMsg(typeof msg.data === 'string' ? msg.data : 'Unknown error');
        setRunning(false);
        setDetecting(false);
        setTimeout(() => setErrorMsg(null), 5000);
      }
    },
    [selectedRunner],
  );

  const { connect, disconnect, send } = useSessionWorker(props, {
    sessionType: 'testing',
    onMessage: handleMessage,
  });

  // ── Resolve work_dir from session config ─────────────────────
  const getWorkDir = useCallback((): string => {
    return (session.connectionConfig?.work_dir as string) ?? '';
  }, [session.connectionConfig]);

  // ── Connect to testing backend ────────────────────────────────
  const handleConnect = useCallback(() => {
    connect();
    setDetecting(true);
    const workDir = (session.connectionConfig?.work_dir as string) ?? '';
    setTimeout(() => {
      send({ msgType: 'detect', data: { work_dir: workDir } } as WsOutMessage);
    }, 100);
  }, [connect, send, session.connectionConfig]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    disconnect();
    setRunners([]);
    setSelectedRunner('');
    setRunning(false);
    setOutput([]);
    setResults([]);
    setSummary(null);
    setExpandedErrors(new Set());
  }, [disconnect]);

  // ── Run tests ─────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!selectedRunner) return;

    setRunning(true);
    setOutput([]);
    setResults([]);
    setSummary(null);
    setExpandedErrors(new Set());
    setErrorMsg(null);

    send({
      msgType: 'run',
      data: { runner: selectedRunner, pattern, parallel, verbose },
    } as WsOutMessage);
  }, [selectedRunner, pattern, parallel, verbose, send]);

  // ── Stop tests ────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    send({ msgType: 'stop' } as WsOutMessage);
  }, [send]);

  // ── Refresh runners ───────────────────────────────────────────
  const handleRefreshRunners = useCallback(() => {
    setDetecting(true);
    const workDir = getWorkDir();
    send({ msgType: 'list_runners', data: { work_dir: workDir } } as WsOutMessage);
  }, [send, getWorkDir]);

  // ── Toggle error expansion ────────────────────────────────────
  const toggleError = useCallback((index: number) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // ── Format duration ───────────────────────────────────────────
  const formatDuration = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60_000).toFixed(1)}m`;
  }, []);

  // ── Status dot class ──────────────────────────────────────────
  const statusDotClass = [
    'testing-session__status-dot',
    isConnected
      ? 'testing-session__status-dot--connected'
      : isConnecting
        ? 'testing-session__status-dot--connecting'
        : session.state === 'error'
          ? 'testing-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Render: disconnected state ────────────────────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="testing-session">
        <div className="testing-session__connection-form">
          <h3 className="testing-session__form-title">Test Runner</h3>
          <p className="testing-session__form-desc">
            Multi-framework test runner with real-time output.
            Supports go test, cargo test, jest, vitest, pytest, and phpunit.
          </p>

          <button
            className="testing-session__connect-btn"
            onClick={handleConnect}
            type="button"
          >
            Connect
          </button>
        </div>

        {session.state === 'error' && (
          <div className="testing-session__error">
            Connection failed. Ensure the dev server is running and try again.
          </div>
        )}

        <div className="testing-session__status">
          <span className={statusDotClass} />
          <span>
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: connected state ───────────────────────────────────
  return (
    <div className="testing-session">
      {/* Toolbar */}
      <div className="testing-session__toolbar">
        <h3 className="testing-session__toolbar-title">Testing</h3>

        <button
          className="testing-session__action-btn"
          onClick={handleRefreshRunners}
          type="button"
          title="Re-detect test runners"
          disabled={detecting}
        >
          <BoxIcon name="bx-search-alt" size={14} />
          {detecting ? 'Detecting...' : 'Detect'}
        </button>

        <button
          className="testing-session__disconnect-btn"
          onClick={handleDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="testing-session__error-banner">
          {errorMsg}
        </div>
      )}

      {/* Runner selector */}
      <div className="testing-session__runner-bar">
        {detecting ? (
          <div className="testing-session__detecting">
            <span className="testing-session__spinner" />
            <span>Detecting test frameworks...</span>
          </div>
        ) : runners.length === 0 ? (
          <div className="testing-session__no-runners">
            No test runners detected. Click Detect to scan again.
          </div>
        ) : (
          <div className="testing-session__runner-pills">
            {runners.map((runner) => (
              <button
                key={runner}
                className={
                  'testing-session__runner-pill' +
                  (selectedRunner === runner
                    ? ' testing-session__runner-pill--active'
                    : '')
                }
                onClick={() => setSelectedRunner(runner)}
                type="button"
              >
                {runner}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Config panel */}
      {selectedRunner && (
        <div className="testing-session__config">
          <input
            className="testing-session__pattern-input"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Test pattern (e.g. ./... or **/*.test.ts)"
            aria-label="Test pattern"
          />

          <label className="testing-session__toggle">
            <input
              type="checkbox"
              checked={parallel}
              onChange={(e) => setParallel(e.target.checked)}
            />
            <span>Parallel</span>
          </label>

          <label className="testing-session__toggle">
            <input
              type="checkbox"
              checked={verbose}
              onChange={(e) => setVerbose(e.target.checked)}
            />
            <span>Verbose</span>
          </label>

          {running ? (
            <button
              className="testing-session__stop-btn"
              onClick={handleStop}
              type="button"
            >
              <BoxIcon name="bx-stop" size={14} />
              Stop
            </button>
          ) : (
            <button
              className="testing-session__run-btn"
              onClick={handleRun}
              type="button"
              disabled={!selectedRunner}
            >
              <BoxIcon name="bx-play" size={14} />
              Run
            </button>
          )}
        </div>
      )}

      {/* Main content: output + results (scrollable, fills remaining space) */}
      <div className="testing-session__main">
        {/* Real-time output */}
        {(output.length > 0 || running) && (
          <div className="testing-session__output">
            {output.map((line, i) => (
              <div key={i} className="testing-session__output-line">
                {line}
              </div>
            ))}
            {running && (
              <div className="testing-session__output-line testing-session__output-line--running">
                Running tests...
              </div>
            )}
            <div ref={outputEndRef} />
          </div>
        )}

        {/* Results tree */}
        {results.length > 0 && (
          <div className="testing-session__results">
            <div className="testing-session__results-header">
              Test Results ({results.length})
            </div>
            <ul className="testing-session__results-list">
              {results.map((result, i) => {
                const hasError = result.type === 'fail' && result.error;
                const isExpanded = expandedErrors.has(i);

                return (
                  <li key={i} className="testing-session__result-item">
                    <div
                      className="testing-session__result-row"
                      onClick={() => hasError && toggleError(i)}
                      role={hasError ? 'button' : undefined}
                      tabIndex={hasError ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (hasError && e.key === 'Enter') toggleError(i);
                      }}
                    >
                      <span className="testing-session__result-icon">
                        {result.type === 'pass' ? (
                          <BoxIcon name="bx-check" size={16} className="testing-session__result-icon--pass" />
                        ) : result.type === 'fail' ? (
                          <BoxIcon name="bx-x" size={16} className="testing-session__result-icon--fail" />
                        ) : (
                          <BoxIcon name="bx-minus" size={16} className="testing-session__result-icon--skip" />
                        )}
                      </span>

                      <span className="testing-session__result-name">
                        {result.name}
                      </span>

                      <span className="testing-session__result-duration">
                        {formatDuration(result.duration)}
                      </span>

                      {hasError && (
                        <span className="testing-session__result-expand">
                          <BoxIcon
                            name={isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'}
                            size={14}
                          />
                        </span>
                      )}
                    </div>

                    {hasError && isExpanded && (
                      <div className="testing-session__result-error">
                        {result.error}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Empty state when connected but no results */}
        {!running && results.length === 0 && output.length === 0 && selectedRunner && (
          <div className="testing-session__empty">
            Select a runner and click Run to start testing.
          </div>
        )}

        {/* Empty state when no runner selected */}
        {!running && results.length === 0 && output.length === 0 && !selectedRunner && (
          <div className="testing-session__empty">
            {detecting ? 'Detecting test frameworks...' : 'No runner selected.'}
          </div>
        )}
      </div>

      {/* Summary bar — pinned above status bar */}
      {summary && (
        <div className="testing-session__summary">
          <span className="testing-session__badge testing-session__badge--pass">
            <BoxIcon name="bx-check" size={12} />
            {summary.passed} passed
          </span>
          <span className="testing-session__badge testing-session__badge--fail">
            <BoxIcon name="bx-x" size={12} />
            {summary.failed} failed
          </span>
          <span className="testing-session__badge testing-session__badge--skip">
            <BoxIcon name="bx-minus" size={12} />
            {summary.skipped} skipped
          </span>
          <span className="testing-session__summary-duration">
            {formatDuration(summary.duration)}
          </span>
        </div>
      )}

      {/* Status bar */}
      <div className="testing-session__status">
        <span className={statusDotClass} />
        <span className="testing-session__status-runner">
          {selectedRunner || 'No runner selected'}
        </span>
        {running && (
          <span className="testing-session__status-running">
            <span className="testing-session__spinner testing-session__spinner--small" />
            Running
          </span>
        )}
        <span className="testing-session__status-state">
          {isConnecting ? 'Connecting...' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
