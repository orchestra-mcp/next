import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType =
  | 'backlog-tree'
  | 'task-distribution'
  | 'recent-activity'
  | 'sprint-progress'
  | 'team-workload'
  | 'active-tasks'
  | 'progress-distribution'
  | 'project-status'
  | 'session-metrics'
  | 'feature-adoption';

export interface WidgetLayout {
  id: string;
  type: WidgetType;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  collapsed: boolean;
  hidden?: boolean;
  locked?: boolean;
}

interface DashboardState {
  layouts: Record<string, WidgetLayout[]>;
  columns: Record<string, number>;
  activeProject: string | null;
}

interface DashboardActions {
  setActiveProject: (slug: string | null) => void;
  getLayout: (slug: string) => WidgetLayout[];
  updateLayout: (slug: string, layouts: WidgetLayout[]) => void;
  moveWidget: (slug: string, widgetId: string, col: number, row: number) => void;
  moveWidgetToIndex: (slug: string, widgetId: string, newIndex: number) => void;
  resizeWidget: (slug: string, widgetId: string, colSpan: number, rowSpan: number) => void;
  toggleCollapse: (slug: string, widgetId: string) => void;
  toggleHidden: (slug: string, widgetId: string) => void;
  toggleLocked: (slug: string, widgetId: string) => void;
  setWidgetColSpan: (slug: string, widgetId: string, colSpan: number) => void;
  addWidget: (slug: string, type: WidgetType) => void;
  removeWidget: (slug: string, widgetId: string) => void;
  resetLayout: (slug: string) => void;
  getColumns: (slug: string) => number;
  setColumns: (slug: string, cols: number) => void;
}

const defaultLayout: WidgetLayout[] = [
  { id: 'w-project-status', type: 'project-status', col: 1, row: 1, colSpan: 1, rowSpan: 1, collapsed: false, hidden: false },
  { id: 'w-backlog-tree', type: 'backlog-tree', col: 1, row: 2, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-task-distribution', type: 'task-distribution', col: 1, row: 3, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-progress-distribution', type: 'progress-distribution', col: 1, row: 4, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-active-tasks', type: 'active-tasks', col: 1, row: 5, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-recent-activity', type: 'recent-activity', col: 1, row: 6, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-sprint-progress', type: 'sprint-progress', col: 1, row: 7, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-team-workload', type: 'team-workload', col: 1, row: 8, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-session-metrics', type: 'session-metrics', col: 1, row: 9, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
  { id: 'w-feature-adoption', type: 'feature-adoption', col: 1, row: 10, colSpan: 1, rowSpan: 1, collapsed: false, hidden: true },
];

function updateWidget(
  state: DashboardState,
  slug: string,
  widgetId: string,
  updater: (w: WidgetLayout) => WidgetLayout,
): Partial<DashboardState> {
  const current = state.layouts[slug] ?? defaultLayout;
  return {
    layouts: {
      ...state.layouts,
      [slug]: current.map((w) => (w.id === widgetId ? updater(w) : w)),
    },
  };
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      layouts: {},
      columns: {},
      activeProject: null,

      setActiveProject: (slug) => set({ activeProject: slug }),
      getLayout: (slug) => get().layouts[slug] ?? defaultLayout,
      updateLayout: (slug, layouts) =>
        set((s) => ({ layouts: { ...s.layouts, [slug]: layouts } })),

      moveWidget: (slug, widgetId, col, row) =>
        set((s) => {
          const current = s.layouts[slug] ?? defaultLayout;
          const widgetIndex = current.findIndex((w) => w.id === widgetId);
          if (widgetIndex === -1) return s;

          const widget = current[widgetIndex];
          const updatedWidget = { ...widget, col, row };

          // Remove widget from current position
          const withoutWidget = current.filter((w) => w.id !== widgetId);

          // Calculate target index based on row and col
          let targetIndex = 0;
          for (let i = 0; i < withoutWidget.length; i++) {
            const w = withoutWidget[i];
            if (w.row < row || (w.row === row && w.col < col)) {
              targetIndex = i + 1;
            }
          }

          // Insert widget at new position
          const reordered = [
            ...withoutWidget.slice(0, targetIndex),
            updatedWidget,
            ...withoutWidget.slice(targetIndex),
          ];

          return { layouts: { ...s.layouts, [slug]: reordered } };
        }),

      moveWidgetToIndex: (slug, widgetId, newIndex) =>
        set((s) => {
          const current = s.layouts[slug] ?? defaultLayout;
          const widget = current.find((w) => w.id === widgetId);
          if (!widget) return s;

          // Remove widget from current position
          const withoutWidget = current.filter((w) => w.id !== widgetId);

          // Clamp newIndex to valid range
          const targetIndex = Math.max(0, Math.min(withoutWidget.length, newIndex));

          // Insert at new position
          const reordered = [
            ...withoutWidget.slice(0, targetIndex),
            widget,
            ...withoutWidget.slice(targetIndex),
          ];

          return { layouts: { ...s.layouts, [slug]: reordered } };
        }),

      resizeWidget: (slug, widgetId, colSpan, rowSpan) =>
        set((s) => updateWidget(s, slug, widgetId, (w) => ({ ...w, colSpan, rowSpan }))),

      toggleCollapse: (slug, widgetId) =>
        set((s) => updateWidget(s, slug, widgetId, (w) => ({ ...w, collapsed: !w.collapsed }))),

      toggleHidden: (slug, widgetId) =>
        set((s) => updateWidget(s, slug, widgetId, (w) => ({ ...w, hidden: !w.hidden }))),

      toggleLocked: (slug, widgetId) =>
        set((s) => updateWidget(s, slug, widgetId, (w) => ({ ...w, locked: !w.locked }))),

      setWidgetColSpan: (slug, widgetId, colSpan) =>
        set((s) => updateWidget(s, slug, widgetId, (w) => ({ ...w, colSpan, col: 1 }))),

      addWidget: (slug, type) =>
        set((s) => {
          const current = s.layouts[slug] ?? defaultLayout;
          const id = `w-${type}-${Date.now()}`;
          return {
            layouts: {
              ...s.layouts,
              [slug]: [...current, { id, type, col: 1, row: 99, colSpan: 1, rowSpan: 1, collapsed: false }],
            },
          };
        }),

      removeWidget: (slug, widgetId) =>
        set((s) => {
          const current = s.layouts[slug] ?? defaultLayout;
          return { layouts: { ...s.layouts, [slug]: current.filter((w) => w.id !== widgetId) } };
        }),

      resetLayout: (slug) =>
        set((s) => ({ layouts: { ...s.layouts, [slug]: defaultLayout } })),

      getColumns: (slug) => get().columns[slug] ?? 1,
      setColumns: (slug, cols) =>
        set((s) => ({ columns: { ...s.columns, [slug]: cols } })),
    }),
    {
      name: 'orchestra-dashboard-layout',
      version: 8,
      migrate: () => ({ layouts: {}, columns: {}, activeProject: null }),
    }
  )
);
