import React, { useCallback, useEffect, useState } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './DebuggerSession.css';

/** Supported debug adapter types. */
type AdapterType = 'delve' | 'debugpy' | 'node-debug' | 'xdebug' | 'codelldb';

/** Launch vs Attach mode. */
type DebugMode = 'launch' | 'attach';

/** Debugger execution status. */
type DebugStatus = 'idle' | 'running' | 'paused' | 'stopped';

/** Active right-panel tab. */
type RightPanelTab = 'variables' | 'callstack' | 'watch';

/** A variable from the debug adapter. */
interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
}

/** A single stack frame. */
interface StackFrame {
  id: number;
  name: string;
  file: string;
  line: number;
  column: number;
}

/** A breakpoint location. */
interface Breakpoint {
  file: string;
  line: number;
}

/** A watch expression and its evaluated value. */
interface WatchEntry {
  expression: string;
  value: string;
}

/** Source file content from the backend. */
interface SourceContent {
  file: string;
  lines: string[];
}

/** Adapter info from the backend. */
interface AdapterInfo {
  type: AdapterType;
  name: string;
  available: boolean;
}

/** A detected debug configuration preset (e.g. from launch.json). */
interface DetectedConfig {
  name: string;
  adapter: AdapterType;
  program: string;
  cwd?: string;
}

/** Messages sent to the backend. */
type WsOutMessage =
  | { msgType: 'launch'; data: { adapter: AdapterType; config: Record<string, string> } }
  | { msgType: 'attach'; data: { adapter: AdapterType; config: Record<string, string> } }
  | { msgType: 'continue' }
  | { msgType: 'step_over' }
  | { msgType: 'step_into' }
  | { msgType: 'step_out' }
  | { msgType: 'pause' }
  | { msgType: 'stop' }
  | { msgType: 'set_breakpoint'; data: { file: string; line: number } }
  | { msgType: 'remove_breakpoint'; data: { file: string; line: number } }
  | { msgType: 'variables'; data: { frame_id: number } }
  | { msgType: 'stack_trace' }
  | { msgType: 'evaluate'; data: { expression: string; frame_id: number } }
  | { msgType: 'disconnect' }
  | { msgType: 'list_adapters' }
  | { msgType: 'detect_config'; data: { workspace: string } };

/** Messages received from the backend (envelope: {msgType, data}). */
interface WsInMessage {
  msgType: string;
  data: any;
}

/** Adapter labels for the dropdown. */
const ADAPTER_LABELS: Record<AdapterType, string> = {
  delve: 'Delve (Go)',
  debugpy: 'debugpy (Python)',
  'node-debug': 'Node Debug (JS/TS)',
  xdebug: 'Xdebug (PHP)',
  codelldb: 'CodeLLDB (Rust)',
};

/**
 * DebuggerSession provides a DAP-based debug interface with launch/attach
 * configuration, step controls, source viewer, breakpoints, variable
 * inspection, call stack navigation, and watch expressions.
 */
