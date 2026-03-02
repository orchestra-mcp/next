import type { Meta, StoryObj } from '@storybook/react';
import type { TaskEvent } from '../types/events';
import { TaskCard } from './TaskCard';

const meta = {
  title: 'AI/Cards/TaskCard',
  component: TaskCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    event: {
      id: '1',
      type: 'task',
      title: 'Set up project scaffolding',
      status: 'pending',
    } satisfies TaskEvent,
  },
};

export const InProgress: Story = {
  args: {
    event: {
      id: '2',
      type: 'task',
      title: 'Implement authentication flow',
      status: 'in_progress',
    } satisfies TaskEvent,
  },
};

export const Completed: Story = {
  args: {
    event: {
      id: '3',
      type: 'task',
      title: 'Write unit tests for API client',
      status: 'completed',
    } satisfies TaskEvent,
  },
};

export const WithDescription: Story = {
  args: {
    event: {
      id: '4',
      type: 'task',
      title: 'Refactor state management',
      status: 'in_progress',
      description: 'Migrate from Redux to Zustand for simpler state management across all stores.',
    } satisfies TaskEvent,
  },
};
