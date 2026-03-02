import type { Meta, StoryObj } from '@storybook/react';
import { TaskList } from './TaskList';
import type { TaskItem } from './TaskList';

const meta: Meta<typeof TaskList> = {
  title: 'Tasks/TaskList',
  component: TaskList,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof TaskList>;

const statusConfig: Record<string, { label: string; color: string }> = {
  'backlog': { label: 'Backlog', color: '#6b7280' },
  'todo': { label: 'To Do', color: '#3b82f6' },
  'in-progress': { label: 'In Progress', color: '#8b5cf6' },
  'blocked': { label: 'Blocked', color: '#ef4444' },
  'in-testing': { label: 'In Testing', color: '#f97316' },
  'in-review': { label: 'In Review', color: '#a855f7' },
};

const items: TaskItem[] = [
  { id: 'OF-176', title: 'Define ContentScript interface', status: 'backlog', type: 'task', priority: 'high' },
  { id: 'OF-177', title: 'Build ContentScriptManager', status: 'backlog', type: 'task', priority: 'high' },
  { id: 'OF-206', title: 'Design Explorer plugin architecture and manifest', status: 'backlog', type: 'task', priority: 'critical' },
  { id: 'BUG-42', title: 'Fix theme sync race condition', status: 'in-progress', type: 'bug', priority: 'high' },
  { id: 'OF-350', title: 'Implement drag-and-drop file upload', status: 'in-testing', type: 'task', priority: 'medium' },
  { id: 'OF-351', title: 'Add keyboard shortcuts for panel navigation', status: 'in-review', type: 'task', priority: 'low' },
];

export const Default: Story = {
  args: { items, statusConfig },
};

export const WithDescriptions: Story = {
  args: {
    items: items.map((item) => ({
      ...item,
      description: `This is the description for ${item.title}`,
    })),
    statusConfig,
  },
};

export const Empty: Story = {
  args: { items: [], statusConfig, emptyMessage: 'No tasks match this filter' },
};

export const BugsOnly: Story = {
  args: {
    items: [
      { id: 'BUG-42', title: 'Fix theme sync race condition', status: 'in-progress', type: 'bug', priority: 'high' },
      { id: 'BUG-43', title: 'Desktop window cleanup on close', status: 'blocked', type: 'bug', priority: 'critical' },
    ],
    statusConfig,
  },
};
