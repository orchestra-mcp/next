import type { ComponentType } from 'react'
import type { WidgetType } from '@/types/dashboard'
import { StatsWidget } from './StatsWidget'
import { RecentProjectsWidget } from './RecentProjectsWidget'
import { RecentNotesWidget } from './RecentNotesWidget'
import { QuickActionsWidget } from './QuickActionsWidget'

export { StatsWidget } from './StatsWidget'
export { RecentProjectsWidget } from './RecentProjectsWidget'
export { RecentNotesWidget } from './RecentNotesWidget'
export { QuickActionsWidget } from './QuickActionsWidget'
export type { Project } from './RecentProjectsWidget'
export type { Note } from './RecentNotesWidget'

export const WIDGET_COMPONENTS: Record<WidgetType, ComponentType<any>> = {
  stats: StatsWidget,
  recent_projects: RecentProjectsWidget,
  recent_notes: RecentNotesWidget,
  quick_actions: QuickActionsWidget,
}
