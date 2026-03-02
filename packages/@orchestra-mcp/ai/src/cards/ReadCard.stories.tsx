import type { Meta, StoryObj } from '@storybook/react';
import { ReadCard } from './ReadCard';
import type { ReadEvent } from '../types/events';

const meta: Meta<typeof ReadCard> = {
  title: 'AI/Cards/ReadCard',
  component: ReadCard,
  tags: ['autodocs'],
  argTypes: {
    onFileClick: { action: 'file clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ReadCard>;

const baseEvent: ReadEvent = {
  id: '1',
  type: 'read',
  filePath: '/Users/dev/project/src/components/Button.tsx',
  status: 'done',
  timestamp: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    event: {
      ...baseEvent,
      content: `import React from 'react';

export const Button = ({ label, onClick }) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
};`,
      lineCount: 8,
    },
    defaultCollapsed: false,
  },
};

export const WithRange: Story = {
  args: {
    event: {
      ...baseEvent,
      content: `  return (
    <button onClick={onClick}>
      {label}
    </button>
  );`,
      offset: 4,
      limit: 5,
    },
    defaultCollapsed: false,
  },
};

export const Running: Story = {
  args: {
    event: {
      ...baseEvent,
      status: 'running',
    },
    defaultCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    event: {
      ...baseEvent,
      content: `const longFile = 'this is a file with lots of content...';`,
      lineCount: 150,
    },
    defaultCollapsed: true,
  },
};