export const DebuggerSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState } = props;

  // ── Connection form state ─────────────────────────────────────
  const [adapter, setAdapter] = useState<AdapterType>('delve');
  const [mode, setMode] = useState<DebugMode>('launch');
  const [programPath, setProgramPath] = useState('');
  const [programArgs, setProgramArgs] = useState('');
  const [workDir, setWorkDir] = useState('');
  const [attachTarget, setAttachTarget] = useState('');
  const [attachPort, setAttachPort] = useState('');

  // ── Workspace-aware presets ───────────────────────────────────
  const [detectedConfigs, setDetectedConfigs] = useState<DetectedConfig[]>([]);

  // ── Debug state ───────────────────────────────────────────────
  const [debugStatus, setDebugStatus] = useState<DebugStatus>('idle');
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);
  const [source, setSource] = useState<SourceContent | null>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Right panel tab ───────────────────────────────────────────
  const [rightTab, setRightTab] = useState<RightPanelTab>('variables');

  // ── Watch expressions ─────────────────────────────────────────
  const [watches, setWatches] = useState<WatchEntry[]>([]);
  const [watchInput, setWatchInput] = useState('');

  // ── Variable tree expansion ───────────────────────────────────
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Handle incoming messages from the backend ─────────────────
  const handleMessage = useCallback(
    (data: unknown) => {
      try {
        const msg = data as WsInMessage;

        switch (msg.msgType) {
          case 'launch':
          case 'attach':
          case 'continue':
          case 'step_over':
          case 'step_into':
          case 'step_out':
            setDebugStatus('running');
            setCurrentLine(null);
            break;

          case 'stop':
          case 'disconnect':
            setDebugStatus('stopped');
            setCurrentLine(null);
            break;

          case 'variables': {
            const vars = msg.data as Variable[];
            setVariables(vars ?? []);
            break;
          }

          case 'stack_trace': {
            const frames = msg.data as StackFrame[];
            setStackFrames(frames ?? []);
            if (frames?.length > 0 && activeFrameId === null) {
              setActiveFrameId(frames[0].id);
            }
            break;
          }

          case 'set_breakpoint': {
            const bp = msg.data as { file: string; line: number };
            if (bp) {
              setBreakpoints((prev) => {
                const exists = prev.some(
                  (b) => b.file === bp.file && b.line === bp.line,
                );
                if (exists) return prev;
                return [...prev, { file: bp.file, line: bp.line }];
              });
            }
            break;
          }

          case 'remove_breakpoint': {
            const bp = msg.data as { file: string; line: number };
            if (bp) {
              setBreakpoints((prev) =>
                prev.filter(
                  (b) => !(b.file === bp.file && b.line === bp.line),
                ),
              );
            }
            break;
          }

          case 'evaluate': {
            const result = msg.data as { expression?: string; value?: string; result?: string };
            if (result?.expression) {
              setWatches((prev) =>
                prev.map((w) =>
                  w.expression === result.expression
                    ? { ...w, value: result.value ?? result.result ?? '' }
                    : w,
                ),
              );
            }
            break;
          }

          case 'detect_config': {
            const configs = msg.data as DetectedConfig[];
            if (Array.isArray(configs) && configs.length > 0) {
              setDetectedConfigs(configs);
            }
            break;
          }

          case 'list_adapters':
            // Could update adapter list — currently using static list
            break;

          case 'error':
            setErrorMsg(typeof msg.data === 'string' ? msg.data : 'Unknown error');
            setTimeout(() => setErrorMsg(null), 5000);
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [activeFrameId],
  );

  // ── useSessionWorker manages WebSocket lifecycle ──────────────
  const { connect, disconnect, send, isConnected: workerConnected } =
    useSessionWorker(props, {
      sessionType: 'debugger',
      onMessage: handleMessage,
    });

  // ── Pre-populate workDir from workspace on mount ──────────────
  useEffect(() => {
    const workspace = (session.connectionConfig?.workspace as string) ?? '';
    if (workspace && !workDir) {
      setWorkDir(workspace);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-detect debug configs on connection ───────────────────
  useEffect(() => {
    if (session.state === 'connected') {
      const workspace = (session.connectionConfig?.workspace as string) ?? '';
      if (workspace) {
        send({ msgType: 'detect_config', data: { workspace } });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state]);

  // ── Send typed message to backend ─────────────────────────────
  const wsSend = useCallback(
    (msg: WsOutMessage) => {
      send(msg);
    },
    [send],
  );

  // ── Connect and start debug session ───────────────────────────
  const handleLaunchOrAttach = useCallback(() => {
    connect();

    // After connect completes (state changes to connected via the hook),
    // we send the launch/attach message. We delay slightly to ensure
    // the WebSocket is open.
    setTimeout(() => {
      if (mode === 'launch') {
        wsSend({
          msgType: 'launch',
          data: {
            adapter,
            config: {
              program: programPath,
              args: programArgs,
              cwd: workDir,
            },
          },
        });
      } else {
        wsSend({
          msgType: 'attach',
          data: {
            adapter,
            config: {
              target: attachTarget,
              port: attachPort,
            },
          },
        });
      }
      setDebugStatus('running');
      onUpdateState({ state: 'connected' });
    }, 100);
  }, [
    connect, mode, adapter, programPath, programArgs, workDir,
    attachTarget, attachPort, wsSend, onUpdateState,
  ]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    wsSend({ msgType: 'disconnect' });
    disconnect();
    setDebugStatus('idle');
    setVariables([]);
    setStackFrames([]);
    setCurrentLine(null);
    setSource(null);
    setOutputLines([]);
  }, [disconnect, wsSend]);

  // ── Step controls ─────────────────────────────────────────────
  const handleContinue = useCallback(() => wsSend({ msgType: 'continue' }), [wsSend]);
  const handleStepOver = useCallback(() => wsSend({ msgType: 'step_over' }), [wsSend]);
  const handleStepInto = useCallback(() => wsSend({ msgType: 'step_into' }), [wsSend]);
  const handleStepOut = useCallback(() => wsSend({ msgType: 'step_out' }), [wsSend]);
  const handlePause = useCallback(() => wsSend({ msgType: 'pause' }), [wsSend]);
  const handleStop = useCallback(() => wsSend({ msgType: 'stop' }), [wsSend]);

  // ── Breakpoint toggle ─────────────────────────────────────────
  const toggleBreakpoint = useCallback(
    (line: number) => {
      if (!source) return;
      const file = source.file;
      const exists = breakpoints.some(
        (bp) => bp.file === file && bp.line === line,
      );
      if (exists) {
        wsSend({ msgType: 'remove_breakpoint', data: { file, line } });
      } else {
        wsSend({ msgType: 'set_breakpoint', data: { file, line } });
      }
    },
    [source, breakpoints, wsSend],
  );

  // ── Remove a specific breakpoint ──────────────────────────────
  const removeBreakpoint = useCallback(
    (bp: Breakpoint) => {
      wsSend({ msgType: 'remove_breakpoint', data: { file: bp.file, line: bp.line } });
    },
    [wsSend],
  );

  // ── Switch active stack frame ─────────────────────────────────
  const handleFrameClick = useCallback(
    (frame: StackFrame) => {
      setActiveFrameId(frame.id);
      wsSend({ msgType: 'variables', data: { frame_id: frame.id } });
    },
    [wsSend],
  );

  // ── Add watch expression ──────────────────────────────────────
  const handleAddWatch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const expr = watchInput.trim();
      if (!expr) return;
      setWatches((prev) => [...prev, { expression: expr, value: '...' }]);
      setWatchInput('');
      if (activeFrameId !== null) {
        wsSend({ msgType: 'evaluate', data: { expression: expr, frame_id: activeFrameId } });
      }
    },
    [watchInput, activeFrameId, wsSend],
  );

  // ── Remove watch expression ───────────────────────────────────
  const removeWatch = useCallback((expression: string) => {
    setWatches((prev) => prev.filter((w) => w.expression !== expression));
  }, []);

  // ── Toggle variable tree expansion ────────────────────────────
  const toggleVarExpand = useCallback((path: string) => {
    setExpandedVars((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  // ── Form handlers ─────────────────────────────────────────────
  const handleAdapterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setAdapter(e.target.value as AdapterType),
    [],
  );

  const handleModeToggle = useCallback(
    (newMode: DebugMode) => setMode(newMode),
    [],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleLaunchOrAttach();
    },
    [handleLaunchOrAttach],
  );

  // ── Status dot class ──────────────────────────────────────────
  const statusDotClass = [
    'debugger-session__status-dot',
    isConnected
      ? 'debugger-session__status-dot--connected'
      : isConnecting
        ? 'debugger-session__status-dot--connecting'
        : session.state === 'error'
          ? 'debugger-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Render variable tree recursively ──────────────────────────
  const renderVariable = (v: Variable, path: string, depth: number) => {
    const hasChildren = v.children && v.children.length > 0;
    const isExpanded = expandedVars.has(path);

    return (
      <div key={path} className="debugger-session__var-node">
        <div
          className="debugger-session__var-row"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={hasChildren ? () => toggleVarExpand(path) : undefined}
          role={hasChildren ? 'button' : undefined}
          tabIndex={hasChildren ? 0 : undefined}
          onKeyDown={
            hasChildren
              ? (e) => {
                  if (e.key === 'Enter') toggleVarExpand(path);
                }
              : undefined
          }
        >
          {hasChildren && (
            <span className="debugger-session__var-toggle">
              <BoxIcon
                name={isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'}
                size={12}
              />
            </span>
          )}
          <span className="debugger-session__var-name">{v.name}</span>
          <span className="debugger-session__var-value">{v.value}</span>
          <span className="debugger-session__var-type">{v.type}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="debugger-session__var-children">
            {v.children!.map((child, i) =>
              renderVariable(child, `${path}.${child.name}.${i}`, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Render: disconnected — Launch/Attach form ─────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="debugger-session">
        <form
          className="debugger-session__connection-form"
          onSubmit={handleFormSubmit}
        >
          <h3 className="debugger-session__form-title">Debugger</h3>
          <p className="debugger-session__form-desc">
            Debug applications using the Debug Adapter Protocol (DAP).
          </p>

          {/* Quick Start: detected launch configurations */}
          {detectedConfigs.length > 0 && (
            <label className="debugger-session__label">
              Quick Start
              <select
                className="debugger-session__select"
                defaultValue=""
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx) && detectedConfigs[idx]) {
                    const cfg = detectedConfigs[idx];
                    setAdapter(cfg.adapter);
                    setProgramPath(cfg.program);
                    if (cfg.cwd) setWorkDir(cfg.cwd);
                  }
                }}
                aria-label="Quick start configuration"
              >
                <option value="" disabled>
                  Select a detected configuration...
                </option>
                {detectedConfigs.map((cfg, idx) => (
                  <option key={idx} value={idx}>
                    {cfg.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Adapter selector */}
          <label className="debugger-session__label">
            Adapter
            <select
              className="debugger-session__select"
              value={adapter}
              onChange={handleAdapterChange}
              aria-label="Debug adapter"
            >
              {(Object.keys(ADAPTER_LABELS) as AdapterType[]).map((key) => (
                <option key={key} value={key}>
                  {ADAPTER_LABELS[key]}
                </option>
              ))}
            </select>
          </label>

          {/* Mode toggle */}
          <div className="debugger-session__mode-toggle">
            <button
              className={
                'debugger-session__mode-btn' +
                (mode === 'launch'
                  ? ' debugger-session__mode-btn--active'
                  : '')
              }
              type="button"
              onClick={() => handleModeToggle('launch')}
            >
              Launch
            </button>
            <button
              className={
                'debugger-session__mode-btn' +
                (mode === 'attach'
                  ? ' debugger-session__mode-btn--active'
                  : '')
              }
              type="button"
              onClick={() => handleModeToggle('attach')}
            >
              Attach
            </button>
          </div>

          {/* Launch fields */}
          {mode === 'launch' && (
            <>
              <label className="debugger-session__label">
                Program Path
                <input
                  className="debugger-session__input"
                  type="text"
                  value={programPath}
                  onChange={(e) => setProgramPath(e.target.value)}
                  placeholder="e.g. ./cmd/server/main.go"
                  required
                  aria-label="Program path"
                />
              </label>

              <label className="debugger-session__label">
                Arguments
                <input
                  className="debugger-session__input"
                  type="text"
                  value={programArgs}
                  onChange={(e) => setProgramArgs(e.target.value)}
                  placeholder="e.g. --port 8080"
                  aria-label="Program arguments"
                />
              </label>

              <label className="debugger-session__label">
                Working Directory
                <input
                  className="debugger-session__input"
                  type="text"
                  value={workDir}
                  onChange={(e) => setWorkDir(e.target.value)}
                  placeholder="e.g. /home/user/project"
                  aria-label="Working directory"
                />
              </label>
            </>
          )}

          {/* Attach fields */}
          {mode === 'attach' && (
            <>
              <label className="debugger-session__label">
                PID or Process Name
                <input
                  className="debugger-session__input"
                  type="text"
                  value={attachTarget}
                  onChange={(e) => setAttachTarget(e.target.value)}
                  placeholder="e.g. 12345 or myapp"
                  required
                  aria-label="PID or process name"
                />
              </label>

              <label className="debugger-session__label">
                Port
                <input
                  className="debugger-session__input debugger-session__input--port"
                  type="text"
                  value={attachPort}
                  onChange={(e) => setAttachPort(e.target.value)}
                  placeholder="e.g. 2345"
                  aria-label="Debug port"
                />
              </label>
            </>
          )}

          <button className="debugger-session__connect-btn" type="submit">
            {mode === 'launch' ? 'Launch' : 'Attach'}
          </button>
        </form>

        {session.state === 'error' && (
          <div className="debugger-session__error">
            Connection failed. Ensure the dev server is running and the adapter
            is available.
          </div>
        )}

        <div className="debugger-session__status">
          <span className={statusDotClass} />
          <span>
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: connected — Debug UI ──────────────────────────────
  const isPaused = debugStatus === 'paused';
  const isRunning = debugStatus === 'running';

  return (
    <div className="debugger-session">
      {/* Error banner */}
      {errorMsg && (
        <div className="debugger-session__error-banner">{errorMsg}</div>
      )}

      {/* Step controls toolbar */}
      <div className="debugger-session__toolbar">
        <div className="debugger-session__step-controls">
          <button
            className="debugger-session__step-btn"
            onClick={handleContinue}
            disabled={!isPaused}
            type="button"
            title="Continue (F5)"
            aria-label="Continue"
          >
            <BoxIcon name="bx-play" size={16} />
          </button>

          <button
            className="debugger-session__step-btn"
            onClick={handleStepOver}
            disabled={!isPaused}
            type="button"
            title="Step Over (F10)"
            aria-label="Step Over"
          >
            <BoxIcon name="bx-skip-next" size={16} />
          </button>

          <button
            className="debugger-session__step-btn"
            onClick={handleStepInto}
            disabled={!isPaused}
            type="button"
            title="Step Into (F11)"
            aria-label="Step Into"
          >
            <BoxIcon name="bx-down-arrow-alt" size={16} />
          </button>

          <button
            className="debugger-session__step-btn"
            onClick={handleStepOut}
            disabled={!isPaused}
            type="button"
            title="Step Out (Shift+F11)"
            aria-label="Step Out"
          >
            <BoxIcon name="bx-up-arrow-alt" size={16} />
          </button>

          <span className="debugger-session__step-separator" />

          <button
            className="debugger-session__step-btn debugger-session__step-btn--pause"
            onClick={handlePause}
            disabled={!isRunning}
            type="button"
            title="Pause (F6)"
            aria-label="Pause"
          >
            <BoxIcon name="bx-pause" size={16} />
          </button>

          <button
            className="debugger-session__step-btn debugger-session__step-btn--stop"
            onClick={handleStop}
            type="button"
            title="Stop (Shift+F5)"
            aria-label="Stop"
          >
            <BoxIcon name="bx-stop" size={16} />
          </button>
        </div>

        <div
          className={
            'debugger-session__debug-status debugger-session__debug-status--' +
            debugStatus
          }
        >
          {debugStatus}
        </div>

        <button
          className="debugger-session__disconnect-btn"
          onClick={handleDisconnect}
          type="button"
        >
          <BoxIcon name="bx-power-off" size={14} />
          Disconnect
        </button>
      </div>

      {/* Main panels */}
      <div className="debugger-session__panels">
        {/* Left panel: Source + Breakpoints */}
        <div className="debugger-session__left-panel">
          {/* Source viewer */}
          <div className="debugger-session__source-panel">
            {source && (
              <div className="debugger-session__source-file">
                <BoxIcon name="bx-file" size={12} />
                {source.file}
              </div>
            )}

            <div className="debugger-session__source-viewer">
              {source ? (
                <pre className="debugger-session__source-code">
                  {source.lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isCurrent = lineNum === currentLine;
                    const hasBp = breakpoints.some(
                      (bp) =>
                        bp.file === source.file && bp.line === lineNum,
                    );

                    return (
                      <div
                        key={lineNum}
                        className={
                          'debugger-session__source-line' +
                          (isCurrent
                            ? ' debugger-session__source-line--current'
                            : '')
                        }
                      >
                        <span
                          className="debugger-session__gutter"
                          onClick={() => toggleBreakpoint(lineNum)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              toggleBreakpoint(lineNum);
                          }}
                          aria-label={`Toggle breakpoint at line ${lineNum}`}
                        >
                          {hasBp && (
                            <span className="debugger-session__bp-marker" />
                          )}
                          <span className="debugger-session__line-num">
                            {lineNum}
                          </span>
                        </span>
                        <code className="debugger-session__line-text">
                          {line}
                        </code>
                      </div>
                    );
                  })}
                </pre>
              ) : (
                <div className="debugger-session__source-empty">
                  No source loaded. Start debugging to view source code.
                </div>
              )}
            </div>
          </div>

          {/* Breakpoints list */}
          <div className="debugger-session__breakpoints-panel">
            <div className="debugger-session__panel-header">
              <BoxIcon name="bx-bullseye" size={12} />
              Breakpoints ({breakpoints.length})
            </div>
            <div className="debugger-session__breakpoints-list">
              {breakpoints.length === 0 && (
                <div className="debugger-session__breakpoints-empty">
                  Click the gutter to set breakpoints.
                </div>
              )}
              {breakpoints.map((bp) => (
                <div
                  key={`${bp.file}:${bp.line}`}
                  className="debugger-session__bp-row"
                >
                  <span className="debugger-session__bp-marker debugger-session__bp-marker--inline" />
                  <span className="debugger-session__bp-location">
                    {bp.file}:{bp.line}
                  </span>
                  <button
                    className="debugger-session__bp-remove"
                    onClick={() => removeBreakpoint(bp)}
                    type="button"
                    title="Remove breakpoint"
                    aria-label={`Remove breakpoint at ${bp.file}:${bp.line}`}
                  >
                    <BoxIcon name="bx-x" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Variables / Call Stack / Watch */}
        <div className="debugger-session__right-panel">
          <div className="debugger-session__right-tabs">
            <button
              className={
                'debugger-session__tab-btn' +
                (rightTab === 'variables'
                  ? ' debugger-session__tab-btn--active'
                  : '')
              }
              onClick={() => setRightTab('variables')}
              type="button"
            >
              Variables
            </button>
            <button
              className={
                'debugger-session__tab-btn' +
                (rightTab === 'callstack'
                  ? ' debugger-session__tab-btn--active'
                  : '')
              }
              onClick={() => setRightTab('callstack')}
              type="button"
            >
              Call Stack
            </button>
            <button
              className={
                'debugger-session__tab-btn' +
                (rightTab === 'watch'
                  ? ' debugger-session__tab-btn--active'
                  : '')
              }
              onClick={() => setRightTab('watch')}
              type="button"
            >
              Watch
            </button>
          </div>

          <div className="debugger-session__right-content">
            {/* Variables tab */}
            {rightTab === 'variables' && (
              <div className="debugger-session__variables">
                {variables.length === 0 ? (
                  <div className="debugger-session__tab-empty">
                    {isPaused
                      ? 'No variables in current scope.'
                      : 'Pause execution to inspect variables.'}
                  </div>
                ) : (
                  <div className="debugger-session__var-tree">
                    {variables.map((v, i) =>
                      renderVariable(v, `${v.name}.${i}`, 0),
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Call Stack tab */}
            {rightTab === 'callstack' && (
              <div className="debugger-session__callstack">
                {stackFrames.length === 0 ? (
                  <div className="debugger-session__tab-empty">
                    {isPaused
                      ? 'No stack frames available.'
                      : 'Pause execution to view call stack.'}
                  </div>
                ) : (
                  <div className="debugger-session__frame-list">
                    {stackFrames.map((frame) => (
                      <div
                        key={frame.id}
                        className={
                          'debugger-session__frame-row' +
                          (frame.id === activeFrameId
                            ? ' debugger-session__frame-row--active'
                            : '')
                        }
                        onClick={() => handleFrameClick(frame)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFrameClick(frame);
                        }}
                      >
                        <span className="debugger-session__frame-name">
                          {frame.name}
                        </span>
                        <span className="debugger-session__frame-location">
                          {frame.file}:{frame.line}:{frame.column}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Watch tab */}
            {rightTab === 'watch' && (
              <div className="debugger-session__watch">
                <form
                  className="debugger-session__watch-form"
                  onSubmit={handleAddWatch}
                >
                  <input
                    className="debugger-session__watch-input"
                    type="text"
                    value={watchInput}
                    onChange={(e) => setWatchInput(e.target.value)}
                    placeholder="Add watch expression..."
                    aria-label="Watch expression"
                  />
                  <button
                    className="debugger-session__watch-add-btn"
                    type="submit"
                    title="Add watch"
                    aria-label="Add watch expression"
                  >
                    <BoxIcon name="bx-plus" size={16} />
                  </button>
                </form>

                <div className="debugger-session__watch-list">
                  {watches.length === 0 && (
                    <div className="debugger-session__tab-empty">
                      Add expressions to watch their values.
                    </div>
                  )}
                  {watches.map((w) => (
                    <div
                      key={w.expression}
                      className="debugger-session__watch-row"
                    >
                      <span className="debugger-session__watch-expr">
                        {w.expression}
                      </span>
                      <span className="debugger-session__watch-value">
                        {w.value}
                      </span>
                      <button
                        className="debugger-session__watch-remove"
                        onClick={() => removeWatch(w.expression)}
                        type="button"
                        title="Remove watch"
                        aria-label={`Remove watch ${w.expression}`}
                      >
                        <BoxIcon name="bx-x" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output panel */}
      {outputLines.length > 0 && (
        <div className="debugger-session__output">
          <div className="debugger-session__panel-header">
            <BoxIcon name="bx-terminal" size={12} />
            Output
          </div>
          <pre className="debugger-session__output-text">
            {outputLines.join('\n')}
          </pre>
        </div>
      )}

      {/* Status bar */}
      <div className="debugger-session__status">
        <span className={statusDotClass} />
        <span className="debugger-session__status-adapter">
          {ADAPTER_LABELS[adapter]}
        </span>
        <span className="debugger-session__status-state">
          {isConnecting ? 'Connecting...' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
