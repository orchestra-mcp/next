import React, { useCallback, useState } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { useSessionWorker } from '../hooks/useSessionWorker';
import type { SessionContentProps } from '../types';
import './CloudSession.css';

/** Supported cloud providers. */
const PROVIDERS = [
  'aws',
  'gcp',
  'azure',
  'laravel-cloud',
  'vercel',
  'fly',
  'railway',
  'render',
  'digitalocean',
  'cloudflare',
] as const;
type Provider = (typeof PROVIDERS)[number];

/** Display labels for each provider. */
const PROVIDER_LABELS: Record<Provider, string> = {
  aws: 'AWS',
  gcp: 'Google Cloud',
  azure: 'Azure',
  'laravel-cloud': 'Laravel Cloud',
  vercel: 'Vercel',
  fly: 'Fly.io',
  railway: 'Railway',
  render: 'Render',
  digitalocean: 'DigitalOcean',
  cloudflare: 'Cloudflare',
};

/** Boxicon names for each provider. */
const PROVIDER_ICONS: Record<Provider, string> = {
  aws: 'bxl-aws',
  gcp: 'bxl-google-cloud',
  azure: 'bxl-microsoft',
  'laravel-cloud': 'bxs-cloud',
  vercel: 'bxl-vercel',
  fly: 'bx-rocket',
  railway: 'bx-train',
  render: 'bx-server',
  digitalocean: 'bxl-digital-ocean',
  cloudflare: 'bx-shield',
};

/** Web console URLs for each provider. */
const CONSOLE_URLS: Record<Provider, string> = {
  aws: 'https://console.aws.amazon.com',
  gcp: 'https://console.cloud.google.com',
  azure: 'https://portal.azure.com',
  'laravel-cloud': 'https://cloud.laravel.com',
  vercel: 'https://vercel.com/dashboard',
  fly: 'https://fly.io/dashboard',
  railway: 'https://railway.app/dashboard',
  render: 'https://dashboard.render.com',
  digitalocean: 'https://cloud.digitalocean.com',
  cloudflare: 'https://dash.cloudflare.com',
};

