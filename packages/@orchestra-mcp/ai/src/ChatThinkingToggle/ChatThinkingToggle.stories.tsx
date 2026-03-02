import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatThinkingToggle } from './ChatThinkingToggle';

const meta = {
  title: 'AI/ChatThinkingToggle',
  component: ChatThinkingToggle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatThinkingToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    enabled: true,
    onChange: () => {},
  },
};

export const Off: Story = {
  args: {
    enabled: false,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    enabled: false,
    onChange: () => {},
  },
  render: (args) => {
    const [enabled, setEnabled] = useState(args.enabled);
    return (
      <ChatThinkingToggle
        {...args}
        enabled={enabled}
        onChange={setEnabled}
      />
    );
  },
};

export const CustomLabel: Story = {
  args: {
    enabled: true,
    onChange: () => {},
    label: 'Extended Thinking',
  },
};
