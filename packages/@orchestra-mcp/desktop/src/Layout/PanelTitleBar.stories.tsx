import type { Meta, StoryObj } from '@storybook/react';
import { PanelTitleBar } from './PanelTitleBar';

const meta = {
  title: 'Desktop/Panels/PanelTitleBar',
  component: PanelTitleBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Panel window title' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelTitleBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'Settings' },
};

export const LongTitle: Story = {
  args: { title: 'Orchestra / Extensions / Marketplace' },
};
