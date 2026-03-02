import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ChatBox } from './ChatBox';
import type { ChatMessage } from './ChatBox';
import { DEFAULT_MODELS } from '../types/models';
import type { QuickAction, StartupPrompt, MessageAction } from '../types/message';

const sampleMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Can you explain how hooks work?', timestamp: '10:30 AM' },
  { id: '2', role: 'assistant', content: 'React hooks let you use state and lifecycle features in functional components. The most common ones are useState and useEffect.', timestamp: '10:30 AM' },
  { id: '3', role: 'user', content: 'What about custom hooks?', timestamp: '10:31 AM' },
  { id: '4', role: 'assistant', content: 'Custom hooks are functions starting with "use" that let you extract and reuse stateful logic between components.', timestamp: '10:31 AM' },
];

const systemMessages: ChatMessage[] = [
  { id: '1', role: 'system', content: 'Session started' },
  { id: '2', role: 'user', content: 'Hello!' },
  { id: '3', role: 'system', content: 'Assistant is now available' },
  { id: '4', role: 'assistant', content: 'Hi! How can I help you today?' },
];

const sampleQuickActions: QuickAction[] = [
  { id: 'explain', label: 'Explain code', prompt: 'Explain the selected code' },
  { id: 'refactor', label: 'Refactor', prompt: 'Refactor this code' },
  { id: 'tests', label: 'Write tests', prompt: 'Write unit tests' },
  { id: 'docs', label: 'Add docs', prompt: 'Add documentation' },
];

const sampleStartupPrompts: StartupPrompt[] = [
  { id: 'explain', title: 'Explain this project', description: 'Get an overview of the codebase', prompt: 'Explain the architecture' },
  { id: 'bug', title: 'Fix a bug', description: 'Debug and fix an issue', prompt: 'Help me fix a bug' },
  { id: 'feature', title: 'Build a feature', description: 'Implement something new', prompt: 'Help me build a feature' },
  { id: 'refactor', title: 'Refactor code', description: 'Improve code quality', prompt: 'Help me refactor' },
];

const sampleMessageActions: MessageAction[] = [
  { id: 'copy', label: 'Copy', icon: <span>C</span>, onClick: () => {} },
  { id: 'retry', label: 'Retry', icon: <span>R</span>, onClick: () => {} },
];

/**
 * ChatBox provides an AI chat interface with message bubbles,
 * typing indicator, and input area. Supports 25 color themes
 * and 3 component variants (default/compact/modern).
 */
const meta = {
  title: 'AI/ChatBox',
  component: ChatBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    typing: {
      control: 'boolean',
      description: 'Show typing indicator',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480, height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    messages: sampleMessages.slice(0, 2),
    onSend: () => {},
    placeholder: 'Type a message...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chatbox = canvas.getByTestId('chatbox');
    await expect(chatbox).toBeInTheDocument();
  },
};

export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    onSend: () => {},
  },
};

export const Typing: Story = {
  args: {
    messages: sampleMessages,
    onSend: () => {},
    typing: true,
  },
};

export const Disabled: Story = {
  args: {
    messages: sampleMessages,
    onSend: () => {},
    disabled: true,
  },
};

export const SystemMessages: Story = {
  args: {
    messages: systemMessages,
    onSend: () => {},
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    onSend: () => {},
  },
};

export const FullFeatured: Story = {
  args: {
    messages: sampleMessages,
    onSend: () => {},
    title: 'AI Assistant',
    onClose: () => {},
    onMinimize: () => {},
    models: DEFAULT_MODELS,
    selectedModelId: 'claude-opus-4-6',
    onModelChange: () => {},
    mode: 'auto',
    onModeChange: () => {},
    showThinking: true,
    onThinkingToggle: () => {},
    quickActions: sampleQuickActions,
    messageActions: sampleMessageActions,
    userName: 'Developer',
    assistantName: 'Claude',
  },
};

export const WithStartupPrompts: Story = {
  args: {
    messages: [],
    onSend: () => {},
    title: 'AI Assistant',
    startupPrompts: sampleStartupPrompts,
    models: DEFAULT_MODELS,
    selectedModelId: 'claude-opus-4-6',
    onModelChange: () => {},
  },
};
