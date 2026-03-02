import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessageActions } from './ChatMessageActions';
import type { MessageAction } from '../types/message';

const sampleActions: MessageAction[] = [
  {
    id: 'copy',
    label: 'Copy',
    icon: <span style={{ fontSize: 14 }}>C</span>,
    onClick: () => {},
  },
  {
    id: 'retry',
    label: 'Retry',
    icon: <span style={{ fontSize: 14 }}>R</span>,
    onClick: () => {},
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <span style={{ fontSize: 14 }}>D</span>,
    onClick: () => {},
  },
];

const meta = {
  title: 'AI/ChatMessageActions',
  component: ChatMessageActions,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatMessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  args: {
    messageId: 'msg-1',
    actions: sampleActions,
    visible: true,
  },
};

export const Hidden: Story = {
  args: {
    messageId: 'msg-1',
    actions: sampleActions,
    visible: false,
  },
};
