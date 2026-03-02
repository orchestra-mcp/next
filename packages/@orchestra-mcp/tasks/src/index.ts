// @orchestra-mcp/tasks — Task management components

export { BacklogView } from './BacklogView';
export type { BacklogViewProps, BacklogColumn, BacklogCard } from './BacklogView';

export { StatusGrid } from './StatusGrid';
export type { StatusGridProps, StatusCount } from './StatusGrid';

export { TaskList } from './TaskList';
export type { TaskListProps, TaskItem } from './TaskList';

export { DetailPanel } from './DetailPanel';
export type { DetailPanelProps, DetailField } from './DetailPanel';

export { DashboardGrid, ResizeHandle, useGridDrag, WidgetContextMenu } from './Dashboard';
export type { DashboardGridProps, ResizeHandleProps, WidgetContextMenuProps } from './Dashboard';

export { ProjectsSidebar, ProjectItem } from './ProjectsSidebar';
export type { ProjectsSidebarProps, ProjectSummary, ProjectItemProps } from './ProjectsSidebar';

export { useDashboardStore, useIntegrationStore, useTaskDetailStore } from './stores';
export type { WidgetType, WidgetLayout, IntegrationProvider, IntegrationConnection } from './stores';

// Project Dashboard page
export { ProjectDashboard, DashboardHeader, DashboardSettings } from './ProjectDashboard';
export type { ProjectDashboardProps, DashboardHeaderProps, DashboardSettingsProps } from './ProjectDashboard';

// Dashboard widgets
export {
  BacklogTreeWidget,
  TaskDistributionWidget,
  RecentActivityWidget,
  SprintProgressWidget,
  TeamWorkloadWidget,
  ActiveTasksWidget,
  ProgressDistributionWidget,
  SessionMetricsWidget,
  FeatureAdoptionWidget,
  ProjectStatusWidget,
} from './widgets';
export type {
  BacklogTreeWidgetProps,
  TreeNode,
  TaskDistributionWidgetProps,
  ChartDataPoint,
  RecentActivityWidgetProps,
  ActivityItem,
  SprintProgressWidgetProps,
  SprintData,
  TeamWorkloadWidgetProps,
  TeamMember,
  ActiveTasksWidgetProps,
  ActiveTask,
  ProgressDistributionWidgetProps,
  SessionMetricsWidgetProps,
  SessionKPI,
  FeatureAdoptionWidgetProps,
  FeatureUsage,
  ProjectStatusWidgetProps,
} from './widgets';

// MCP client
export { mcpCall } from './mcp';

// Hooks
export { useProjects } from './hooks';
export { useProjectTree } from './hooks';
export { useTaskActions } from './hooks';
export { useTaskDetail } from './hooks';
export type { TaskDetail, TaskDetailParams, EvidenceEntry } from './hooks';
export { useFilteredTree, extractAssignees } from './hooks';
export { useConnectionStatus } from './hooks';
export type { ConnectionState } from './hooks';
export { useOptimisticTaskActions, predictStatus } from './hooks';
export type { OptimisticOptions } from './hooks';

// Sidebar components
export { BacklogTree } from './BacklogTree';
export type { BacklogTreeProps } from './BacklogTree';

export { TaskDetailPanel } from './TaskDetailPanel';
export type { TaskDetailPanelProps } from './TaskDetailPanel';

export { LabelsSection } from './LabelsSection';
export type { LabelsSectionProps } from './LabelsSection';

export { LinksSection } from './LinksSection';
export type { LinksSectionProps, LinkItem } from './LinksSection';

export { StatusActions } from './TaskDetailPanel';
export type { StatusActionsProps } from './TaskDetailPanel';

export { TasksSidebar } from './TasksSidebar';
export type { TasksSidebarProps } from './TasksSidebar';

export { ConnectionStatus, ConnectionStatusDot, ConnectionStatusBanner } from './ConnectionStatus';
export type { ConnectionStatusProps } from './ConnectionStatus';

export { TaskFilter } from './TaskFilter';
export type { TaskFilterProps, FilterState } from './TaskFilter';

// Status & Priority
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

export { PriorityIcon } from './PriorityIcon';
export type { PriorityIconProps } from './PriorityIcon';

// Lifecycle Progress
export { LifecycleProgressBar } from './LifecycleProgressBar';
export type { LifecycleProgressBarProps } from './LifecycleProgressBar';

// Evidence Log
export { EvidenceLog } from './EvidenceLog';
export type { EvidenceLogProps } from './EvidenceLog';

// Stale Notification
export { StaleNotification } from './StaleNotification';
export type { StaleNotificationProps } from './StaleNotification';

// Inline Edit
export { EditableText, EditableTextarea, EditableSelect } from './InlineEdit';
export type { EditableTextProps, EditableTextareaProps, EditableSelectProps } from './InlineEdit';
