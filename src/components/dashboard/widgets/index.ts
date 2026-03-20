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
import { ApiCollectionsWidget } from './ApiCollectionsWidget'
import { PresentationsWidget } from './PresentationsWidget'
import { DocsWidget } from './DocsWidget'
import { TeamActivityWidget } from './TeamActivityWidget'

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
export { ApiCollectionsWidget } from './ApiCollectionsWidget'
export { PresentationsWidget } from './PresentationsWidget'
export { DocsWidget } from './DocsWidget'
export { TeamActivityWidget } from './TeamActivityWidget'
export type { Project } from './RecentProjectsWidget'
export type { Note } from './RecentNotesWidget'
export type { ApiCollectionItem } from './ApiCollectionsWidget'
export type { PresentationItem } from './PresentationsWidget'
export type { DocItem } from './DocsWidget'
export type { TeamActivity } from './TeamActivityWidget'

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
  api_collections: ApiCollectionsWidget,
  presentations: PresentationsWidget,
  docs: DocsWidget,
  team_activity: TeamActivityWidget,
}
