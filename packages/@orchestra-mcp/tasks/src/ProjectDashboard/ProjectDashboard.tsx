import { useState, useCallback } from 'react';
import { DashboardGrid } from '../Dashboard';
import { WidgetContextMenu } from '../Dashboard';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useTaskDetailStore } from '../stores/useTaskDetailStore';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSettings } from './DashboardSettings';
import { TaskDetailPanel } from '../TaskDetailPanel/TaskDetailPanel';
import {
  ProjectStatusWidget,
  BacklogTreeWidget,
  TaskDistributionWidget,
  RecentActivityWidget,
  SprintProgressWidget,
  TeamWorkloadWidget,
  ActiveTasksWidget,
  ProgressDistributionWidget,
  SessionMetricsWidget,
  FeatureAdoptionWidget,
} from '../widgets';
import { WIDGET_TITLES } from './defaultLayout';
import type { WidgetLayout } from '../stores/useDashboardStore';
import type { TreeNode } from '../widgets/BacklogTreeWidget';
import './ProjectDashboard.css';

export interface ProjectDashboardProps {
  slug: string;
  name: string;
  totalTasks?: number;
  doneTasks?: number;
  completionPercent?: number;
  statuses?: Array<{ status: string; label: string; count: number; color: string }>;
  epicCount?: number;
  storyCount?: number;
  activeTasks?: Array<{ id: string; title: string; status: string; storyTitle?: string; epicTitle?: string; priority?: string }>;
  tree?: unknown;
  loading?: boolean;
  onRefresh?: () => void;
}

interface MenuPos { x: number; y: number }
interface ContextMenuState extends MenuPos { widgetId: string }

