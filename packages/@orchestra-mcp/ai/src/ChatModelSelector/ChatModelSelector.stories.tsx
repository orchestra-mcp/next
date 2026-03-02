import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatModelSelector } from './ChatModelSelector';
import { DEFAULT_MODELS } from '../types/models';

const meta = {
  title: 'AI/ChatModelSelector',
  component: ChatModelSelector,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    models: DEFAULT_MODELS,
    selectedModelId: 'claude-opus-4-6',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  args: {
    models: DEFAULT_MODELS,
    selectedModelId: 'claude-opus-4-6',
    onChange: () => {},
  },
  render: (args) => {
    const [selectedId, setSelectedId] = useState(args.selectedModelId);
    return (
      <ChatModelSelector
        {...args}
        selectedModelId={selectedId}
        onChange={setSelectedId}
      />
    );
  },
};
