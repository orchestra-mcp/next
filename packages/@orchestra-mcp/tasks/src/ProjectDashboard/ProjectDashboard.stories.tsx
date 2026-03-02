import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ProjectDashboard } from './ProjectDashboard';

const defaultArgs = {
  slug: 'orchestra-mcp',
  name: 'Orchestra MCP',
  tree: [
    {
      id: 'epic-1',
      title: 'Authentication',
      type: 'epic' as const,
      status: 'in-progress',
      description: 'Implement full authentication with OAuth and session management.',
      children: [
        {
          id: 'story-1',
          title: 'Login Flow',
          type: 'story' as const,
          status: 'in-progress',
          children: [
            { id: 'task-1', title: 'Build login form', type: 'task' as const, status: 'done', priority: 'high' },
            { id: 'task-2', title: 'Add validation', type: 'task' as const, status: 'todo', priority: 'medium' },
          ],
        },
      ],
    },
    {
      id: 'epic-2',
      title: 'Dashboard',
      type: 'epic' as const,
      status: 'backlog',
      description: 'Build the main project dashboard.',
    },
  ],
  statuses: [
    { status: 'backlog', label: 'Backlog', count: 5, color: '#94a3b8' },
    { status: 'todo', label: 'To Do', count: 8, color: '#eab308' },
    { status: 'in-progress', label: 'In Progress', count: 4, color: '#3b82f6' },
    { status: 'done', label: 'Done', count: 15, color: '#22c55e' },
  ],
  totalTasks: 32,
  completionPercent: 47,
  epicCount: 5,
  storyCount: 12,
  doneTasks: 15,
  activeTasks: [],
};

const meta = {
  title: 'Tasks/ProjectDashboard',
  component: ProjectDashboard,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: defaultArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Orchestra MCP')).toBeInTheDocument();
    await expect(canvas.getByTestId('project-dashboard')).toBeInTheDocument();
  },
};

export const WithSelectedTask: Story = {
  args: defaultArgs,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('project-dashboard')).toBeInTheDocument();
    await expect(canvas.getByTestId('dashboard-header')).toBeInTheDocument();
  },
};
