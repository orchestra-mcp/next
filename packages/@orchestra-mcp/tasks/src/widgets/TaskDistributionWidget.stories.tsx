import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { TaskDistributionWidget } from './TaskDistributionWidget';
import type { ChartDataPoint } from './TaskDistributionWidget';

const byStatus: ChartDataPoint[] = [
  { label: 'Backlog', value: 8, color: '#94a3b8' },
  { label: 'To Do', value: 12, color: '#eab308' },
  { label: 'In Progress', value: 5, color: '#3b82f6' },
  { label: 'Done', value: 22, color: '#22c55e' },
];

const byPriority: ChartDataPoint[] = [
  { label: 'Low', value: 10, color: '#22c55e' },
  { label: 'Medium', value: 15, color: '#eab308' },
  { label: 'High', value: 8, color: '#f97316' },
  { label: 'Critical', value: 3, color: '#ef4444' },
];

const byType: ChartDataPoint[] = [
  { label: 'Task', value: 28, color: '#3b82f6' },
  { label: 'Bug', value: 7, color: '#ef4444' },
  { label: 'Story', value: 5, color: '#8b5cf6' },
  { label: 'Hotfix', value: 2, color: '#f97316' },
];

const meta = {
  title: 'Tasks/TaskDistributionWidget',
  component: TaskDistributionWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskDistributionWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    byStatus,
    byPriority,
    byType,
    activeChart: 'status',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('task-distribution-widget')).toBeInTheDocument();
    await expect(canvas.getByText('Backlog')).toBeInTheDocument();
    await expect(canvas.getByText('Done')).toBeInTheDocument();
  },
};

export const ByPriority: Story = {
  args: {
    byStatus,
    byPriority,
    byType,
    activeChart: 'priority',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Low')).toBeInTheDocument();
    await expect(canvas.getByText('Critical')).toBeInTheDocument();
    const activeTab = canvas.getByTestId('tab-priority');
    await expect(activeTab.className).toContain('active');
  },
};
