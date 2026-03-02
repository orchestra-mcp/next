import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatModeSelector } from './ChatModeSelector';
import type { ChatMode } from '../types/models';

const meta = {
  title: 'AI/ChatModeSelector',
  component: ChatModeSelector,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatModeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Auto: Story = {
  args: {
    mode: 'auto',
    onChange: () => {},
  },
};

export const Plan: Story = {
  args: {
    mode: 'plan',
    onChange: () => {},
  },
};

export const Manual: Story = {
  args: {
    mode: 'manual',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    mode: 'auto',
    onChange: () => {},
  },
  render: (args) => {
    const [mode, setMode] = useState<ChatMode>(args.mode);
    return (
      <ChatModeSelector
        {...args}
        mode={mode}
        onChange={setMode}
      />
    );
  },
};
