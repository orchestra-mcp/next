import type { Meta, StoryObj } from '@storybook/react';
import type {
  BashEvent,
  GrepEvent,
  EditEvent,
  McpEvent,
  OrchestraEvent,
  TodoListEvent,
} from '../types/events';
import { EventCardRenderer } from './EventCardRenderer';

const meta = {
  title: 'AI/Cards/EventCardRenderer',
  component: EventCardRenderer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCardRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BashEvent: Story = {
  name: 'Bash Event',
  args: {
    event: {
      id: 'bash-1',
      type: 'bash',
      command: 'pnpm install --frozen-lockfile',
      output: 'Lockfile is up to date, resolution step is skipped\nPackages: +342\nProgress: resolved 342, reused 340, downloaded 2, added 342, done',
      exitCode: 0,
    } satisfies BashEvent,
  },
};

export const GrepEvent: Story = {
  name: 'Grep Event',
  args: {
    event: {
      id: 'grep-1',
      type: 'grep',
      pattern: 'export const',
      matches: [
        { file: 'src/cards/CardBase.tsx', line: 16, content: 'export const CardBase = ({' },
        { file: 'src/cards/BashCard.tsx', line: 22, content: 'export const BashCard = ({' },
        { file: 'src/cards/GrepCard.tsx', line: 19, content: 'export const GrepCard = ({' },
      ],
      totalMatches: 3,
    } satisfies GrepEvent,
  },
};

export const EditEvent: Story = {
  name: 'Edit Event',
  args: {
    event: {
      id: 'edit-1',
      type: 'edit',
      filePath: 'src/index.ts',
      language: 'typescript',
      original: "export { App } from './App';",
      modified: "export { App } from './App';\nexport { ThemeProvider } from './ThemeProvider';",
    } satisfies EditEvent,
  },
};

export const McpEvent: Story = {
  name: 'MCP Event',
  args: {
    event: {
      id: 'mcp-1',
      type: 'mcp',
      toolName: 'get_project_status',
      serverName: 'orchestra-mcp',
      arguments: { project: 'orchestra' },
      result: 'Project "orchestra": 4 epics, 12 stories, 47 tasks (32 done, 8 in-progress, 7 pending)',
    } satisfies McpEvent,
  },
};

export const OrchestraEvent: Story = {
  name: 'Orchestra Event',
  args: {
    event: {
      id: 'orch-1',
      type: 'orchestra',
      issueType: 'story',
      issueId: 'STORY-22',
      title: 'Build event card Storybook stories',
      status: 'in-progress',
      priority: 'high',
    } satisfies OrchestraEvent,
  },
};

export const TodoEvent: Story = {
  name: 'Todo List Event',
  args: {
    event: {
      id: 'todo-1',
      type: 'todo_list',
      items: [
        { content: 'CardBase stories', status: 'completed' },
        { content: 'BashCard stories', status: 'completed' },
        { content: 'GrepCard stories', status: 'in_progress' },
        { content: 'McpCard stories', status: 'pending' },
        { content: 'EditCard stories', status: 'pending' },
      ],
    } satisfies TodoListEvent,
  },
};
