import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';

/**
 * Popover component displays a floating panel next to a trigger element.
 * - Click the trigger to toggle visibility
 * - Supports top/bottom/left/right positioning
 * - Closes on outside click or Escape key
 */
const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position relative to the trigger',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <span>Click me</span>,
    content: <span>Popover content</span>,
    position: 'bottom',
  },
};

export const Top: Story = {
  args: {
    trigger: <span>Open top</span>,
    content: <span>Top popover</span>,
    position: 'top',
  },
  decorators: [
    (Story) => (
      <div style={{ marginTop: 120 }}>
        <Story />
      </div>
    ),
  ],
};

export const Left: Story = {
  args: {
    trigger: <span>Open left</span>,
    content: <span>Left popover</span>,
    position: 'left',
  },
  decorators: [
    (Story) => (
      <div style={{ marginLeft: 260 }}>
        <Story />
      </div>
    ),
  ],
};

export const Right: Story = {
  args: {
    trigger: <span>Open right</span>,
    content: <span>Right popover</span>,
    position: 'right',
  },
};

export const WithForm: Story = {
  args: {
    trigger: <span>Edit settings</span>,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label>
          Name
          <input
            type="text"
            placeholder="Enter name"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            placeholder="Enter email"
            style={{ display: 'block', width: '100%', marginTop: 4 }}
          />
        </label>
        <button type="button">Save</button>
      </div>
    ),
    position: 'bottom',
  },
};
