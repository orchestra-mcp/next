import type { Meta, StoryObj } from '@storybook/react';
import type { BashEvent } from '../types/events';
import { BashCard } from './BashCard';

const meta = {
  title: 'AI/Cards/BashCard',
  component: BashCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BashCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const successEvent: BashEvent = {
  id: '1',
  type: 'bash',
  command: 'ls -la /usr/local/bin',
  output:
    'total 128\ndrwxr-xr-x  42 root admin 1344 Jan 15 12:30 .\n-rwxr-xr-x   1 root admin  432 Dec 10 09:15 node\n-rwxr-xr-x   1 root admin  256 Nov 28 14:22 pnpm',
  exitCode: 0,
};

export const Success: Story = {
  args: {
    event: successEvent,
  },
};

export const Error: Story = {
  args: {
    event: {
      id: '2',
      type: 'bash',
      command: 'cat /etc/nonexistent',
      output: 'cat: /etc/nonexistent: No such file or directory',
      exitCode: 1,
    },
  },
};

export const WithCwd: Story = {
  args: {
    event: {
      ...successEvent,
      id: '3',
      cwd: '/Users/dev/projects/orchestra-mcp',
    },
  },
};

export const LongOutput: Story = {
  args: {
    event: {
      id: '4',
      type: 'bash',
      command: 'find . -name "*.ts" -type f',
      output: Array.from({ length: 40 }, (_, i) => `./src/module-${i}/index.ts`)
        .join('\n'),
      exitCode: 0,
    },
  },
};

export const Collapsed: Story = {
  args: {
    event: successEvent,
    defaultCollapsed: true,
  },
};
