export type WidgetType = 'stats' | 'recent_projects' | 'recent_notes' | 'quick_actions' | 'project_health' | 'burndown' | 'velocity' | 'activity_feed' | 'workload' | 'team_members' | 'active_tunnels' | 'team_automation' | 'api_collections' | 'presentations' | 'docs' | 'team_activity'

export interface WidgetLayout {
  id: string
  type: WidgetType
  colSpan: number
  order: number
  hidden: boolean
  locked: boolean
}

export interface WidgetDefinition {
  type: WidgetType
  label: string
  icon: string
  defaultColSpan: number
  minColSpan: number
  maxColSpan: number
  frameless?: boolean
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  stats: {
    type: 'stats',
    label: 'widgetStats',
    icon: 'bx-bar-chart-alt-2',
    defaultColSpan: 12,
    minColSpan: 6,
    maxColSpan: 12,
    frameless: true,
  },
  recent_projects: {
    type: 'recent_projects',
    label: 'widgetProjects',
    icon: 'bx-folder',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  recent_notes: {
    type: 'recent_notes',
    label: 'widgetNotes',
    icon: 'bx-note',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  quick_actions: {
    type: 'quick_actions',
    label: 'widgetQuickActions',
    icon: 'bx-rocket',
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
  },
  project_health: {
    type: 'project_health',
    label: 'widgetProjectHealth',
    icon: 'bx-heart-circle',
    defaultColSpan: 12,
    minColSpan: 6,
    maxColSpan: 12,
    frameless: true,
  },
  burndown: {
    type: 'burndown',
    label: 'widgetBurndown',
    icon: 'bx-line-chart-down',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  velocity: {
    type: 'velocity',
    label: 'widgetVelocity',
    icon: 'bx-bar-chart',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  activity_feed: {
    type: 'activity_feed',
    label: 'widgetActivityFeed',
    icon: 'bx-pulse',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  workload: {
    type: 'workload',
    label: 'widgetWorkload',
    icon: 'bx-user-check',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  team_members: {
    type: 'team_members',
    label: 'widgetTeamMembers',
    icon: 'bx-group',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  active_tunnels: {
    type: 'active_tunnels',
    label: 'widgetActiveTunnels',
    icon: 'bx-transfer-alt',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  team_automation: {
    type: 'team_automation',
    label: 'Team Automation',
    icon: 'bx-terminal',
    defaultColSpan: 12,
    minColSpan: 6,
    maxColSpan: 12,
    frameless: true,
  },
  api_collections: {
    type: 'api_collections',
    label: 'widgetApiCollections',
    icon: 'bx-collection',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  presentations: {
    type: 'presentations',
    label: 'widgetPresentations',
    icon: 'bx-slideshow',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  docs: {
    type: 'docs',
    label: 'widgetDocs',
    icon: 'bx-file',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
  team_activity: {
    type: 'team_activity',
    label: 'widgetTeamActivity',
    icon: 'bx-group',
    defaultColSpan: 6,
    minColSpan: 4,
    maxColSpan: 12,
  },
}

// Bump this when DEFAULT_LAYOUT changes significantly to force a reset for existing users
export const LAYOUT_VERSION = 5

export const DEFAULT_LAYOUT: WidgetLayout[] = [
  { id: 'team_automation-1', type: 'team_automation', colSpan: 12, order: 0, hidden: false, locked: false },
  { id: 'project_health-1', type: 'project_health', colSpan: 12, order: 1, hidden: false, locked: false },
  { id: 'stats-1', type: 'stats', colSpan: 12, order: 2, hidden: false, locked: false },
  { id: 'team_members-1', type: 'team_members', colSpan: 6, order: 3, hidden: false, locked: false },
  { id: 'active_tunnels-1', type: 'active_tunnels', colSpan: 6, order: 4, hidden: false, locked: false },
  { id: 'burndown-1', type: 'burndown', colSpan: 6, order: 5, hidden: false, locked: false },
  { id: 'velocity-1', type: 'velocity', colSpan: 6, order: 6, hidden: false, locked: false },
  { id: 'activity_feed-1', type: 'activity_feed', colSpan: 6, order: 7, hidden: false, locked: false },
  { id: 'workload-1', type: 'workload', colSpan: 6, order: 8, hidden: false, locked: false },
  { id: 'recent_projects-1', type: 'recent_projects', colSpan: 6, order: 9, hidden: false, locked: false },
  { id: 'recent_notes-1', type: 'recent_notes', colSpan: 6, order: 10, hidden: false, locked: false },
  { id: 'quick_actions-1', type: 'quick_actions', colSpan: 12, order: 11, hidden: false, locked: false },
  { id: 'api_collections-1', type: 'api_collections', colSpan: 6, order: 12, hidden: false, locked: false },
  { id: 'presentations-1', type: 'presentations', colSpan: 6, order: 13, hidden: false, locked: false },
  { id: 'docs-1', type: 'docs', colSpan: 6, order: 14, hidden: false, locked: false },
  { id: 'team_activity-1', type: 'team_activity', colSpan: 6, order: 15, hidden: false, locked: false },
]