/** Credential fields per provider (label -> field key). */
const CREDENTIAL_FIELDS: Record<Provider, Array<{ label: string; key: string; multiline?: boolean; placeholder?: string }>> = {
  aws: [
    { label: 'Access Key ID', key: 'access_key_id', placeholder: 'AKIAIOSFODNN7EXAMPLE' },
    { label: 'Secret Access Key', key: 'secret_access_key', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' },
    { label: 'Region', key: 'region', placeholder: 'us-east-1' },
  ],
  gcp: [
    { label: 'Service Account JSON', key: 'service_account_json', multiline: true, placeholder: '{"type":"service_account",...}' },
  ],
  azure: [
    { label: 'Subscription ID', key: 'subscription_id', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
    { label: 'Client ID', key: 'client_id', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
    { label: 'Client Secret', key: 'client_secret', placeholder: '' },
    { label: 'Tenant ID', key: 'tenant_id', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
  ],
  'laravel-cloud': [
    { label: 'API Token', key: 'api_token', placeholder: 'laravel-cloud-token-...' },
  ],
  vercel: [
    { label: 'API Token', key: 'api_token', placeholder: 'vercel-token-...' },
    { label: 'Team ID (optional)', key: 'team_id', placeholder: 'team_...' },
  ],
  fly: [
    { label: 'API Token', key: 'api_token', placeholder: 'fo1_...' },
  ],
  railway: [
    { label: 'API Token', key: 'api_token', placeholder: 'railway-token-...' },
  ],
  render: [
    { label: 'API Key', key: 'api_key', placeholder: 'rnd_...' },
  ],
  digitalocean: [
    { label: 'API Token', key: 'api_token', placeholder: 'dop_v1_...' },
  ],
  cloudflare: [
    { label: 'API Token', key: 'api_token', placeholder: 'cloudflare-token-...' },
    { label: 'Account ID', key: 'account_id', placeholder: '' },
  ],
};

/** A cloud resource returned by the backend. */
interface CloudResource {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'pending' | 'terminated' | 'unknown';
  region: string;
  metadata: Record<string, string>;
}

/** Messages sent to the backend. */
type WsOutMessage =
  | { msgType: 'list_providers' }
  | { msgType: 'connect'; provider: string; config: Record<string, unknown> }
  | { msgType: 'disconnect' }
  | { msgType: 'list_types' }
  | { msgType: 'list_resources'; resource_type: string }
  | { msgType: 'get_resource'; resource_type: string; id: string }
  | { msgType: 'action'; resource_type: string; id: string; action: string };

/** Messages received from the backend (envelope: {msgType, data}). */
interface WsInMessage {
  msgType: string;
  data: any;
}

/**
 * CloudSession renders a multi-cloud resource dashboard with provider
 * selection, resource type tabs, resource listing, and detail inspection.
 */
export const CloudSession: React.FC<SessionContentProps> = (props) => {
  const { session, onUpdateState } = props;

  // Provider state
  const [providers, setProviders] = useState<string[]>(PROVIDERS as unknown as string[]);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    (session.connectionConfig?.provider as string) ?? '',
  );
  const [connectedProvider, setConnectedProvider] = useState<string>('');

  // Resource state
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<string>('');
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [loading, setLoading] = useState(false);

  // Error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Credentials dialog state
  const [credDialogProvider, setCredDialogProvider] = useState<Provider | null>(null);
  const [credValues, setCredValues] = useState<Record<string, string>>({});

  const isConnected = session.state === 'connected';
  const isConnecting = session.state === 'connecting';

  // ── Handle incoming WebSocket messages ────────────────────────
  const handleMessage = useCallback(
    (data: unknown) => {
      const msg = data as WsInMessage;

      if (msg.msgType === 'list_providers') {
        setProviders(msg.data as string[]);
      } else if (msg.msgType === 'connect') {
        const resp = msg.data as { status: string; provider: string };
        setConnectedProvider(resp.provider);
        onUpdateState({
          state: 'connected',
          connectionConfig: { provider: resp.provider },
        });
        setErrorMsg(null);
        send({ msgType: 'list_types' } as WsOutMessage);
      } else if (msg.msgType === 'list_types') {
        const types = msg.data as string[];
        setResourceTypes(types);
        setLoading(false);
        if (types.length > 0) {
          const first = types[0];
          setActiveType(first);
          setLoading(true);
          send({ msgType: 'list_resources', data: { type: first } });
        }
      } else if (msg.msgType === 'list_resources') {
        setResources(msg.data as CloudResource[]);
        setLoading(false);
      } else if (msg.msgType === 'get_resource') {
        setSelectedResource(msg.data as CloudResource);
        setLoading(false);
      } else if (msg.msgType === 'error') {
        setErrorMsg(typeof msg.data === 'string' ? msg.data : 'Unknown error');
        setLoading(false);
        setTimeout(() => setErrorMsg(null), 5000);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { connect, disconnect, send } = useSessionWorker(props, {
    sessionType: 'cloud',
    onMessage: handleMessage,
  });

  // ── Connect to cloud backend ──────────────────────────────────
  const handleConnect = useCallback(() => {
    if (!selectedProvider || selectedProvider === '') {
      setErrorMsg('Please select a cloud provider');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    connect();
    // After connection opens, the hook fires onConnect. We send the
    // provider connect message once the session reaches "connected"
    // via the handleMessage 'connected' path.
    setTimeout(() => {
      send({
        msgType: 'connect',
        data: { provider: selectedProvider, config: {} },
      });
    }, 100);
    onUpdateState({
      connectionConfig: { provider: selectedProvider },
    });
  }, [selectedProvider, connect, send, onUpdateState]);

  // ── Disconnect from provider ──────────────────────────────────
  const handleDisconnect = useCallback(() => {
    send({ msgType: 'disconnect' } as WsOutMessage);
    disconnect();
    setConnectedProvider('');
    setResourceTypes([]);
    setActiveType('');
    setResources([]);
    setSelectedResource(null);
  }, [disconnect, send]);

  // ── Select a resource type tab ────────────────────────────────
  const handleSelectType = useCallback(
    (type: string) => {
      setActiveType(type);
      setSelectedResource(null);
      setLoading(true);
      send({ msgType: 'list_resources', data: { type } });
    },
    [send],
  );

  // ── Select a resource from the list ───────────────────────────
  const handleSelectResource = useCallback(
    (resource: CloudResource) => {
      if (selectedResource?.id === resource.id) {
        setSelectedResource(null);
        return;
      }
      setSelectedResource(resource);
      send({
        msgType: 'get_resource',
        data: { type: resource.type, id: resource.id },
      });
    },
    [selectedResource, send],
  );

  // ── Trigger a resource action ─────────────────────────────────
  const handleAction = useCallback(
    (action: string) => {
      if (!selectedResource || !activeType) return;
      setLoading(true);
      send({
        msgType: 'action',
        data: { type: activeType, id: selectedResource.id, action },
      });
    },
    [selectedResource, activeType, send],
  );

  // ── Provider card click ───────────────────────────────────────
  const handleProviderSelect = useCallback((provider: string) => {
    setSelectedProvider(provider);
  }, []);

  // ── Open provider web console in browser ─────────────────────
  const handleOpenConsole = useCallback(async (provider: string) => {
    const url = CONSOLE_URLS[provider as Provider];
    if (!url) return;
    try {
      await fetch('http://127.0.0.1:19191/api/open-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch {
      // Fallback: open directly in current tab if desktop API unavailable
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // ── Open credentials dialog for a provider ────────────────────
  const handleOpenCredDialog = useCallback((provider: string) => {
    const p = provider as Provider;
    setCredDialogProvider(p);
    // Pre-fill from existing session config
    const existing = session.connectionConfig ?? {};
    const fields = CREDENTIAL_FIELDS[p] ?? [];
    const initial: Record<string, string> = {};
    for (const f of fields) {
      initial[f.key] = (existing[f.key] as string) ?? '';
    }
    setCredValues(initial);
  }, [session.connectionConfig]);

  // ── Save credentials from dialog ──────────────────────────────
  const handleSaveCredentials = useCallback(() => {
    if (!credDialogProvider) return;
    onUpdateState({
      connectionConfig: {
        ...session.connectionConfig,
        provider: credDialogProvider,
        ...credValues,
      },
    });
    setCredDialogProvider(null);
    setCredValues({});
  }, [credDialogProvider, credValues, onUpdateState, session.connectionConfig]);

  // ── Close credentials dialog ──────────────────────────────────
  const handleCloseCredDialog = useCallback(() => {
    setCredDialogProvider(null);
    setCredValues({});
  }, []);

  // ── Status dot class helper ───────────────────────────────────
  const statusDotClass = [
    'cloud-session__status-dot',
    isConnected
      ? 'cloud-session__status-dot--connected'
      : isConnecting
        ? 'cloud-session__status-dot--connecting'
        : session.state === 'error'
          ? 'cloud-session__status-dot--error'
          : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Status badge class for resource status ────────────────────
  const statusBadgeClass = (status: string): string => {
    return [
      'cloud-session__badge',
      `cloud-session__badge--${status}`,
    ].join(' ');
  };

  // ── Render: disconnected state (provider selector) ────────────
  if (!isConnected && !isConnecting) {
    return (
      <div className="cloud-session">
        <div className="cloud-session__connect-panel">
          <h3 className="cloud-session__form-title">Cloud Dashboard</h3>
          <p className="cloud-session__form-desc">
            Open a provider console or configure credentials.
          </p>

          <div className="cloud-session__provider-grid">
            {providers.map((provider) => {
              const key = provider as Provider;
              const label = PROVIDER_LABELS[key] ?? provider;
              const icon = PROVIDER_ICONS[key] ?? 'bx-cloud';
              const isSelected = selectedProvider === provider;
              const hasConsole = !!CONSOLE_URLS[key];

              return (
                <div
                  key={provider}
                  className={
                    'cloud-session__provider-card' +
                    (isSelected ? ' cloud-session__provider-card--selected' : '')
                  }
                  onClick={() => handleProviderSelect(provider)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${label}`}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProviderSelect(provider); }}
                >
                  <BoxIcon
                    name={icon}
                    size={24}
                    className="cloud-session__provider-icon"
                  />
                  <span className="cloud-session__provider-name">{label}</span>
                  <div className="cloud-session__provider-actions">
                    {hasConsole && (
                      <button
                        className="cloud-session__provider-action-btn cloud-session__provider-action-btn--console"
                        onClick={(e) => { e.stopPropagation(); handleOpenConsole(provider); }}
                        type="button"
                        title={`Open ${label} Console`}
                      >
                        <BoxIcon name="bx-link-external" size={12} />
                        Console
                      </button>
                    )}
                    <button
                      className="cloud-session__provider-action-btn cloud-session__provider-action-btn--creds"
                      onClick={(e) => { e.stopPropagation(); handleOpenCredDialog(provider); }}
                      type="button"
                      title={`Configure ${label} credentials`}
                    >
                      <BoxIcon name="bx-key" size={12} />
                      Credentials
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="cloud-session__connect-btn"
            onClick={handleConnect}
            disabled={!selectedProvider}
            type="button"
          >
            Connect
          </button>
        </div>

        {/* Credentials dialog */}
        {credDialogProvider && (
          <div className="cloud-session__cred-overlay" onClick={handleCloseCredDialog}>
            <div
              className="cloud-session__cred-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cloud-session__cred-header">
                <span className="cloud-session__cred-title">
                  {PROVIDER_LABELS[credDialogProvider]} Credentials
                </span>
                <button
                  className="cloud-session__cred-close"
                  onClick={handleCloseCredDialog}
                  type="button"
                  aria-label="Close"
                >
                  <BoxIcon name="bx-x" size={16} />
                </button>
              </div>

              <div className="cloud-session__cred-body">
                {(CREDENTIAL_FIELDS[credDialogProvider] ?? []).map((field) => (
                  <div key={field.key} className="cloud-session__cred-field">
                    <label className="cloud-session__cred-label">{field.label}</label>
                    {field.multiline ? (
                      <textarea
                        className="cloud-session__cred-input cloud-session__cred-input--textarea"
                        value={credValues[field.key] ?? ''}
                        onChange={(e) =>
                          setCredValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder ?? ''}
                        rows={5}
                        spellCheck={false}
                      />
                    ) : (
                      <input
                        className="cloud-session__cred-input"
                        type={field.key.includes('secret') || field.key.includes('key') || field.key.includes('token') ? 'password' : 'text'}
                        value={credValues[field.key] ?? ''}
                        onChange={(e) =>
                          setCredValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder ?? ''}
                        autoComplete="off"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="cloud-session__cred-footer">
                {CONSOLE_URLS[credDialogProvider] && (
                  <button
                    className="cloud-session__cred-console-btn"
                    onClick={() => handleOpenConsole(credDialogProvider)}
                    type="button"
                  >
                    <BoxIcon name="bx-link-external" size={13} />
                    Open Console
                  </button>
                )}
                <div className="cloud-session__cred-footer-spacer" />
                <button
                  className="cloud-session__cred-cancel-btn"
                  onClick={handleCloseCredDialog}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="cloud-session__cred-save-btn"
                  onClick={handleSaveCredentials}
                  type="button"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {session.state === 'error' && (
          <div className="cloud-session__error">
            Connection failed. Check your credentials and try again.
          </div>
        )}

        <div className="cloud-session__status">
          <span className={statusDotClass} />
          <span>
            {session.state === 'error' ? 'Connection error' : 'Disconnected'}
          </span>
        </div>
      </div>
    );
  }

  // ── Render: connected state ───────────────────────────────────
  const providerLabel =
    PROVIDER_LABELS[connectedProvider as Provider] ?? connectedProvider;
  const resourceCount = resources.length;

  return (
    <div className="cloud-session">
      {/* Provider header */}
      <div className="cloud-session__toolbar">
        <span className="cloud-session__toolbar-provider">
          {providerLabel}
        </span>

        {activeType && (
          <span className="cloud-session__toolbar-region">
            {activeType}
          </span>
        )}

        <div className="cloud-session__toolbar-spacer" />

        {CONSOLE_URLS[connectedProvider as Provider] && (
          <button
            className="cloud-session__action-btn cloud-session__action-btn--console"
            onClick={() => handleOpenConsole(connectedProvider)}
            type="button"
            title="Open provider web console"
          >
            <BoxIcon name="bx-link-external" size={13} />
            Console
          </button>
        )}

        <button
          className="cloud-session__disconnect-btn"
          onClick={handleDisconnect}
          type="button"
        >
          Disconnect
        </button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="cloud-session__error-banner">{errorMsg}</div>
      )}

      {/* Resource type tabs */}
      {resourceTypes.length > 0 && (
        <div className="cloud-session__tabs">
          {resourceTypes.map((type) => (
            <button
              key={type}
              className={
                'cloud-session__tab' +
                (activeType === type ? ' cloud-session__tab--active' : '')
              }
              onClick={() => handleSelectType(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Body: resource list + detail panel */}
      <div className="cloud-session__body">
        {/* Resource list */}
        <div className="cloud-session__list">
          {loading && resources.length === 0 && (
            <div className="cloud-session__empty">
              <span className="cloud-session__spinner" />
              Loading resources...
            </div>
          )}

          {!loading && resources.length === 0 && (
            <div className="cloud-session__empty">
              No resources found for this type.
            </div>
          )}

          {resources.length > 0 && (
            <table className="cloud-session__table">
              <thead>
                <tr>
                  <th className="cloud-session__th">Name</th>
                  <th className="cloud-session__th">ID</th>
                  <th className="cloud-session__th">Status</th>
                  <th className="cloud-session__th">Type</th>
                  <th className="cloud-session__th">Region</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => {
                  const isSelected = selectedResource?.id === resource.id;

                  return (
                    <tr
                      key={resource.id}
                      className={
                        'cloud-session__row' +
                        (isSelected ? ' cloud-session__row--selected' : '')
                      }
                      onClick={() => handleSelectResource(resource)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectResource(resource);
                      }}
                    >
                      <td className="cloud-session__td cloud-session__td--name">
                        {resource.name}
                      </td>
                      <td className="cloud-session__td cloud-session__td--id">
                        {resource.id}
                      </td>
                      <td className="cloud-session__td">
                        <span className={statusBadgeClass(resource.status)}>
                          {resource.status}
                        </span>
                      </td>
                      <td className="cloud-session__td">{resource.type}</td>
                      <td className="cloud-session__td">{resource.region}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Resource detail panel */}
        {selectedResource && (
          <div className="cloud-session__detail">
            <div className="cloud-session__detail-header">
              <h4 className="cloud-session__detail-title">
                {selectedResource.name}
              </h4>
              <span className={statusBadgeClass(selectedResource.status)}>
                {selectedResource.status}
              </span>
            </div>

            <dl className="cloud-session__detail-meta">
              <div className="cloud-session__detail-row">
                <dt className="cloud-session__detail-key">ID</dt>
                <dd className="cloud-session__detail-value">
                  {selectedResource.id}
                </dd>
              </div>
              <div className="cloud-session__detail-row">
                <dt className="cloud-session__detail-key">Type</dt>
                <dd className="cloud-session__detail-value">
                  {selectedResource.type}
                </dd>
              </div>
              <div className="cloud-session__detail-row">
                <dt className="cloud-session__detail-key">Region</dt>
                <dd className="cloud-session__detail-value">
                  {selectedResource.region}
                </dd>
              </div>

              {Object.entries(selectedResource.metadata).map(([key, value]) => (
                <div key={key} className="cloud-session__detail-row">
                  <dt className="cloud-session__detail-key">{key}</dt>
                  <dd className="cloud-session__detail-value">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="cloud-session__detail-actions">
              <button
                className="cloud-session__action-btn cloud-session__action-btn--start"
                onClick={() => handleAction('start')}
                type="button"
                disabled={selectedResource.status === 'running'}
              >
                <BoxIcon name="bx-play" size={14} />
                Start
              </button>
              <button
                className="cloud-session__action-btn cloud-session__action-btn--stop"
                onClick={() => handleAction('stop')}
                type="button"
                disabled={selectedResource.status === 'stopped'}
              >
                <BoxIcon name="bx-stop" size={14} />
                Stop
              </button>
              <button
                className="cloud-session__action-btn cloud-session__action-btn--restart"
                onClick={() => handleAction('restart')}
                type="button"
              >
                <BoxIcon name="bx-refresh" size={14} />
                Restart
              </button>
              <button
                className="cloud-session__action-btn cloud-session__action-btn--delete"
                onClick={() => handleAction('delete')}
                type="button"
              >
                <BoxIcon name="bx-trash" size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="cloud-session__status">
        <span className={statusDotClass} />
        <span className="cloud-session__status-provider">
          {providerLabel}
        </span>
        <span className="cloud-session__status-count">
          {resourceCount} resource{resourceCount !== 1 ? 's' : ''}
        </span>
        <span className="cloud-session__status-state">
          {isConnecting ? 'Connecting...' : 'Connected'}
        </span>
      </div>
    </div>
  );
};
