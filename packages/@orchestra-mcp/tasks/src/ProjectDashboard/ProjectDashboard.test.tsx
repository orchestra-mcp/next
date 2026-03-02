import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectDashboard } from './ProjectDashboard';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useTaskDetailStore } from '../stores/useTaskDetailStore';

// Mock @orchestra-mcp/widgets
vi.mock('@orchestra-mcp/widgets', () => ({
  Widget: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid={`widget-wrapper-${title}`}>
      <span>{title}</span>
      {children}
    </div>
  ),
  DonutChart: ({ data }: { data: any[] }) => (
    <div data-testid="donut-chart">Chart ({data.length} items)</div>
  ),
}));

// Mock @orchestra-mcp/icons
vi.mock('@orchestra-mcp/icons', () => ({
  BoxIcon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />,
}));

// Mock @orchestra-mcp/editor
vi.mock('@orchestra-mcp/editor', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

// Mock mcp client
vi.mock('../mcp/client', () => ({
  mcpCall: vi.fn(),
}));

// Mock useTaskDetail for TaskDetailPanel
vi.mock('../hooks/useTaskDetail', () => ({
  useTaskDetail: vi.fn(() => ({
    task: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    isStale: false,
    checkForUpdates: vi.fn(),
    dismissStale: vi.fn(),
    acceptStale: vi.fn(),
  })),
}));

const defaultProps = {
  slug: 'test-project',
  name: 'Test Project',
  tree: [
    {
      id: 'epic-1',
      title: 'Auth System',
      type: 'epic' as const,
      status: 'in-progress',
      description: 'Build auth system',
      children: [
        {
          id: 'story-1',
          title: 'Login Flow',
          type: 'story' as const,
          status: 'in-progress',
          children: [
            { id: 'task-1', title: 'Login form', type: 'task' as const, status: 'todo' },
          ],
        },
      ],
    },
  ],
  statuses: [
    { status: 'todo', label: 'To Do', count: 5, color: '#eab308' },
    { status: 'done', label: 'Done', count: 10, color: '#22c55e' },
  ],
  totalTasks: 15,
  completionPercent: 67,
  epicCount: 3,
  storyCount: 5,
  doneTasks: 10,
  activeTasks: [],
};

describe('ProjectDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state between tests
    useDashboardStore.getState().resetLayout('test-project');
    useTaskDetailStore.setState({ selectedTask: null });
  });

  it('renders with project name', () => {
    render(<ProjectDashboard {...defaultProps} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByTestId('project-dashboard')).toBeInTheDocument();
  });

  it('renders the dashboard grid', () => {
    render(<ProjectDashboard {...defaultProps} />);
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });

  it('renders the dashboard header', () => {
    render(<ProjectDashboard {...defaultProps} />);
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });
});
