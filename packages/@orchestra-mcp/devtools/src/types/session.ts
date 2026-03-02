export type SessionType =
  | 'file-explorer'
  | 'database'
  | 'ssh'
  | 'cloud'
  | 'logs'
  | 'testing'
  | 'terminal'
  | 'services'
  | 'debugger';

export type SessionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface DevSession {
  id: string;
  name: string;
  type: SessionType;
  icon: string;
  color?: string;
  state: SessionState;
  provider?: string;
  connectionConfig?: Record<string, unknown>;
  sessionData?: Record<string, unknown>;
  sortOrder: number;
  lastUsedAt?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface SessionProviderDef {
  type: SessionType;
  name: string;
  icon: string;
  description: string;
  order: number;
  component: React.ComponentType<SessionContentProps>;
}

export interface SessionContentProps {
  session: DevSession;
  onUpdateState: (data: Record<string, unknown>) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}
