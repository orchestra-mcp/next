export type ClaudeCodeEventType =
  | 'bash'
  | 'grep'
  | 'read'
  | 'glob'
  | 'task'
  | 'todo_list'
  | 'mcp'
  | 'orchestra'
  | 'edit'
  | 'create'
  | 'sub_agent'
  | 'plan'
  | 'web_search'
  | 'web_fetch'
  | 'skill'
  | 'agent_switch'
  | 'gate'
  | 'terminal'
  | 'mcp_routed'
  | 'preview'
  | 'permission'
  | 'question';

export interface BaseEvent {
  id: string;
  type: ClaudeCodeEventType;
  timestamp?: string;
  toolUseId?: string;
  status?: string;
}

/** Status values used by card glow effect */
export type CardStatus = 'running' | 'done';

export type CardCategory =
  | 'file'
  | 'mcp'
  | 'terminal'
  | 'search'
  | 'web'
  | 'gate'
  | 'todo'
  | 'subagent'
  | 'skill'
  | 'agent'
  | 'plan'
  | 'orchestra'
  | 'preview'
  | 'permission';

export interface BashEvent extends BaseEvent {
  type: 'bash';
  command: string;
  description?: string;
  output?: string;
  exitCode?: number;
  cwd?: string;
}

export interface GrepMatch {
  file: string;
  line: number;
  content: string;
  context?: string[];
}

export interface GrepEvent extends BaseEvent {
  type: 'grep';
  pattern: string;
  filePattern?: string;
  path?: string;
  matches: GrepMatch[];
  resultText?: string;
  totalMatches?: number;
}

export interface TaskEvent extends BaseEvent {
  type: 'task';
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
}

export interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TodoListEvent extends BaseEvent {
  type: 'todo_list';
  items: TodoItem[];
}

export interface McpEvent extends BaseEvent {
  type: 'mcp';
  toolName: string;
  serverName?: string;
  arguments?: Record<string, unknown>;
  result?: string;
  resultText?: string;
}

export interface OrchestraEvent extends BaseEvent {
  type: 'orchestra';
  issueType: 'epic' | 'story' | 'task' | 'bug' | 'hotfix';
  issueId: string;
  title: string;
  status?: string;
  priority?: string;
  description?: string;
}

export interface EditEvent extends BaseEvent {
  type: 'edit';
  filePath: string;
  language?: string;
  description?: string;
  original: string;
  modified: string;
}

export interface CreateEvent extends BaseEvent {
  type: 'create';
  filePath: string;
  language?: string;
  content: string;
}

export interface ReadEvent extends BaseEvent {
  type: 'read';
  filePath: string;
  content?: string;
  lineCount?: number;
  offset?: number;
  limit?: number;
}

export interface GlobEvent extends BaseEvent {
  type: 'glob';
  pattern: string;
  path?: string;
  matches?: string[];
  totalMatches?: number;
}

export interface SubAgentActivity {
  tool: string;
  summary?: string;
  status: 'running' | 'done' | 'error';
  timestamp?: string;
}

export interface SubAgentEvent extends BaseEvent {
  type: 'sub_agent';
  agentType: string;
  description: string;
  prompt?: string;
  agentId?: string;
  /** Live activity log entries (tool calls as they happen). */
  activities?: SubAgentActivity[];
  /** Duration string (e.g. "12s", "1m 23s"). */
  duration?: string;
}

export interface PlanEvent extends BaseEvent {
  type: 'plan';
  content: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
}

export interface WebSearchEvent extends BaseEvent {
  type: 'web_search';
  query: string;
  results: WebSearchResult[];
  totalResults?: number;
}

export interface WebFetchEvent extends BaseEvent {
  type: 'web_fetch';
  url: string;
  title?: string;
  content?: string;
  summary?: string;
}

export interface SkillEvent extends BaseEvent {
  type: 'skill';
  skillName: string;
  description?: string;
  technologies?: string[];
  trigger?: 'auto' | 'command';
}

export interface AgentSwitchEvent extends BaseEvent {
  type: 'agent_switch';
  agentName: string;
  agentType: string;
  role?: string;
  capabilities?: string[];
  reason?: string;
}

export interface GateEvent extends BaseEvent {
  type: 'gate';
  taskId: string;
  taskTitle?: string;
  fromState: string;
  toState: string;
  gateNumber?: number;
  evidence?: string;
  approved?: boolean;
}

export interface TerminalEvent extends BaseEvent {
  type: 'terminal';
  command: string;
  output?: string;
  exitCode?: number;
  cwd?: string;
  isBackground?: boolean;
  sessionId?: string;
  isRunning?: boolean;
}

export interface McpRoutedEvent extends BaseEvent {
  type: 'mcp_routed';
  toolName: string;
  serverName?: string;
  arguments?: Record<string, unknown>;
  parsedResult?: unknown;
  cardType?: string;
}

/** Inline code payload type for preview events (mirrors PreviewCode from Preview module). */
export interface PreviewCodePayload {
  html?: string;
  css?: string;
  js?: string;
  jsx?: string;
  framework: 'html' | 'react' | 'vue' | 'svelte' | 'angular' | 'react-native' | 'flutter';
}

export interface PreviewEvent extends BaseEvent {
  type: 'preview';
  sessionId: string;
  framework: string;
  wsUrl: string;
  code?: PreviewCodePayload;
}

export interface PermissionEvent extends BaseEvent {
  type: 'permission';
  requestId: string;
  toolName: string;
  toolInput?: string;
  reason?: string;
  /** Set when the user responds (null while pending). */
  decision?: 'approved' | 'denied';
}

export interface QuestionOption {
  label: string;
  description?: string;
}

export interface QuestionItem {
  question: string;
  header?: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export interface QuestionEvent extends BaseEvent {
  type: 'question';
  requestId: string;
  questions: QuestionItem[];
  /** Answers selected/submitted by the user (null while pending). */
  answers?: Record<string, string>;
}

export type ClaudeCodeEvent =
  | BashEvent
  | GrepEvent
  | ReadEvent
  | GlobEvent
  | TaskEvent
  | TodoListEvent
  | McpEvent
  | OrchestraEvent
  | EditEvent
  | CreateEvent
  | SubAgentEvent
  | PlanEvent
  | WebSearchEvent
  | WebFetchEvent
  | SkillEvent
  | AgentSwitchEvent
  | GateEvent
  | TerminalEvent
  | McpRoutedEvent
  | PreviewEvent
  | PermissionEvent
  | QuestionEvent;
