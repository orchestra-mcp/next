import type { Meta, StoryObj } from '@storybook/react';
import type { TodoListEvent } from '../types/events';
import { TodoListCard } from './TodoListCard';

const meta = {
  title: 'AI/Cards/TodoListCard',
  component: TodoListCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TodoListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    event: {
      id: '1',
      type: 'todo_list',
      items: [
        { content: 'Read existing card components', status: 'completed' },
        { content: 'Write Storybook stories', status: 'in_progress' },
        { content: 'Run vitest suite', status: 'pending' },
        { content: 'Update component exports', status: 'pending' },
        { content: 'Deploy to staging', status: 'pending' },
      ],
    } satisfies TodoListEvent,
  },
};

export const AllCompleted: Story = {
  args: {
    event: {
      id: '2',
      type: 'todo_list',
      items: [
        { content: 'Initialize project', status: 'completed' },
        { content: 'Install dependencies', status: 'completed' },
        { content: 'Configure linting', status: 'completed' },
        { content: 'Set up CI pipeline', status: 'completed' },
        { content: 'Write documentation', status: 'completed' },
      ],
    } satisfies TodoListEvent,
  },
};

export const AllPending: Story = {
  args: {
    event: {
      id: '3',
      type: 'todo_list',
      items: [
        { content: 'Design database schema', status: 'pending' },
        { content: 'Create migration files', status: 'pending' },
        { content: 'Build CRUD endpoints', status: 'pending' },
        { content: 'Add validation middleware', status: 'pending' },
        { content: 'Write integration tests', status: 'pending' },
      ],
    } satisfies TodoListEvent,
  },
};

export const Mixed: Story = {
  args: {
    event: {
      id: '4',
      type: 'todo_list',
      timestamp: '14:22:08',
      items: [
        { content: 'Set up monorepo structure', status: 'completed' },
        { content: 'Configure Turborepo', status: 'completed' },
        { content: 'Build shared types package', status: 'completed' },
        { content: 'Implement API client', status: 'in_progress' },
        { content: 'Create Zustand stores', status: 'pending' },
      ],
    } satisfies TodoListEvent,
  },
};
