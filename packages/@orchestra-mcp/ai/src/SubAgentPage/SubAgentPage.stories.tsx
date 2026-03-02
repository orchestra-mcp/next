import type { Meta, StoryObj } from '@storybook/react';
import type { SubAgentEvent, BashEvent, GrepEvent, ReadEvent } from '../types/events';
import { SubAgentPage } from './SubAgentPage';

const meta = {
  title: 'AI/Pages/SubAgentPage',
  component: SubAgentPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 600 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SubAgentPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent: SubAgentEvent = {
  id: 'agent-1',
  type: 'sub_agent',
  agentType: 'go-architect',
  description: 'Build the CardRegistry with register() and get() methods',
  prompt: 'Create a CardRegistry class that maps tool names to card components.\nSupport register(), get(), has() methods.\nMap all tool names to their components.',
  agentId: 'agent-abc-123',
  status: 'done',
  duration: '45s',
  activities: [
    { tool: 'Read', summary: 'CardBase.tsx', status: 'done', timestamp: '12:30:01' },
    { tool: 'Read', summary: 'events.ts', status: 'done', timestamp: '12:30:03' },
    { tool: 'Write', summary: 'CardRegistry.ts', status: 'done', timestamp: '12:30:10' },
    { tool: 'Write', summary: 'registerCards.ts', status: 'done', timestamp: '12:30:18' },
    { tool: 'Bash', summary: 'npx tsc --noEmit', status: 'done', timestamp: '12:30:25' },
  ],
};

const childEvents: (BashEvent | GrepEvent | ReadEvent)[] = [
  {
    id: 'ev-1', type: 'read', filePath: 'src/cards/CardBase.tsx',
    content: 'export const CardBase = ...', lineCount: 150, status: 'done',
  },
  {
    id: 'ev-2', type: 'grep', pattern: 'export.*Card',
    matches: [{ file: 'src/cards/index.ts', line: 5, content: 'export { BashCard }' }],
    totalMatches: 12, status: 'done',
  },
  {
    id: 'ev-3', type: 'bash', command: 'npx tsc --noEmit',
    output: '0 errors found.', exitCode: 0, status: 'done',
  },
];

export const Completed: Story = {
  args: {
    event: baseEvent,
    events: childEvents,
    onBack: () => console.log('Back clicked'),
  },
};

export const Running: Story = {
  args: {
    event: {
      ...baseEvent,
      status: 'running',
      duration: undefined,
      activities: [
        { tool: 'Read', summary: 'CardBase.tsx', status: 'done' },
        { tool: 'Grep', summary: 'searching for exports', status: 'running' },
      ],
    },
    events: [childEvents[0]],
    onBack: () => console.log('Back clicked'),
  },
};

export const ActivityFallback: Story = {
  args: {
    event: {
      ...baseEvent,
      status: 'running',
      duration: undefined,
    },
    onBack: () => console.log('Back clicked'),
  },
};

export const EmptyState: Story = {
  args: {
    event: {
      ...baseEvent,
      activities: [],
      status: 'running',
      duration: undefined,
    },
    onBack: () => console.log('Back clicked'),
  },
};

export const ErrorState: Story = {
  args: {
    event: {
      ...baseEvent,
      status: 'error',
      duration: '12s',
      activities: [
        { tool: 'Read', summary: 'CardBase.tsx', status: 'done' },
        { tool: 'Write', summary: 'output.ts', status: 'error' },
      ],
    },
    onBack: () => console.log('Back clicked'),
  },
};
