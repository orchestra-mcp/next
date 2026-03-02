import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { BacklogView } from './BacklogView';
import type { BacklogColumn } from './BacklogView';

const sampleColumns: BacklogColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#6366f1',
    cards: [
      { id: '1', title: 'Research competitors', type: 'task' },
      { id: '2', title: 'Write PRD', type: 'story' },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    color: '#eab308',
    cards: [
      { id: '3', title: 'Build login page', type: 'task', tags: ['frontend'] },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#22c55e',
    cards: [
      { id: '4', title: 'Setup CI', type: 'task' },
    ],
  },
];

const meta = {
  title: 'Tasks/BacklogView',
  component: BacklogView,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    compact: { control: 'boolean', description: 'Enable compact mode' },
  },
} satisfies Meta<typeof BacklogView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { columns: sampleColumns },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Backlog')).toBeInTheDocument();
    await expect(canvas.getByText('To Do')).toBeInTheDocument();
    await expect(canvas.getByText('Done')).toBeInTheDocument();
  },
};

export const WithPriorities: Story = {
  args: {
    columns: [
      {
        id: 'col',
        title: 'Prioritized',
        cards: [
          { id: 'p1', title: 'Low task', priority: 'low' },
          { id: 'p2', title: 'Medium task', priority: 'medium' },
          { id: 'p3', title: 'High task', priority: 'high' },
          { id: 'p4', title: 'Critical bug', priority: 'critical', type: 'bug' },
        ],
      },
    ],
  },
};

export const WithAssignees: Story = {
  args: {
    columns: [
      {
        id: 'team',
        title: 'Team Board',
        cards: [
          { id: 'a1', title: 'API design', assignee: 'Alice Brown', type: 'task' },
          { id: 'a2', title: 'DB schema', assignee: 'Bob Chen', type: 'task' },
          { id: 'a3', title: 'Auth flow', assignee: 'Carol Dev', type: 'story', tags: ['auth'] },
        ],
      },
    ],
  },
};

export const EmptyColumns: Story = {
  args: {
    columns: [
      { id: 'e1', title: 'To Do', cards: [], color: '#eab308' },
      { id: 'e2', title: 'In Progress', cards: [], color: '#3b82f6' },
      { id: 'e3', title: 'Done', cards: [], color: '#22c55e' },
    ],
  },
};

export const CompactMode: Story = {
  args: { columns: sampleColumns, compact: true },
};
