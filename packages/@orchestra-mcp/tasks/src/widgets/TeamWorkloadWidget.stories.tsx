import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { TeamWorkloadWidget } from './TeamWorkloadWidget';
import type { TeamMember } from './TeamWorkloadWidget';

const sampleMembers: TeamMember[] = [
  { name: 'Alice Brown', assigned: 4, inProgress: 2, completed: 8 },
  { name: 'Bob Chen', assigned: 6, inProgress: 3, completed: 5 },
  { name: 'Carol Dev', assigned: 2, inProgress: 1, completed: 12 },
  { name: 'Dave Eng', assigned: 3, inProgress: 4, completed: 3, avatar: 'https://i.pravatar.cc/32?u=dave' },
];

const meta = {
  title: 'Tasks/TeamWorkloadWidget',
  component: TeamWorkloadWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TeamWorkloadWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    members: sampleMembers,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Alice Brown')).toBeInTheDocument();
    await expect(canvas.getByText('Bob Chen')).toBeInTheDocument();
    await expect(canvas.getByText('Carol Dev')).toBeInTheDocument();
    await expect(canvas.getByTestId('team-workload-legend')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    members: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('team-workload-empty')).toHaveTextContent('No team members');
  },
};
