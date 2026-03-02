import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types/message';
import type { BashEvent, EditEvent } from '../types/events';

const meta = {
  title: 'AI/ChatMessage',
  component: ChatMessage,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const userMessage: ChatMessageType = {
  id: 'msg-1',
  role: 'user',
  content: 'Can you help me refactor this component to use TypeScript generics?',
  timestamp: new Date().toISOString(),
};

const assistantMessage: ChatMessageType = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Sure! I can help you refactor the component. Let me take a look at the current implementation and suggest improvements using TypeScript generics for better type safety.',
  timestamp: new Date().toISOString(),
};

const systemMessage: ChatMessageType = {
  id: 'msg-3',
  role: 'system',
  content: 'Session started. Claude Opus 4.6 is ready.',
  timestamp: new Date().toISOString(),
};

export const UserMessage: Story = {
  args: {
    message: userMessage,
    senderName: 'You',
  },
};

export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
    senderName: 'Claude',
  },
};

export const SystemMessage: Story = {
  args: {
    message: systemMessage,
  },
};

export const WithMarkdown: Story = {
  args: {
    message: {
      id: 'msg-md',
      role: 'assistant',
      content: [
        '## Refactored Component',
        '',
        'Here is the updated implementation using **TypeScript generics**:',
        '',
        '```tsx',
        'interface ListProps<T> {',
        '  items: T[];',
        '  renderItem: (item: T) => ReactNode;',
        '}',
        '',
        'export function List<T>({ items, renderItem }: ListProps<T>) {',
        '  return <ul>{items.map(renderItem)}</ul>;',
        '}',
        '```',
        '',
        'Key changes:',
        '- Added generic type parameter `T`',
        '- Used `renderItem` callback for flexibility',
        '- Removed hardcoded item type',
      ].join('\n'),
      timestamp: new Date().toISOString(),
    },
    senderName: 'Claude',
    renderMarkdown: true,
  },
};

export const WithThinking: Story = {
  args: {
    message: {
      id: 'msg-think',
      role: 'assistant',
      content: 'I have analyzed the codebase and here is my recommendation for the refactor.',
      thinking: 'Let me analyze the component structure. The current implementation uses `any` types in several places. I should suggest using generics to make the component type-safe while keeping it flexible. The key areas to refactor are the props interface and the render callback.',
      timestamp: new Date().toISOString(),
    },
    senderName: 'Claude',
  },
};

export const Streaming: Story = {
  args: {
    message: {
      id: 'msg-stream',
      role: 'assistant',
      content: 'I am currently analyzing your codebase to find the best approach for',
      streaming: true,
      timestamp: new Date().toISOString(),
    },
    senderName: 'Claude',
  },
};

const sampleBashEvent: BashEvent = {
  id: 'evt-1',
  type: 'bash',
  command: 'npm run test -- --coverage',
  output: 'Tests: 42 passed, 0 failed\nCoverage: 94.2%',
  exitCode: 0,
  cwd: '/Users/dev/project',
  timestamp: new Date().toISOString(),
};

const sampleEditEvent: EditEvent = {
  id: 'evt-2',
  type: 'edit',
  filePath: 'src/components/List.tsx',
  language: 'tsx',
  original: 'interface ListProps {\n  items: any[];\n}',
  modified: 'interface ListProps<T> {\n  items: T[];\n}',
  timestamp: new Date().toISOString(),
};

export const WithEvents: Story = {
  args: {
    message: {
      id: 'msg-events',
      role: 'assistant',
      content: 'I have made the following changes to improve type safety:',
      events: [sampleBashEvent, sampleEditEvent],
      timestamp: new Date().toISOString(),
    },
    senderName: 'Claude',
  },
};
