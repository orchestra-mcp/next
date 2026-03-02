import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

/**
 * Tooltip shows contextual info on hover/focus.
 * Supports placement, arrows, keyboard shortcuts, and rich content.
 */
const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: { control: 'number' },
    maxWidth: { control: 'text' },
    arrow: { control: 'boolean' },
    shortcut: { control: 'text' },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

const TriggerButton = ({ label = 'Hover me' }: { label?: string }) => (
  <button style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #666', cursor: 'pointer' }}>
    {label}
  </button>
);

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    placement: 'top',
    children: <TriggerButton />,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    placement: 'bottom',
    children: <TriggerButton />,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    placement: 'left',
    children: <TriggerButton />,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    placement: 'right',
    children: <TriggerButton />,
  },
};

export const WithArrow: Story = {
  args: {
    content: 'Arrow visible',
    arrow: true,
    children: <TriggerButton />,
  },
};

export const WithShortcut: Story = {
  args: {
    content: 'Quick open',
    shortcut: 'Cmd+K',
    children: <TriggerButton label="Command Palette" />,
  },
};

export const RichContent: Story = {
  args: {
    content: (
      <span>
        <strong>Bold</strong> and <em>italic</em> content
      </span>
    ),
    children: <TriggerButton label="Rich tooltip" />,
  },
};

export const AllPlacements: Story = {
  args: {
    content: 'Tooltip',
    children: <TriggerButton />,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 40, padding: 60, flexWrap: 'wrap' }}>
      <Tooltip content="Top" placement="top">
        <TriggerButton label="Top" />
      </Tooltip>
      <Tooltip content="Bottom" placement="bottom">
        <TriggerButton label="Bottom" />
      </Tooltip>
      <Tooltip content="Left" placement="left">
        <TriggerButton label="Left" />
      </Tooltip>
      <Tooltip content="Right" placement="right">
        <TriggerButton label="Right" />
      </Tooltip>
    </div>
  ),
};
