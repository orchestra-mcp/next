// @orchestra-mcp/devtools — Session-based developer tools sidebar

// Types
export type {
  SessionType,
  SessionState,
  DevSession,
  SessionProviderDef,
  SessionContentProps,
} from './types';

// Registry
export {
  registerSessionType,
  getSessionProvider,
  getAllProviders,
} from './registry/SessionRegistry';

// Store
export { useDevToolsStore } from './stores/useDevToolsStore';

// Worker Service (background WebSocket connections)
export { DevToolsWorkerService, buildWsUrl } from './workers/DevToolsWorkerService';
export type { WsState, WorkerConnection } from './workers/DevToolsWorkerService';

// Hooks
export { useSessionWorker } from './hooks/useSessionWorker';

// Components
export { DevToolsSidebar } from './DevToolsSidebar';
export type { DevToolsSidebarProps } from './DevToolsSidebar';

export { DevToolsSessionSidebar } from './DevToolsSessionSidebar';
export type { DevToolsSessionSidebarProps } from './DevToolsSessionSidebar';

export { NewSessionPicker } from './NewSessionPicker';
export type { NewSessionPickerProps } from './NewSessionPicker';

export { SessionContent } from './SessionContent';
export type { SessionContentProps as SessionContentComponentProps } from './SessionContent';

// Session Providers (self-registering side-effect imports)
export { TerminalSession } from './TerminalSession';
export { DatabaseSession } from './DatabaseSession';
export { SSHSession } from './SSHSession';
export { LogViewerSession } from './LogViewerSession';
export { FileExplorerSession } from './FileExplorerSession';
export { ServiceManagerSession } from './ServiceManagerSession';
export { DebuggerSession } from './DebuggerSession';
export { TestingSession } from './TestingSession';
export { CloudSession } from './CloudSession';

// Playwright Bridge (pure TypeScript — not a React component)
export { PlaywrightBridge } from './PlaywrightBridge';
export type { BrowserCommand, BrowserResult, BrowserAction } from './PlaywrightBridge';
export {
  navigateAction,
  queryAction,
  clickAction,
  typeAction,
  screenshotAction,
  evaluateAction,
  waitAction,
  interceptAction,
} from './PlaywrightBridge';
