import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { SprintProgressWidget } from './SprintProgressWidget';
import type { SprintData } from './SprintProgressWidget';

const activeSprint: SprintData = {
  name: 'Sprint 7',
  startDate: '2026-02-10',
  endDate: '2026-02-24',
  totalPoints: 34,
  completedPoints: 18,
  totalTasks: 12,
  completedTasks: 7,
};

const meta = {
  title: 'Tasks/SprintProgressWidget',
  component: SprintProgressWidget,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SprintProgressWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sprint: activeSprint,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sprint 7')).toBeInTheDocument();
    await expect(canvas.getByText('18/34')).toBeInTheDocument();
    await expect(canvas.getByText('7/12')).toBeInTheDocument();
  },
};

export const NoSprint: Story = {
  args: {
    sprint: null,
    noSprintMessage: 'No active sprint — create one to get started',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('sprint-progress-empty')).toHaveTextContent(
      'No active sprint',
    );
  },
};
