import type { Meta, StoryObj } from '@storybook/react';
import { PanelNotFound } from './PanelNotFound';

const meta = {
  title: 'Desktop/Panels/PanelNotFound',
  component: PanelNotFound,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    route: { control: 'text', description: 'The panel route that was not found' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelNotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { route: '/panels/unknown' },
};

export const DeepRoute: Story = {
  args: { route: '/panels/extensions/marketplace/details' },
};
