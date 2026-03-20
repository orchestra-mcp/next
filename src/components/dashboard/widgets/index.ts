import type { ComponentType } from 'react'
import type { WidgetType } from '@/types/dashboard'
import { StatsWidget } from './StatsWidget'
import { RecentProjectsWidget } from './RecentProjectsWidget'
import { RecentNotesWidget } from './RecentNotesWidget'
import { QuickActionsWidget } from './QuickActionsWidget'
import { ProjectHealthWidget } from './ProjectHealthWidget'
import { BurndownWidget } from './BurndownWidget'
import { VelocityWidget } from './VelocityWidget'
import { ActivityFeedWidget } from './ActivityFeedWidget'
import { WorkloadWidget } from './WorkloadWidget'
import { TeamMembersWidget } from './TeamMembersWidget'
import { ActiveTunnelsWidget } from './ActiveTunnelsWidget'
import { TeamAutomationWidget } from './TeamAutomationWidget'

export { StatsWidget } from './StatsWidget'
export { RecentProjectsWidget } from './RecentProjectsWidget'
export { RecentNotesWidget } from './RecentNotesWidget'
export { QuickActionsWidget } from './QuickActionsWidget'
export { ProjectHealthWidget } from './ProjectHealthWidget'
export { BurndownWidget } from './BurndownWidget'
export { VelocityWidget } from './VelocityWidget'
export { ActivityFeedWidget } from './ActivityFeedWidget'
export { WorkloadWidget } from './WorkloadWidget'
export { TeamMembersWidget } from './TeamMembersWidget'
export { ActiveTunnelsWidget } from './ActiveTunnelsWidget'
export { TeamAutomationWidget } from './TeamAutomationWidget'
export type { Project } from './RecentProjectsWidget'
export type { Note } from './RecentNotesWidget'

export const WIDGET_COMPONENTS: Record<WidgetType, ComponentType<any>> = {
  stats: StatsWidget,
  recent_projects: RecentProjectsWidget,
  recent_notes: RecentNotesWidget,
  quick_actions: QuickActionsWidget,
  project_health: ProjectHealthWidget,
  burndown: BurndownWidget,
  velocity: VelocityWidget,
  activity_feed: ActivityFeedWidget,
  workload: WorkloadWidget,
  team_members: TeamMembersWidget,
  active_tunnels: ActiveTunnelsWidget,
  team_automation: TeamAutomationWidget,
}
