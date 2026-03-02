import type { Meta, StoryObj } from '@storybook/react';
import type { McpEvent } from '../types/events';
import { McpCard } from './McpCard';

const meta = {
  title: 'AI/Cards/McpCard',
  component: McpCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof McpCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultEvent: McpEvent = {
  id: '1',
  type: 'mcp',
  toolName: 'create_task',
  serverName: 'orchestra-mcp',
  arguments: {
    project: 'my-app',
    title: 'Fix login bug',
    type: 'bug',
  },
  result: 'Task BUG-42 created successfully.',
};

export const Default: Story = {
  args: {
    event: defaultEvent,
  },
};

export const WithoutResult: Story = {
  args: {
    event: {
      id: '2',
      type: 'mcp',
      toolName: 'get_next_task',
      serverName: 'orchestra-mcp',
      arguments: {
        project: 'my-app',
      },
    },
  },
};

export const WithoutServer: Story = {
  args: {
    event: {
      id: '3',
      type: 'mcp',
      toolName: 'search_memory',
      arguments: {
        project: 'orchestra',
        query: 'plugin architecture',
        limit: 5,
      },
      result: 'Found 3 memory chunks matching "plugin architecture".',
    },
  },
};

export const Collapsed: Story = {
  args: {
    event: defaultEvent,
    defaultCollapsed: true,
  },
};
