import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput } from './ChatInput';

const meta = {
  title: 'AI/ChatInput',
  component: ChatInput,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    onSend: () => {},
    placeholder: 'Type a message...',
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithPrefix: Story = {
  args: {
    value: '',
    onChange: () => {},
    onSend: () => {},
    prefix: (
      <div style={{ display: 'flex', gap: 4 }}>
        <span style={{ background: 'var(--color-surface-2, #e5e7eb)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>@file.ts</span>
        <span style={{ background: 'var(--color-surface-2, #e5e7eb)', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>#context</span>
      </div>
    ),
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    onChange: () => {},
    onSend: () => {},
    disabled: true,
    placeholder: 'Chat is disabled...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'How do I implement a Zustand store with TypeScript?',
    onChange: () => {},
    onSend: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
      />
    );
  },
};
