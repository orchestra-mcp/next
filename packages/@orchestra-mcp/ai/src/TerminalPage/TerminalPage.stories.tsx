import type { Meta, StoryObj } from '@storybook/react';
import type { TerminalSession } from '../hooks/useTerminalSessions';
import { TerminalPage } from './TerminalPage';

const meta = {
  title: 'AI/Pages/TerminalPage',
  component: TerminalPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TerminalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const completedSession: TerminalSession = {
  id: 'sess-1',
  command: 'npx tsc --noEmit --project tsconfig.json',
  output: '\x1b[32m✓\x1b[0m Compilation complete. 0 errors found.\n\x1b[2mChecked 142 files in 3.2s\x1b[0m\n',
  exitCode: 0,
  cwd: '/Users/dev/projects/orchestra-mcp',
  isRunning: false,
  startedAt: '2026-02-22T12:00:00Z',
  endedAt: '2026-02-22T12:00:03Z',
};

const runningSession: TerminalSession = {
  id: 'sess-2',
  command: 'pnpm dev',
  output: '\x1b[34m➜\x1b[0m  Local:   http://localhost:5173/\n\x1b[34m➜\x1b[0m  Network: http://192.168.1.10:5173/\n\x1b[2mwaiting for changes...\x1b[0m\n',
  cwd: '/Users/dev/projects/orchestra-mcp',
  isRunning: true,
  startedAt: '2026-02-22T12:01:00Z',
};

const errorSession: TerminalSession = {
  id: 'sess-3',
  command: 'go test ./...',
  output: '\x1b[31m--- FAIL: TestSyncService (0.02s)\x1b[0m\n    service_test.go:45: expected 3, got 0\n\x1b[31mFAIL\x1b[0m\texit status 1\n',
  exitCode: 1,
  cwd: '/Users/dev/projects/orchestra-mcp',
  isRunning: false,
  startedAt: '2026-02-22T12:02:00Z',
  endedAt: '2026-02-22T12:02:01Z',
};

export const Completed: Story = {
  args: {
    session: completedSession,
    onBack: () => console.log('Back'),
  },
};

export const Running: Story = {
  args: {
    session: runningSession,
    onBack: () => console.log('Back'),
  },
};

export const Error: Story = {
  args: {
    session: errorSession,
    onBack: () => console.log('Back'),
  },
};

export const MultipleTabs: Story = {
  args: {
    session: completedSession,
    sessions: [completedSession, runningSession, errorSession],
    onSelectSession: (id: string) => console.log('Select', id),
    onCloseSession: (id: string) => console.log('Close', id),
    onBack: () => console.log('Back'),
  },
};

export const EmptyOutput: Story = {
  args: {
    session: {
      id: 'sess-4',
      command: 'sleep 30',
      output: '',
      isRunning: true,
      startedAt: '2026-02-22T12:03:00Z',
    },
    onBack: () => console.log('Back'),
  },
};
