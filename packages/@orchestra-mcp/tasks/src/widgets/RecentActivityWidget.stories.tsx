import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { RecentActivityWidget } from './RecentActivityWidget';
import type { ActivityItem } from './RecentActivityWidget';

const now = new Date();

const sampleActivities: ActivityItem[] = [
  {
    id: 'a1',
    type: 'created',
    issueId: 'task-1',
    issueTitle: 'Build login form',
    actor: 'Alice',
    timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    provider: 'local',
  },
  {
    id: 'a2',
    type: 'completed',
    issueId: 'task-2',
    issueTitle: 'Setup CI pipeline',
    actor: 'Bob',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    provider: 'github',
    detail: 'Merged PR #42',
  },
  {
    id: 'a3',
    type: 'commented',
    issueId: 'bug-1',
    issueTitle: 'Fix CSRF token',
    actor: 'Carol',
    timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    provider: 'jira',
    detail: 'Added reproduction steps',
  },
  {
    id: 'a4',
    type: 'updated',
    issueId: 'story-1',
    issueTitle: 'OAuth Integration',
    timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a5',
    type: 'synced',
    issueId: 'epic-1',
    issueTitle: 'Authentication Epic',
    timestamp: new Date(now.getTime() - 30 * 1000).toISOString(),
    provider: 'linear',
  },
];

const meta = {
  title: 'Tasks/RecentActivityWidget',
  component: RecentActivityWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecentActivityWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activities: sampleActivities,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Build login form')).toBeInTheDocument();
    await expect(canvas.getByText('Setup CI pipeline')).toBeInTheDocument();
    await expect(canvas.getByText('Fix CSRF token')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('recent-activity-empty')).toBeInTheDocument();
  },
};
