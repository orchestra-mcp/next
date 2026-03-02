import type { Meta, StoryObj } from '@storybook/react';
import { Topbar } from './Topbar';

const meta = {
  title: 'Desktop/Layout/Topbar',
  component: Topbar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    breadcrumb: {
      control: 'text',
      description: 'Breadcrumb text derived from the current route',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state: root path shows "Orchestra" */
export const Default: Story = {
  args: { breadcrumb: 'Orchestra' },
};

/** Panel route: shows the panel title */
export const WithPanel: Story = {
  args: { breadcrumb: 'Orchestra / Settings' },
};

/** Deep nested panel breadcrumb */
export const NestedPanel: Story = {
  args: { breadcrumb: 'Orchestra / Settings / Appearance' },
};
