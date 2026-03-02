import type { Meta, StoryObj } from '@storybook/react';
import { StatusBar } from './StatusBar';

const meta = {
  title: 'Desktop/Layout/StatusBar',
  component: StatusBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    loadedCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of loaded plugins',
    },
    notificationCount: {
      control: { type: 'number', min: 0 },
      description: 'Active notification count',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Zero plugins, no notifications */
export const Default: Story = {
  args: { loadedCount: 0, notificationCount: 0 },
};

/** Five plugins loaded, no notifications */
export const WithPlugins: Story = {
  args: { loadedCount: 5, notificationCount: 0 },
};

/** Three active notifications with bell icon */
export const WithNotifications: Story = {
  args: { loadedCount: 5, notificationCount: 3 },
};