export const ProjectDashboard = ({
  slug,
  name,
  totalTasks = 0,
  doneTasks = 0,
  completionPercent = 0,
  statuses = [],
  epicCount = 0,
  storyCount = 0,
  activeTasks = [],
  tree,
  loading,
  onRefresh,
}: ProjectDashboardProps) => {
  const [settingsPos, setSettingsPos] = useState<MenuPos | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedTask = useTaskDetailStore((s) => s.selectedTask);
  const selectTask = useTaskDetailStore((s) => s.selectTask);
  const clearSelection = useTaskDetailStore((s) => s.clearSelection);

  const layout = useDashboardStore((s) => s.getLayout(slug));
  const columns = useDashboardStore((s) => s.getColumns(slug));
  const moveWidget = useDashboardStore((s) => s.moveWidget);
  const moveWidgetToIndex = useDashboardStore((s) => s.moveWidgetToIndex);
  const toggleHidden = useDashboardStore((s) => s.toggleHidden);
  const toggleLocked = useDashboardStore((s) => s.toggleLocked);
  const setWidgetColSpan = useDashboardStore((s) => s.setWidgetColSpan);
  const setColumns = useDashboardStore((s) => s.setColumns);

  const visibleWidgets = layout.filter((w) => !w.hidden);

  const handleSettingsToggle = useCallback((e: React.MouseEvent) => {
    if (settingsPos) { setSettingsPos(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSettingsPos({ x: rect.right - 260, y: rect.bottom + 6 });
  }, [settingsPos]);

  const handleWidgetContextMenu = useCallback((widgetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, widgetId });
  }, []);

  const handleWidgetMove = useCallback((widgetId: string, newVisibleIndex: number) => {
    // Get the full layout
    const fullLayout = layout;

    // Find the dragged widget
    const draggedWidget = fullLayout.find((w) => w.id === widgetId);
    if (!draggedWidget) return;

    // Get only visible widgets and remove the dragged one
    const visibleOnly = fullLayout.filter((w) => !w.hidden && w.id !== widgetId);

    // Clamp the new index
    const targetIndex = Math.max(0, Math.min(visibleOnly.length, newVisibleIndex));

    // Insert at the new position in visible widgets
    const reorderedVisible = [
      ...visibleOnly.slice(0, targetIndex),
      draggedWidget,
      ...visibleOnly.slice(targetIndex),
    ];

    // Now rebuild the full layout preserving hidden widgets
    const hiddenWidgets = fullLayout.filter((w) => w.hidden);
    const newFullLayout = [...reorderedVisible, ...hiddenWidgets];

    // Update the store with the full layout
    useDashboardStore.getState().updateLayout(slug, newFullLayout);
  }, [slug, layout]);

  const handleNodeClick = useCallback((node: TreeNode) => {
    // Only handle task clicks - tasks are 3 levels deep
    if (node.type !== 'task' && node.type !== 'bug' && node.type !== 'hotfix') {
      setSelectedNodeId(node.id);
      return;
    }

    // Find the task's epic and story by traversing the tree
    const treeArray = tree as TreeNode[] | undefined;
    if (!treeArray) return;

    for (const epic of treeArray) {
      if (!epic.children) continue;
      for (const story of epic.children) {
        if (!story.children) continue;
        const task = story.children.find((t) => t.id === node.id);
        if (task) {
          setSelectedNodeId(node.id);
          selectTask({
            taskId: node.id,
            epicId: epic.id,
            storyId: story.id,
          });
          return;
        }
      }
    }
  }, [tree, selectTask]);

  const handleNodeAction = useCallback(async (actionId: string, node: TreeNode) => {
    // Find the task's epic and story for MCP calls
    const treeArray = tree as TreeNode[] | undefined;
    if (!treeArray) return;

    let epicId = '';
    let storyId = '';

    for (const epic of treeArray) {
      if (!epic.children) continue;
      for (const story of epic.children) {
        if (!story.children) continue;
        const task = story.children.find((t) => t.id === node.id);
        if (task) {
          epicId = epic.id;
          storyId = story.id;
          break;
        }
      }
      if (epicId) break;
    }

    if (!epicId || !storyId) return;

    // Import mcpCall dynamically
    const { mcpCall } = await import('../mcp/client');

    try {
      switch (actionId) {
        case 'start':
          await mcpCall('set_current_task', {
            project: slug,
            epic_id: epicId,
            story_id: storyId,
            task_id: node.id,
          });
          onRefresh?.();
          break;

        case 'complete':
          await mcpCall('complete_task', {
            project: slug,
            epic_id: epicId,
            story_id: storyId,
            task_id: node.id,
          });
          onRefresh?.();
          break;

        case 'block':
          await mcpCall('update_task', {
            project: slug,
            epic_id: epicId,
            story_id: storyId,
            task_id: node.id,
            status: 'blocked',
          });
          onRefresh?.();
          break;

        case 'delete':
          if (confirm(`Delete task "${node.title}"?`)) {
            await mcpCall('delete_task', {
              project: slug,
              epic_id: epicId,
              story_id: storyId,
              task_id: node.id,
            });
            onRefresh?.();
          }
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
  }, [tree, slug, onRefresh]);

  const renderWidget = useCallback(
    (widget: WidgetLayout) => {
      switch (widget.type) {
        case 'project-status':
          return (
            <ProjectStatusWidget
              slug={slug}
              totalTasks={totalTasks}
              doneTasks={doneTasks}
              completionPercent={completionPercent}
              statuses={statuses}
              epicCount={epicCount}
              storyCount={storyCount}
              loading={loading}
              onRefresh={onRefresh}
            />
          );
        case 'backlog-tree':
          return (
            <BacklogTreeWidget
              tree={Array.isArray(tree) ? tree : []}
              totalTasks={totalTasks}
              doneTasks={doneTasks}
              loading={loading}
              selectedNode={selectedNodeId}
              onNodeClick={handleNodeClick}
              onNodeAction={handleNodeAction}
              onFullView={() => {
                // TODO: Navigate to full backlog view page
                console.log('Full view requested for project:', slug);
              }}
            />
          );
        case 'task-distribution':
          return (
            <TaskDistributionWidget
              byStatus={statuses.map((s) => ({ label: s.label, value: s.count, color: s.color }))}
              byPriority={[]}
              byType={[]}
              loading={loading}
            />
          );
        case 'recent-activity':
          return (
            <RecentActivityWidget
              activities={[]}
              loading={loading}
            />
          );
        case 'sprint-progress':
          return (
            <SprintProgressWidget
              sprint={null}
              loading={loading}
            />
          );
        case 'team-workload':
          return (
            <TeamWorkloadWidget
              members={[]}
              loading={loading}
            />
          );
        case 'active-tasks':
          return (
            <ActiveTasksWidget
              tasks={activeTasks}
              loading={loading}
            />
          );
        case 'progress-distribution':
          return (
            <ProgressDistributionWidget
              data={statuses.map((s) => ({ label: s.label, value: s.count, color: s.color }))}
              completionPercent={completionPercent}
              loading={loading}
            />
          );
        case 'session-metrics':
          return (
            <SessionMetricsWidget
              kpis={[]}
            />
          );
        case 'feature-adoption':
          return (
            <FeatureAdoptionWidget
              features={[]}
            />
          );
        default:
          return (
            <div className="project-dashboard__placeholder">
              {WIDGET_TITLES[widget.type] ?? widget.type}
            </div>
          );
      }
    },
    [slug, totalTasks, doneTasks, completionPercent, statuses, epicCount, storyCount, activeTasks, tree, loading, onRefresh, selectedNodeId, handleNodeClick, handleNodeAction],
  );

  return (
    <div className="project-dashboard" data-testid="project-dashboard">
      <DashboardHeader
        name={name}
        onRefresh={onRefresh}
        onSettingsToggle={handleSettingsToggle}
      />
      <div className="project-dashboard__body">
        <DashboardGrid
          widgets={visibleWidgets}
          columns={columns}
          onMoveToIndex={handleWidgetMove}
          onWidgetContextMenu={handleWidgetContextMenu}
          renderWidget={renderWidget}
          className={`project-dashboard__grid--cols-${columns}`}
        />
      </div>
      {settingsPos && (
        <DashboardSettings
          x={settingsPos.x}
          y={settingsPos.y}
          columns={columns}
          onColumnsChange={(cols) => setColumns(slug, cols)}
          widgets={layout.map((w) => ({
            id: w.id,
            type: w.type,
            title: WIDGET_TITLES[w.type] ?? w.type,
            hidden: !!w.hidden,
          }))}
          onWidgetToggle={(id) => toggleHidden(slug, id)}
          onClose={() => setSettingsPos(null)}
        />
      )}
      {contextMenu && (
        <WidgetContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          widgetId={contextMenu.widgetId}
          columns={columns}
          currentColSpan={layout.find((w) => w.id === contextMenu.widgetId)?.colSpan ?? columns}
          isLocked={layout.find((w) => w.id === contextMenu.widgetId)?.locked}
          onColSpanChange={(id, colSpan) => setWidgetColSpan(slug, id, colSpan)}
          onHide={(id) => toggleHidden(slug, id)}
          onLock={(id) => toggleLocked(slug, id)}
          onClose={() => setContextMenu(null)}
        />
      )}
      <TaskDetailPanel
        isOpen={!!selectedTask}
        onClose={() => {
          clearSelection();
          setSelectedNodeId(null);
        }}
        params={selectedTask ? {
          project: slug,
          epicId: selectedTask.epicId,
          storyId: selectedTask.storyId,
          taskId: selectedTask.taskId,
        } : null}
      />
    </div>
  );
};
