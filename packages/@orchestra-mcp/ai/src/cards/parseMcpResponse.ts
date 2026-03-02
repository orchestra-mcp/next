// ---------------------------------------------------------------------------
// parseMcpResponse.ts
// Parses raw MCP tool_response JSON strings into typed result objects so that
// Orchestra AI Cards can render structured data instead of raw JSON.
// ---------------------------------------------------------------------------

// ---- Individual result shapes ------------------------------------------------

/** A single task returned by get_task, create_task, advance_task, etc. */
export interface McpTaskResult {
  id: string;
  title: string;
  type: 'task' | 'bug' | 'hotfix';
  status: string;
  priority?: string;
  description?: string;
  estimate?: number;
  assignee?: string;
  labels?: string[];
  depends_on?: string[];
  evidence?: Array<{ gate: string; description: string; timestamp: string }>;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

/** An epic returned by get_epic, create_epic, etc. */
export interface McpEpicResult {
  id: string;
  title: string;
  type: 'epic';
  status: string;
  priority?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/** A story returned by get_story, create_story, etc. */
export interface McpStoryResult {
  id: string;
  title: string;
  type: 'story';
  status: string;
  priority?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/** Project-level result from get_project_status, create_project, etc. */
export interface McpProjectResult {
  project?: string;
  slug?: string;
  status?: string;
  description?: string;
  tasks?: Array<{ id: string; title: string; status: string }>;
  sprints?: Array<{ id: string; name: string; status: string }>;
  created_at?: string;
  updated_at?: string;
  // Workflow stats — included by get_project_status for the status card
  total_tasks?: number;
  completed_tasks?: number;
  blocked_tasks?: number;
  in_progress_tasks?: number;
  completion_percentage?: number;
}

/** A sprint returned by get_sprint, create_sprint, start_sprint, etc. */
export interface McpSprintResult {
  id: string;
  name: string;
  status: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

/** Workflow status counts keyed by state name. */
export interface McpWorkflowResult {
  [state: string]: number;
}

/** Generic list result (epics, stories, tasks, sprints, etc.). */
export interface McpListResult {
  items: Array<Record<string, unknown>>;
  type:
    | 'epics'
    | 'stories'
    | 'tasks'
    | 'sprints'
    | 'sessions'
    | 'plans'
    | 'templates'
    | 'projects'
    | 'teams'
    | 'agents'
    | 'skills'
    | 'notes'
    | 'hook_events';
}

/** Burndown chart data for a sprint. */
export interface McpBurndownResult {
  data: Array<{ date: string; ideal: number; actual: number }>;
  sprint_id: string;
}

/** Daily standup summary. */
export interface McpStandupResult {
  completed: Array<{ id: string; title: string }>;
  in_progress: Array<{ id: string; title: string }>;
  blocked: Array<{ id: string; title: string; reason?: string }>;
}

/** GitHub pull request details. */
export interface McpGitHubPRResult {
  number: number;
  title: string;
  state: string;
  head: string;
  base: string;
  url?: string;
  author?: string;
  draft?: boolean;
}

/** GitHub issue details. */
export interface McpGitHubIssueResult {
  number: number;
  title: string;
  state: string;
  labels?: string[];
  assignees?: string[];
  url?: string;
}

/** Search results from the search tool. */
export interface McpSearchResult {
  results: Array<{
    id: string;
    title: string;
    type: string;
    status?: string;
    score?: number;
  }>;
  query: string;
}

/** PRD session question state. */
export interface McpPrdSessionResult {
  index: number;
  key: string;
  question: string;
  required: boolean;
  status: string;
  options?: string[];
}

/** Velocity across completed sprints. */
export interface McpVelocityResult {
  average: number;
  sprints: Array<{ id: string; name: string; velocity: number }>;
}

/** Memory search results from search_memory / get_context. */
export interface McpMemoryResult {
  results: Array<{
    summary: string;
    content: string;
    tags?: string[];
    source?: string;
    source_id?: string;
    score?: number;
  }>;
  query: string;
}

/** Session data from get_session / save_session. */
export interface McpSessionResult {
  session_id: string;
  summary: string;
  events?: Array<{ type: string; description?: string }>;
  created_at?: string;
  project?: string;
}

/** CI/CD status from github_ci_status. */
export interface McpCIStatusResult {
  state: string;
  statuses: Array<{
    context: string;
    state: string;
    description?: string;
    target_url?: string;
  }>;
  ref: string;
  sha?: string;
}

/** Gate transition result from advance_task / reject_task. */
export interface McpGateResult {
  from: string;
  to: string;
  task: { id: string; title: string; status: string };
  gate?: string;
  evidence?: string;
}

/** A Figma file embed returned by figma_embed tool or containing a figma_url field. */
export interface McpFigmaResult {
  figma_url: string;
  node_id?: string;
  title?: string;
}

/** WIP limit configuration and status. */
export interface McpWipLimitResult {
  max_in_progress?: number;
  max_per_assignee?: number;
  max_per_sprint?: number;
  current_in_progress?: number;
  current_per_assignee?: Record<string, number>;
  exceeded?: boolean;
  assignee?: string;
}

/** Dependency graph for a project. */
export interface McpDependencyGraphResult {
  nodes: Array<{ id: string; title: string; status?: string; type?: string }>;
  edges: Array<{ from: string; to: string }>;
  cycles?: string[][];
}

/** A note object from save_note / list_notes / get_note. */
export interface McpNoteResult {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Team object from get_team / create_team. */
export interface McpTeamResult {
  team_id?: string;
  id?: string;
  name: string;
  description?: string;
  members?: Array<{ id: string; name?: string; email?: string; role?: string }>;
  created_at?: string;
}

/** Usage totals from get_usage. */
export interface McpUsageResult {
  total_input_tokens?: number;
  total_output_tokens?: number;
  total_cost?: number;
  sessions?: Array<{ session_id: string; model?: string; cost?: number; created_at?: string }>;
}

/** Hook event from get_hook_events. */
export interface McpHookEventsResult {
  events: Array<{
    id?: string;
    event_type: string;
    tool_name?: string;
    session_id?: string;
    data?: Record<string, unknown>;
    created_at?: string;
  }>;
}

/** Simple confirmation/acknowledgement from tools like save_note, send_notification, etc. */
export interface McpConfirmationResult {
  ok?: boolean;
  success?: boolean;
  message?: string;
  action?: string;
  tool?: string;
}

/** PRD content from read_prd. */
export interface McpPrdContentResult {
  content: string;
  project?: string;
  title?: string;
}

/** Agent briefing from get_agent_briefing. */
export interface McpAgentBriefingResult {
  role: string;
  briefing: string;
  project?: string;
  focus_areas?: string[];
}

/** PRD phases from list_prd_phases. */
export interface McpPrdPhasesResult {
  phases: Array<{ id?: string; name: string; status?: string; order?: number }>;
  project?: string;
}

/** PRD validation result from validate_prd. */
export interface McpPrdValidationResult {
  valid: boolean;
  completeness?: number;
  missing?: string[];
  warnings?: string[];
  project?: string;
}

/** Fallback for any response shape we cannot classify. */
export interface McpGenericResult {
  raw: unknown;
  keys: string[];
}

// ---- Discriminated union -----------------------------------------------------

export type McpParsedResult =
  | { type: 'task'; data: McpTaskResult }
  | { type: 'epic'; data: McpEpicResult }
  | { type: 'story'; data: McpStoryResult }
  | { type: 'project'; data: McpProjectResult }
  | { type: 'sprint'; data: McpSprintResult }
  | { type: 'workflow'; data: McpWorkflowResult }
  | { type: 'list'; data: McpListResult }
  | { type: 'burndown'; data: McpBurndownResult }
  | { type: 'standup'; data: McpStandupResult }
  | { type: 'github_pr'; data: McpGitHubPRResult }
  | { type: 'github_issue'; data: McpGitHubIssueResult }
  | { type: 'search'; data: McpSearchResult }
  | { type: 'prd_session'; data: McpPrdSessionResult }
  | { type: 'velocity'; data: McpVelocityResult }
  | { type: 'memory'; data: McpMemoryResult }
  | { type: 'session'; data: McpSessionResult }
  | { type: 'ci_status'; data: McpCIStatusResult }
  | { type: 'gate'; data: McpGateResult }
  | { type: 'preview'; data: McpPreviewResult }
  | { type: 'figma_embed'; data: McpFigmaResult }
  | { type: 'wip_limit'; data: McpWipLimitResult }
  | { type: 'dependency_graph'; data: McpDependencyGraphResult }
  | { type: 'note'; data: McpNoteResult }
  | { type: 'team'; data: McpTeamResult }
  | { type: 'usage'; data: McpUsageResult }
  | { type: 'hook_events'; data: McpHookEventsResult }
  | { type: 'confirmation'; data: McpConfirmationResult }
  | { type: 'prd_content'; data: McpPrdContentResult }
  | { type: 'agent_briefing'; data: McpAgentBriefingResult }
  | { type: 'prd_phases'; data: McpPrdPhasesResult }
  | { type: 'prd_validation'; data: McpPrdValidationResult }
  | { type: 'generic'; data: McpGenericResult };

/** A preview session returned by preview_component, update_preview */
export interface McpPreviewResult {
  session_id: string;
  ws_url?: string;
  framework: string;
  updated?: boolean;
  signaled?: boolean;
  viewport?: { width: number; height: number; preset: string };
}

// ---- Helpers -----------------------------------------------------------------

/**
 * Extract the short tool name from a fully-qualified MCP tool identifier.
 *
 * MCP tool names arrive in the form `mcp__<server>__<tool>`. We need just the
 * `<tool>` portion (everything after the second `__`).
 *
 * Examples:
 *   "mcp__orchestra-mcp__get_task"  -> "get_task"
 *   "mcp__orchestra-mcp__github_get_pr" -> "github_get_pr"
 *   "get_task"                      -> "get_task"
 */
export function extractToolName(fullName: string): string {
  const parts = fullName.split('__');
  return parts.length >= 3 ? parts.slice(2).join('__') : parts[parts.length - 1];
}

/**
 * Type guard: returns `true` when the value is a non-null object (not an
 * array).  Used internally to safely narrow `unknown` before property checks.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Detect list-type responses.  Many MCP tools return an array directly (e.g.
 * `list_epics`, `list_stories`).  We wrap the array in a `McpListResult`
 * with a best-guess `type` derived from the tool name.
 */
function detectListType(
  shortName: string,
): McpListResult['type'] | null {
  if (shortName.includes('epic')) return 'epics';
  if (shortName.includes('stories') || shortName === 'list_stories') return 'stories';
  if (shortName === 'my_tasks' || shortName === 'list_tasks') return 'tasks';
  if (shortName.includes('task')) return 'tasks';
  if (shortName.includes('sprint')) return 'sprints';
  if (shortName.includes('session')) return 'sessions';
  if (shortName.includes('plan')) return 'plans';
  if (shortName.includes('template')) return 'templates';
  if (shortName.includes('project')) return 'projects';
  if (shortName.includes('team')) return 'teams';
  if (shortName.includes('agent')) return 'agents';
  if (shortName.includes('skill')) return 'skills';
  if (shortName.includes('note')) return 'notes';
  if (shortName.includes('hook')) return 'hook_events';
  return null;
}

// ---- Main parser -------------------------------------------------------------

/**
 * Parse a raw MCP tool_response JSON string into a typed `McpParsedResult`.
 *
 * Detection strategy (in order):
 *   1. JSON parse failures -> generic
 *   2. Non-object / null   -> generic
 *   3. Array responses     -> list (wrapped)
 *   4. Tool name + object shape heuristics (most specific first)
 *   5. Fallback            -> generic with extracted keys
 *
 * @param toolName   The full or short MCP tool name (e.g. "mcp__orchestra-mcp__get_task")
 * @param rawResult  The JSON string (or already-parsed object) from the tool response
 */
export function parseMcpResponse(
  toolName: string,
  rawResult: string | unknown,
): McpParsedResult {
  // Step 1 -- parse JSON (if it is a string)
  let parsed: unknown;
  try {
    parsed = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
  } catch {
    return { type: 'generic', data: { raw: rawResult, keys: [] } };
  }

  // Step 2 -- reject null / primitives
  if (parsed === null || typeof parsed !== 'object') {
    return { type: 'generic', data: { raw: parsed, keys: [] } };
  }

  // Step 3 -- handle array responses (many list_* tools return arrays)
  if (Array.isArray(parsed)) {
    const shortName = extractToolName(toolName);
    const listType = detectListType(shortName);
    if (listType) {
      return {
        type: 'list',
        data: {
          items: parsed as Array<Record<string, unknown>>,
          type: listType,
        },
      };
    }
    return { type: 'generic', data: { raw: parsed, keys: [] } };
  }

  // From here on we know it is a plain object.
  const obj = parsed as Record<string, unknown>;
  const shortName = extractToolName(toolName);

  // --- Gate transition (advance_task, reject_task) ---
  if (
    (shortName === 'advance_task' || shortName === 'reject_task') &&
    obj.from && obj.to && obj.task
  ) {
    return { type: 'gate', data: obj as unknown as McpGateResult };
  }

  // --- Task (get_task, create_task, set_current_task, etc.) ---
  if (shortName.includes('task') && obj.id && obj.title && obj.type) {
    return { type: 'task', data: obj as unknown as McpTaskResult };
  }

  // --- Epic ---
  if ((shortName.includes('epic') || obj.type === 'epic') && obj.id && obj.title) {
    return { type: 'epic', data: obj as unknown as McpEpicResult };
  }

  // --- Story ---
  if ((shortName.includes('story') || obj.type === 'story') && obj.id && obj.title) {
    return { type: 'story', data: obj as unknown as McpStoryResult };
  }

  // --- Sprint (get_sprint, create_sprint, start_sprint, end_sprint) ---
  if (shortName.includes('sprint') && obj.id && obj.name) {
    return { type: 'sprint', data: obj as unknown as McpSprintResult };
  }

  // --- Project status / create_project ---
  if (
    (shortName === 'get_project_status' || shortName === 'create_project') &&
    (obj.project || obj.slug)
  ) {
    return { type: 'project', data: obj as unknown as McpProjectResult };
  }

  // --- Workflow status ---
  if (shortName === 'get_workflow_status') {
    return { type: 'workflow', data: obj as McpWorkflowResult };
  }

  // --- Burndown chart ---
  if (shortName === 'get_burndown' && obj.data) {
    return { type: 'burndown', data: obj as unknown as McpBurndownResult };
  }

  // --- Standup summary ---
  if (shortName === 'get_standup_summary') {
    return { type: 'standup', data: obj as unknown as McpStandupResult };
  }

  // --- Velocity ---
  if (shortName === 'get_velocity') {
    return { type: 'velocity', data: obj as unknown as McpVelocityResult };
  }

  // --- GitHub PR ---
  if (shortName.includes('pr') && obj.number && obj.head) {
    return { type: 'github_pr', data: obj as unknown as McpGitHubPRResult };
  }

  // --- GitHub Issue ---
  if (shortName.includes('issue') && obj.number && obj.title && obj.state) {
    return { type: 'github_issue', data: obj as unknown as McpGitHubIssueResult };
  }

  // --- Search ---
  if (shortName === 'search' && obj.results) {
    return { type: 'search', data: obj as unknown as McpSearchResult };
  }

  // --- PRD Session (get_prd_session, answer_prd_question, etc.) ---
  if (
    (shortName.includes('prd') || shortName === 'answer_prd_question') &&
    obj.question !== undefined
  ) {
    return { type: 'prd_session', data: obj as unknown as McpPrdSessionResult };
  }

  // --- Memory search ---
  if ((shortName === 'search_memory' || shortName === 'get_context') && obj.results) {
    return { type: 'memory', data: obj as unknown as McpMemoryResult };
  }

  // --- Session ---
  if ((shortName === 'get_session' || shortName === 'save_session') && obj.session_id) {
    return { type: 'session', data: obj as unknown as McpSessionResult };
  }

  // --- CI Status ---
  if (shortName === 'github_ci_status' && obj.statuses) {
    return { type: 'ci_status', data: obj as unknown as McpCIStatusResult };
  }

  // --- Figma embed ---
  if (obj.figma_url && typeof obj.figma_url === 'string') {
    return { type: 'figma_embed', data: obj as unknown as McpFigmaResult };
  }

  // --- Preview ---
  if (
    (shortName === 'preview_component' || shortName === 'update_preview' || shortName === 'set_preview_viewport') &&
    obj.session_id
  ) {
    return { type: 'preview', data: obj as unknown as McpPreviewResult };
  }

  // --- List result wrapped in an object with an items/array field ---
  if (shortName.startsWith('list_') || shortName === 'my_tasks') {
    const listType = detectListType(shortName);
    if (listType) {
      // Some list tools return { items: [...] }, others return the array in
      // a field matching the type (e.g. { epics: [...] }).
      const arrayField =
        (Array.isArray(obj.items) && obj.items) ||
        (Array.isArray(obj[listType]) && (obj[listType] as Array<Record<string, unknown>>));
      if (arrayField) {
        return {
          type: 'list',
          data: {
            items: arrayField as Array<Record<string, unknown>>,
            type: listType,
          },
        };
      }
      // If the whole object looks like a wrapper, try any array field
      const anyArray = Object.values(obj).find(Array.isArray) as Array<Record<string, unknown>> | undefined;
      if (anyArray) {
        return { type: 'list', data: { items: anyArray, type: listType } };
      }
    }
  }

  // --- WIP limits (get_wip_limits, check_wip_limit, set_wip_limits) ---
  if (
    shortName === 'get_wip_limits' ||
    shortName === 'set_wip_limits' ||
    shortName === 'check_wip_limit'
  ) {
    return { type: 'wip_limit', data: obj as unknown as McpWipLimitResult };
  }

  // --- Dependency graph ---
  if (shortName === 'get_dependency_graph') {
    const nodes = Array.isArray(obj.nodes) ? obj.nodes : [];
    const edges = Array.isArray(obj.edges) ? obj.edges : [];
    return {
      type: 'dependency_graph',
      data: { nodes, edges, cycles: obj.cycles as string[][] | undefined } as McpDependencyGraphResult,
    };
  }

  // --- Team (get_team, create_team) ---
  if ((shortName === 'get_team' || shortName === 'create_team') && obj.name) {
    return { type: 'team', data: obj as unknown as McpTeamResult };
  }

  // --- Note (save_note, update_note - single note result) ---
  if (
    (shortName === 'save_note' || shortName === 'update_note') &&
    obj.title !== undefined
  ) {
    return { type: 'note', data: obj as unknown as McpNoteResult };
  }

  // --- Usage (get_usage) ---
  if (shortName === 'get_usage') {
    return { type: 'usage', data: obj as unknown as McpUsageResult };
  }

  // --- Hook events (get_hook_events) ---
  if (shortName === 'get_hook_events') {
    const events = Array.isArray(obj.events) ? obj.events : Array.isArray(obj) ? obj : [];
    return {
      type: 'hook_events',
      data: { events } as McpHookEventsResult,
    };
  }

  // --- PRD content (read_prd) ---
  if (shortName === 'read_prd' && obj.content !== undefined) {
    return { type: 'prd_content', data: obj as unknown as McpPrdContentResult };
  }
  // read_prd may return a plain string wrapped as a result
  if (shortName === 'read_prd' && typeof obj === 'object' && !Array.isArray(obj)) {
    const contentVal = obj.content ?? obj.prd ?? obj.text;
    if (typeof contentVal === 'string') {
      return { type: 'prd_content', data: { content: contentVal } };
    }
  }

  // --- Agent briefing (get_agent_briefing) ---
  if (shortName === 'get_agent_briefing' && obj.briefing !== undefined) {
    return { type: 'agent_briefing', data: obj as unknown as McpAgentBriefingResult };
  }

  // --- PRD phases (list_prd_phases) ---
  if (shortName === 'list_prd_phases') {
    const phases = Array.isArray(obj.phases)
      ? obj.phases
      : (Array.isArray(obj) ? obj : []);
    return {
      type: 'prd_phases',
      data: { phases, project: obj.project as string | undefined } as McpPrdPhasesResult,
    };
  }

  // --- PRD validation (validate_prd) ---
  if (shortName === 'validate_prd') {
    return { type: 'prd_validation', data: obj as unknown as McpPrdValidationResult };
  }

  // --- PRD preview (preview_prd) ---
  if (shortName === 'preview_prd' && obj.content !== undefined) {
    return { type: 'prd_content', data: obj as unknown as McpPrdContentResult };
  }

  // --- Search notes (search_notes) ---
  if (shortName === 'search_notes') {
    const items = Array.isArray(obj.results)
      ? obj.results
      : (Array.isArray(obj.notes) ? obj.notes : []);
    return { type: 'list', data: { items, type: 'notes' } };
  }

  // --- Confirmation tools (no structured data, just ok/message) ---
  const CONFIRMATION_TOOLS = new Set([
    'delete_note', 'delete_task', 'delete_story', 'delete_epic',
    'install_docs', 'install_agents', 'install_skills',
    'send_notification', 'play_sound',
    'save_memory', 'record_usage', 'reset_session_usage',
    'regenerate_readme', 'log_request',
    'open_desktop_window',
    'assign_task', 'unassign_task',
    'add_labels', 'remove_labels',
    'add_dependency', 'remove_dependency',
    'add_link',
    'add_sprint_tasks', 'remove_sprint_tasks',
    'set_estimate',
    'share_with_team',
    'invite_member',
  ]);
  if (CONFIRMATION_TOOLS.has(shortName)) {
    return {
      type: 'confirmation',
      data: {
        ok: obj.ok !== false,
        success: obj.success as boolean | undefined,
        message: (obj.message ?? obj.msg ?? obj.status) as string | undefined,
        action: shortName,
        tool: shortName,
      },
    };
  }

  // --- Generic fallback ---
  const keys = Object.keys(obj);
  return { type: 'generic', data: { raw: parsed, keys } };
}
