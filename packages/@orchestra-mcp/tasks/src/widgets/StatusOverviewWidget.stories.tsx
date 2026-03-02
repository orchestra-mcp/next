import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { StatusOverviewWidget } from './StatusOverviewWidget';
import type { StatusCount } from '../StatusGrid';

const sampleStatuses: StatusCount[] = [
  { status: 'backlog', label: 'Backlog', count: 8, color: '#94a3b8' },
  { status: 'todo', label: 'To Do', count: 12, color: '#eab308' },
  { status: 'in-progress', label: 'In Progress', count: 5, color: '#3b82f6' },
  { status: 'in-review', label: 'In Review', count: 3, color: '#a855f7' },
  { status: 'done', label: 'Done', count: 22, color: '#22c55e' },
];

const meta = {
  title: 'Tasks/StatusOverviewWidget',
  component: StatusOverviewWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusOverviewWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    statuses: sampleStatuses,
    totalTasks: 50,
    completionPercent: 44,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('50')).toBeInTheDocument();
    await expect(canvas.getByText('44%')).toBeInTheDocument();
  },
};

export const HighCompletion: Story = {
  args: {
    statuses: [
      { status: 'in-progress', label: 'In Progress', count: 2, color: '#3b82f6' },
      { status: 'done', label: 'Done', count: 48, color: '#22c55e' },
    ],
    totalTasks: 50,
    completionPercent: 96,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('96%')).toBeInTheDocument();
  },
};
