import type { Meta, StoryObj } from '@storybook/react';
import { ChatBody } from './ChatBody';

const meta = {
  title: 'AI/ChatBody',
  component: ChatBody,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480, height: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <div style={{ padding: '8px 12px', background: 'var(--color-surface-2, #f3f4f6)', borderRadius: 8, marginBottom: 8, alignSelf: 'flex-end' }}>
          Can you explain how hooks work?
        </div>
        <div style={{ padding: '8px 12px', background: 'var(--color-primary, #3b82f6)', color: '#fff', borderRadius: 8, marginBottom: 8 }}>
          React hooks let you use state and lifecycle features in functional components.
        </div>
        <div style={{ padding: '8px 12px', background: 'var(--color-surface-2, #f3f4f6)', borderRadius: 8, marginBottom: 8, alignSelf: 'flex-end' }}>
          What about custom hooks?
        </div>
        <div style={{ padding: '8px 12px', background: 'var(--color-primary, #3b82f6)', color: '#fff', borderRadius: 8, marginBottom: 8 }}>
          Custom hooks are functions starting with &quot;use&quot; that let you extract and reuse stateful logic.
        </div>
      </>
    ),
  },
};

export const Empty: Story = {
  args: {
    children: undefined as unknown as React.ReactNode,
    emptyContent: (
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted, #9ca3af)' }}>
        <p style={{ fontSize: 24, marginBottom: 8 }}>No messages yet</p>
        <p style={{ fontSize: 14 }}>Start a conversation by typing below.</p>
      </div>
    ),
  },
};

const manyMessages = Array.from({ length: 24 }, (_, i) => {
  const isUser = i % 2 === 0;
  return (
    <div
      key={i}
      style={{
        padding: '8px 12px',
        background: isUser ? 'var(--color-surface-2, #f3f4f6)' : 'var(--color-primary, #3b82f6)',
        color: isUser ? 'inherit' : '#fff',
        borderRadius: 8,
        marginBottom: 8,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {isUser ? `User message #${i + 1}` : `Assistant response #${i + 1} - This is a longer reply to test scrolling behavior within the chat body container.`}
    </div>
  );
});

export const ManyMessages: Story = {
  args: {
    children: <>{manyMessages}</>,
  },
};
