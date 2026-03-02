import type { Meta, StoryObj } from '@storybook/react';
import type { OrchestraEvent } from '../types/events';
import { OrchestraCard } from './OrchestraCard';

const meta = {
  title: 'AI/Cards/OrchestraCard',
  component: OrchestraCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrchestraCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Epic: Story = {
  args: {
    event: {
      id: 'e-1',
      type: 'orchestra',
      issueType: 'epic',
      issueId: 'EPIC-1',
      title: 'Design System Foundation',
      status: 'in-progress',
      priority: 'high',
    } satisfies OrchestraEvent,
  },
};

export const OrchestraStory: Story = {
  name: 'Story',
  args: {
    event: {
      id: 's-1',
      type: 'orchestra',
      issueType: 'story',
      issueId: 'STORY-14',
      title: 'As a developer I want reusable card components so that event rendering is consistent',
      status: 'in-progress',
      priority: 'medium',
    } satisfies OrchestraEvent,
  },
};

export const Task: Story = {
  args: {
    event: {
      id: 't-1',
      type: 'orchestra',
      issueType: 'task',
      issueId: 'TASK-87',
      title: 'Implement BashCard component',
      status: 'done',
      priority: 'medium',
    } satisfies OrchestraEvent,
  },
};

export const Bug: Story = {
  args: {
    event: {
      id: 'b-1',
      type: 'orchestra',
      issueType: 'bug',
      issueId: 'BUG-23',
      title: 'GrepCard crashes when matches array is empty',
      status: 'todo',
      priority: 'critical',
    } satisfies OrchestraEvent,
  },
};

export const Hotfix: Story = {
  args: {
    event: {
      id: 'h-1',
      type: 'orchestra',
      issueType: 'hotfix',
      issueId: 'HOT-5',
      title: 'Fix production WebSocket disconnect on idle timeout',
      status: 'in-review',
      priority: 'critical',
    } satisfies OrchestraEvent,
  },
};
