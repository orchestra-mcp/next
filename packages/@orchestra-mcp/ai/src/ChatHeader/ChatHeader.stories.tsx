import type { Meta, StoryObj } from '@storybook/react';
import { ChatHeader } from './ChatHeader';

const meta = {
  title: 'AI/ChatHeader',
  component: ChatHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Chat',
  },
};

export const WithModel: Story = {
  args: {
    title: 'Chat',
    modelName: 'Claude Opus 4.6',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Chat',
    actions: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={{ fontSize: 12, padding: '2px 8px' }}>New</button>
        <button type="button" style={{ fontSize: 12, padding: '2px 8px' }}>Clear</button>
      </div>
    ),
  },
};

export const WithClose: Story = {
  args: {
    title: 'Chat',
    onClose: () => {},
    onMinimize: () => {},
  },
};

export const FullFeatured: Story = {
  args: {
    title: 'AI Assistant',
    modelName: 'Claude Opus 4.6',
    onClose: () => {},
    onMinimize: () => {},
    actions: (
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={{ fontSize: 12, padding: '2px 8px' }}>New Chat</button>
        <button type="button" style={{ fontSize: 12, padding: '2px 8px' }}>History</button>
      </div>
    ),
  },
};
