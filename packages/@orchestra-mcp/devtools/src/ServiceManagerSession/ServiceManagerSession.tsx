import React, { useCallback, useState } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './ServiceManagerSession.css';

/** A single service entry from the backend. */
interface ServiceInfo {
  name: string;
  status: 'running' | 'stopped' | 'unknown';
  version?: string;
  port?: number;
  pid?: number;
}

/** A predefined development stack template. */
interface StackTemplate {
  name: string;
  description: string;
  services: string[];
}

/** Stack installation progress. */
interface StackProgress {
  name: string;
  current: number;
  total: number;
}

/** Messages sent to the backend. */
type WsOutMessage =
  | { msgType: 'list' }
  | { msgType: 'start'; name: string }
  | { msgType: 'stop'; name: string }
  | { msgType: 'install'; name: string }
  | { msgType: 'get_stacks' }
  | { msgType: 'install_stack'; name: string };

/** Messages received from the backend (envelope: {msgType, data}). */
interface WsInMessage {
  msgType: string;
  data: any;
}

/**
 * ServiceManagerSession manages local development services and stack
 * templates over a WebSocket connection. Supports starting, stopping,
 * restarting, and installing individual services or full stacks.
 */
export const ServiceManagerSession: React.FC<SessionContentProps> = (props) => {
  const { session } = props;

  // Service list state
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loadingServices, setLoadingServices] = useState<Set<string>>(
    new Set(),
  );

  // Stack templates state
  const [showStacks, setShowStacks] = useState(false);
  const [stacks, setStacks] = useState<StackTemplate[]>([]);
  const [stackProgress, setStackProgress] = useState<StackProgress | null>(
    null,
  );

  // Error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Handle incoming WebSocket messages ────────────────────────
  const handleMessage = useCallback(
    (data: unknown) => {
      const msg = data as WsInMessage;

      if (msg.msgType === 'list') {
        const services = msg.data as ServiceInfo[];
        setServices(services ?? []);
        setLoadingServices(new Set());
      } else if (msg.msgType === 'start' || msg.msgType === 'stop') {
        // After start/stop, refresh the list
        send({ msgType: 'list' } as WsOutMessage);
      } else if (msg.msgType === 'install') {
        send({ msgType: 'list' } as WsOutMessage);
      } else if (msg.msgType === 'get_stacks') {
        setStacks(msg.data ?? []);
      } else if (msg.msgType === 'install_stack') {
        // Stack installed, refresh service list
        send({ msgType: 'list' } as WsOutMessage);
      } else if (msg.msgType === 'error') {
        setErrorMsg(typeof msg.data === 'string' ? msg.data : 'Unknown error');
        setTimeout(() => setErrorMsg(null), 5000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { connect, disconnect, send } = useSessionWorker(props, {
    sessionType: 'services',
    onMessage: handleMessage,
  });

  // ── Connect to service manager backend ────────────────────────
  const handleConnect = useCallback(() => {
    connect();
    // After the hook fires onConnect and the WS opens, we request the
    // service list. A small delay ensures the WS is open.
    setTimeout(() => {
      send({ msgType: 'list' } as WsOutMessage);
    }, 100);
  }, [connect, send]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    disconnect();
    setServices([]);
    setStacks([]);
    setShowStacks(false);
    setStackProgress(null);
  }, [disconnect]);

  // ── Refresh service list ──────────────────────────────────────
  const handleRefresh = useCallback(() => {
    send({ msgType: 'list' } as WsOutMessage);
  }, [send]);

  // ── Toggle stacks panel ───────────────────────────────────────
  const handleToggleStacks = useCallback(() => {
    setShowStacks((prev) => {
      const next = !prev;
      if (next && stacks.length === 0) {
        send({ msgType: 'get_stacks' } as WsOutMessage);
      }
      return next;
    });
  }, [stacks.length, send]);

  // ── Start a service ───────────────────────────────────────────
  const handleStart = useCallback(
    (name: string) => {
      setLoadingServices((prev) => new Set(prev).add(name));
      send({ msgType: 'start', data: { name } });
    },
    [send],
  );

  // ── Stop a service ────────────────────────────────────────────
  const handleStop = useCallback(
    (name: string) => {
      setLoadingServices((prev) => new Set(prev).add(name));
      send({ msgType: 'stop', data: { name } });
    },
    [send],
  );

  // ── Restart a service (stop then start) ───────────────────────
  const handleRestart = useCallback(
    (name: string) => {
      setLoadingServices((prev) => new Set(prev).add(name));
      send({ msgType: 'stop', data: { name } });
      setTimeout(() => {
        send({ msgType: 'start', data: { name } });
      }, 500);
    },
    [send],
  );

  // ── Install a service ─────────────────────────────────────────
  const handleInstall = useCallback(
    (name: string) => {
      setLoadingServices((prev) => new Set(prev).add(name));
      send({ msgType: 'install', data: { name } });
    },
    [send],
  );

  // ── Install a stack ───────────────────────────────────────────
  const handleInstallStack = useCallback(
    (name: string) => {
      setStackProgress({ name, current: 0, total: 1 });
      send({ msgType: 'install_stack', data: { name } });
    },
    [send],
  );

  // ── Status dot class helper ───────────────────────────────────
  const statusDotClass = [
    'service-manager-session__status-dot',
    isConnected
      ? 'service-manager-session__status-dot--connected'
      : isConnecting
        ? 'service-manager-session__status-dot--connecting'
        : session.state === 'error'
          ? 'service-manager-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Derived counts ────────────────────────────────────────────
  const runningCount = services.filter((s) => s.status === 'running').length;

  // ── Render: disconnected state ────────────────────────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="service-manager-session">
        <div className="service-manager-session__connection-form">
          <h3 className="service-manager-session__form-title">
            Service Manager
          </h3>
          <p className="service-manager-session__form-desc">
            Manage local development services, stacks, and processes.
          </p>

          <button
            className="service-manager-session__connect-btn"
            onClick={handleConnect}
            type="button"
          >
            Connect
          </button>
        </div>

        {session.state === 'error' && (
          <div className="service-manager-session__error">
            Connection failed. Ensure the dev server is running and try again.
          </div>
        )}

        <div className="service-manager-session__status">
          <span className={statusDotClass} />
          <span>
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: connected service manager ─────────────────────────
  return (
    <div className="service-manager-session">
      {/* Toolbar */}
      <div className="service-manager-session__toolbar">
        <h3 className="service-manager-session__toolbar-title">Services</h3>

        <button
          className="service-manager-session__action-btn"
          onClick={handleRefresh}
          type="button"
          title="Refresh service list"
        >
          <BoxIcon name="bx-refresh" size={14} />
          Refresh
        </button>

        <button
          className={
            'service-manager-session__action-btn' +
            (showStacks ? ' service-manager-session__action-btn--active' : '')
          }
          onClick={handleToggleStacks}
          type="button"
          title="Toggle stack templates"
        >
          <BoxIcon name="bx-layer" size={14} />
          Stacks
        </button>

        <button
          className="service-manager-session__disconnect-btn"
          onClick={handleDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="service-manager-session__error-banner">
          {errorMsg}
        </div>
      )}

      {/* Stack templates panel (toggled) */}
      {showStacks && (
        <div className="service-manager-session__stacks">
          <div className="service-manager-session__stacks-header">
            <h4 className="service-manager-session__stacks-title">
              Stack Templates
            </h4>
          </div>

          {stacks.length === 0 && (
            <div className="service-manager-session__stacks-empty">
              Loading stacks...
            </div>
          )}

          <div className="service-manager-session__stacks-grid">
            {stacks.map((stack) => {
              const isInstalling =
                stackProgress !== null && stackProgress.name === stack.name;

              return (
                <div
                  key={stack.name}
                  className="service-manager-session__stack-card"
                >
                  <div className="service-manager-session__stack-name">
                    {stack.name}
                  </div>
                  <div className="service-manager-session__stack-desc">
                    {stack.description}
                  </div>
                  <div className="service-manager-session__stack-services">
                    {stack.services.map((svc) => (
                      <span
                        key={svc}
                        className="service-manager-session__stack-service-tag"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>

                  {isInstalling ? (
                    <div className="service-manager-session__stack-progress">
                      <div className="service-manager-session__stack-progress-bar">
                        <div
                          className="service-manager-session__stack-progress-fill"
                          style={{
                            width: `${Math.round(
                              (stackProgress.current / stackProgress.total) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="service-manager-session__stack-progress-text">
                        {stackProgress.current}/{stackProgress.total}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="service-manager-session__stack-install-btn"
                      onClick={() => handleInstallStack(stack.name)}
                      type="button"
                    >
                      <BoxIcon name="bx-download" size={12} />
                      Install Stack
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Service list */}
      <div className="service-manager-session__list">
        {services.length === 0 && (
          <div className="service-manager-session__empty">
            No services detected. Install a stack or add services manually.
          </div>
        )}

        {services.map((service) => {
          const isLoading = loadingServices.has(service.name);
          const isRunning = service.status === 'running';
          const isStopped = service.status === 'stopped';

          return (
            <div key={service.name} className="service-manager-session__row">
              <span
                className={
                  'service-manager-session__svc-dot' +
                  ` service-manager-session__svc-dot--${service.status}`
                }
              />

              <div className="service-manager-session__svc-info">
                <span className="service-manager-session__svc-name">
                  {service.name}
                </span>
                {service.version && (
                  <span className="service-manager-session__svc-version">
                    v{service.version}
                  </span>
                )}
              </div>

              <div className="service-manager-session__svc-meta">
                {service.port && (
                  <span className="service-manager-session__svc-port">
                    :{service.port}
                  </span>
                )}
                {service.pid && (
                  <span className="service-manager-session__svc-pid">
                    PID {service.pid}
                  </span>
                )}
              </div>

              <div className="service-manager-session__svc-actions">
                {isLoading ? (
                  <span className="service-manager-session__spinner" />
                ) : (
                  <>
                    {isRunning ? (
                      <button
                        className="service-manager-session__svc-btn service-manager-session__svc-btn--stop"
                        onClick={() => handleStop(service.name)}
                        type="button"
                        title="Stop service"
                      >
                        <BoxIcon name="bx-stop" size={12} />
                        Stop
                      </button>
                    ) : isStopped ? (
                      <button
                        className="service-manager-session__svc-btn service-manager-session__svc-btn--start"
                        onClick={() => handleStart(service.name)}
                        type="button"
                        title="Start service"
                      >
                        <BoxIcon name="bx-play" size={12} />
                        Start
                      </button>
                    ) : (
                      <button
                        className="service-manager-session__svc-btn service-manager-session__svc-btn--install"
                        onClick={() => handleInstall(service.name)}
                        type="button"
                        title="Install service"
                      >
                        <BoxIcon name="bx-download" size={12} />
                        Install
                      </button>
                    )}

                    {(isRunning || isStopped) && (
                      <button
                        className="service-manager-session__svc-btn service-manager-session__svc-btn--restart"
                        onClick={() => handleRestart(service.name)}
                        type="button"
                        title="Restart service"
                      >
                        <BoxIcon name="bx-refresh" size={12} />
                        Restart
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="service-manager-session__status">
        <span className={statusDotClass} />
        <span className="service-manager-session__status-count">
          {runningCount}/{services.length} running
        </span>
        <span className="service-manager-session__status-state">
          {isConnecting ? 'Connecting...' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
