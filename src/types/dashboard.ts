export type WidgetType = 'stats' | 'recent_projects' | 'recent_notes' | 'quick_actions'

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
}

export const DEFAULT_LAYOUT: WidgetLayout[] = [
  { id: 'stats-1', type: 'stats', colSpan: 12, order: 0, hidden: false, locked: false },
  { id: 'recent_projects-1', type: 'recent_projects', colSpan: 6, order: 1, hidden: false, locked: false },
  { id: 'recent_notes-1', type: 'recent_notes', colSpan: 6, order: 2, hidden: false, locked: false },
  { id: 'quick_actions-1', type: 'quick_actions', colSpan: 12, order: 3, hidden: false, locked: false },
]
