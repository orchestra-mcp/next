import type { Meta, StoryObj } from '@storybook/react';
import { ChatStreamMessage } from './ChatStreamMessage';

const meta = {
  title: 'AI/ChatStreamMessage',
  component: ChatStreamMessage,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatStreamMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Streaming: Story = {
  args: {
    content: 'I am currently analyzing your codebase to find the best approach for implementing',
    streaming: true,
  },
};

export const Complete: Story = {
  args: {
    content: 'The refactoring is complete. I have updated the component to use TypeScript generics, which provides better type safety and inference for consumers of the API.',
    streaming: false,
  },
};

export const WithMarkdown: Story = {
  args: {
    content: [
      'Here is the updated code:',
      '',
      '```typescript',
      'export function useQuery<T>(key: string): T {',
      '  return cache.get(key) as T;',
      '}',
      '```',
      '',
      'This provides **full type inference** at the call site.',
    ].join('\n'),
    streaming: false,
    renderMarkdown: true,
  },
};
