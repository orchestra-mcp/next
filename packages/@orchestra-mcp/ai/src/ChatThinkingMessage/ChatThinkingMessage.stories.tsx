import type { Meta, StoryObj } from '@storybook/react';
import { ChatThinkingMessage } from './ChatThinkingMessage';

const meta = {
  title: 'AI/ChatThinkingMessage',
  component: ChatThinkingMessage,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatThinkingMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const thinkingContent = [
  'The user wants to refactor a React component to use TypeScript generics.',
  'I should analyze the current props interface and identify where `any` types are used.',
  'The key change will be adding a generic type parameter to the component and its props.',
  'I also need to ensure backward compatibility for existing consumers.',
].join('\n');

export const Default: Story = {
  args: {
    content: thinkingContent,
  },
};

export const Expanded: Story = {
  args: {
    content: thinkingContent,
    defaultExpanded: true,
  },
};

export const Streaming: Story = {
  args: {
    content: 'The user wants to refactor a React component. Let me think about the best approach for',
    streaming: true,
  },
};

export const CustomLabel: Story = {
  args: {
    content: thinkingContent,
    label: 'Reasoning (extended)',
    defaultExpanded: true,
  },
};
