import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { BacklogTreeWidget } from './BacklogTreeWidget';
import type { TreeNode } from './BacklogTreeWidget';

const sampleTree: TreeNode[] = [
  {
    id: 'epic-auth',
    title: 'Authentication',
    type: 'epic',
    status: 'in-progress',
    priority: 'high',
    children: [
      {
        id: 'story-login',
        title: 'Login Flow',
        type: 'story',
        status: 'in-progress',
        children: [
          { id: 'task-form', title: 'Build login form', type: 'task', status: 'done', priority: 'high' },
          { id: 'task-validate', title: 'Add validation', type: 'task', status: 'todo', priority: 'medium' },
          { id: 'bug-csrf', title: 'CSRF token missing', type: 'bug', status: 'todo', priority: 'critical' },
        ],
      },
      {
        id: 'story-oauth',
        title: 'OAuth Integration',
        type: 'story',
        status: 'backlog',
        children: [
          { id: 'task-google', title: 'Google OAuth', type: 'task', status: 'backlog' },
          { id: 'task-github', title: 'GitHub OAuth', type: 'task', status: 'backlog' },
        ],
      },
    ],
  },
  {
    id: 'epic-dashboard',
    title: 'Dashboard',
    type: 'epic',
    status: 'backlog',
    children: [
      { id: 'story-widgets', title: 'Widget System', type: 'story', status: 'backlog' },
    ],
  },
  {
    id: 'hotfix-deploy',
    title: 'Fix deployment script',
    type: 'hotfix',
    status: 'todo',
    priority: 'critical',
  },
];

const meta = {
  title: 'Tasks/BacklogTreeWidget',
  component: BacklogTreeWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BacklogTreeWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tree: sampleTree,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Authentication')).toBeInTheDocument();
    await expect(canvas.getByText('Dashboard')).toBeInTheDocument();
    await expect(canvas.getByText('Fix deployment script')).toBeInTheDocument();
  },
};

export const WithExpanded: Story = {
  args: {
    tree: sampleTree,
    expandedNodes: new Set(['epic-auth', 'story-login']),
    selectedNode: 'task-form',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Login Flow')).toBeInTheDocument();
    await expect(canvas.getByText('Build login form')).toBeInTheDocument();
    await expect(canvas.getByText('Add validation')).toBeInTheDocument();
    const selected = canvas.getByTestId('tree-node-task-form');
    await expect(selected.className).toContain('selected');
  },
};

export const Empty: Story = {
  args: {
    tree: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('backlog-tree-empty')).toBeInTheDocument();
  },
};
