import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { DashboardGrid } from './DashboardGrid';
import type { WidgetLayout } from '../stores/useDashboardStore';

const sampleWidgets: WidgetLayout[] = [
  { id: 'w-1', type: 'status-overview', col: 1, row: 1, colSpan: 4, rowSpan: 2, collapsed: false },
  { id: 'w-2', type: 'task-distribution', col: 5, row: 1, colSpan: 4, rowSpan: 2, collapsed: false },
  { id: 'w-3', type: 'sprint-progress', col: 9, row: 1, colSpan: 4, rowSpan: 2, collapsed: false },
  { id: 'w-4', type: 'backlog-tree', col: 1, row: 3, colSpan: 8, rowSpan: 4, collapsed: false },
  { id: 'w-5', type: 'recent-activity', col: 9, row: 3, colSpan: 4, rowSpan: 2, collapsed: false },
  { id: 'w-6', type: 'team-workload', col: 9, row: 5, colSpan: 4, rowSpan: 2, collapsed: false },
];

const renderWidget = (widget: WidgetLayout) => (
  <div
    style={{
      padding: '12px',
      background: 'var(--color-bg-surface, #1e293b)',
      borderRadius: '8px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-fg, #e2e8f0)',
      fontSize: '13px',
    }}
  >
    {widget.type} ({widget.id})
  </div>
);

const meta = {
  title: 'Tasks/DashboardGrid',
  component: DashboardGrid,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    widgets: sampleWidgets,
    renderWidget,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('dashboard-grid')).toBeInTheDocument();
    await expect(canvas.getByTestId('widget-w-1')).toBeInTheDocument();
    await expect(canvas.getByTestId('widget-w-6')).toBeInTheDocument();
  },
};

export const WithCollapsedWidget: Story = {
  args: {
    widgets: sampleWidgets.map((w) =>
      w.id === 'w-4' ? { ...w, collapsed: true } : w,
    ),
    renderWidget,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const collapsed = canvas.getByTestId('widget-w-4');
    await expect(collapsed.className).toContain('collapsed');
  },
};
