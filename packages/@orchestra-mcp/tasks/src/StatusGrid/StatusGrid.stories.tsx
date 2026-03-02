import type { Meta, StoryObj } from '@storybook/react';
import { StatusGrid } from './StatusGrid';
import type { StatusCount } from './StatusGrid';

const meta: Meta<typeof StatusGrid> = {
  title: 'Tasks/StatusGrid',
  component: StatusGrid,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof StatusGrid>;

const items: StatusCount[] = [
  { status: 'done', label: 'Done', count: 260, color: '#22c55e' },
  { status: 'backlog', label: 'Backlog', count: 11, color: '#6b7280' },
  { status: 'in-progress', label: 'In Progress', count: 5, color: '#8b5cf6' },
  { status: 'todo', label: 'To Do', count: 3, color: '#3b82f6' },
  { status: 'blocked', label: 'Blocked', count: 2, color: '#ef4444' },
  { status: 'in-testing', label: 'In Testing', count: 0, color: '#f97316' },
  { status: 'in-review', label: 'In Review', count: 0, color: '#a855f7' },
];

export const Default: Story = {
  args: { items },
};

export const WithActiveFilter: Story = {
  args: { items, activeStatus: 'in-progress' },
};

export const Empty: Story = {
  args: { items: [] },
};

export const AllZero: Story = {
  args: {
    items: [
      { status: 'backlog', label: 'Backlog', count: 0, color: '#6b7280' },
      { status: 'todo', label: 'To Do', count: 0, color: '#3b82f6' },
      { status: 'in-progress', label: 'In Progress', count: 0, color: '#8b5cf6' },
    ],
  },
};
