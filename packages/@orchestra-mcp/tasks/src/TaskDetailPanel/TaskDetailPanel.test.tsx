import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskDetailPanel } from './TaskDetailPanel';

vi.mock('../hooks/useTaskDetail', () => ({
  useTaskDetail: vi.fn(),
}));

vi.mock('../mcp/client', () => ({
  mcpCall: vi.fn(),
}));

import { useTaskDetail } from '../hooks/useTaskDetail';
const mockUseTaskDetail = vi.mocked(useTaskDetail);

const params = { project: 'test', epicId: 'E-1', storyId: 'S-1', taskId: 'T-1' };

const mockTask = {
  id: 'T-1',
  title: 'Test Task',
  status: 'in-progress',
  type: 'task',
  priority: 'high',
  description: 'Do the thing',
  assigned_to: 'alice',
  labels: ['frontend', 'urgent'],
  depends_on: ['T-0'],
  links: [{ type: 'pr', url: 'https://github.com/pr/1', title: 'PR #1' }],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
};

/** Helper to build a mock return value with stale detection defaults */
function mockReturn(overrides: Partial<ReturnType<typeof useTaskDetail>> = {}) {
  return {
    task: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    isStale: false,
    checkForUpdates: vi.fn(),
    dismissStale: vi.fn(),
    acceptStale: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useTaskDetail>;
}

beforeEach(() => {
  mockUseTaskDetail.mockReset();
});

describe('TaskDetailPanel', () => {
  it('renders nothing when closed', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn());
    const { container } = render(
      <TaskDetailPanel isOpen={false} onClose={vi.fn()} params={params} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('passes null to useTaskDetail when panel is closed', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn());
    render(<TaskDetailPanel isOpen={false} onClose={vi.fn()} params={params} />);
    expect(mockUseTaskDetail).toHaveBeenCalledWith(null);
  });

  it('passes params to useTaskDetail when panel is open', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ loading: true }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(mockUseTaskDetail).toHaveBeenCalledWith(params);
  });

  it('shows loading state', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ loading: true }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('Loading task...')).toBeTruthy();
  });

  it('shows error state', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ error: 'Network error' }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('renders task title and ID', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getAllByText('Test Task').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('T-1')).toBeTruthy();
  });

  it('renders description section', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('Do the thing')).toBeTruthy();
  });

  it('renders labels', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('frontend')).toBeTruthy();
    expect(screen.getByText('urgent')).toBeTruthy();
  });

  it('renders dependencies', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('T-0')).toBeTruthy();
  });

  it('renders links with correct href', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    const link = screen.getByText('PR #1');
    expect(link).toBeTruthy();
    expect(link.closest('a')?.getAttribute('href')).toBe('https://github.com/pr/1');
  });

  it('renders timestamps', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText(/Created:/)).toBeTruthy();
    expect(screen.getByText(/Updated:/)).toBeTruthy();
  });

  it('omits optional sections when data is absent', () => {
    const minimal = { id: 'T-2', title: 'Minimal', status: 'todo', type: 'task' };
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: minimal }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    // Labels section always renders (has add button), but shows "No labels" text
    expect(screen.getByText('Labels')).toBeInTheDocument();
    expect(screen.getByText('No labels')).toBeInTheDocument();
    // Links section always renders, shows "No links" text
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('No links')).toBeInTheDocument();
    expect(screen.queryByText('Dependencies')).toBeNull();
    expect(screen.queryByText(/Created:/)).toBeNull();
  });

  it('renders title as editable text', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    const title = screen.getAllByText('Test Task').find((el) => el.getAttribute('role') === 'button');
    expect(title).toBeTruthy();
  });

  it('renders priority as editable select', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByText('Priority')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('shows StaleNotification when isStale is true', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask, isStale: true }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.getByTestId('stale-notification')).toBeInTheDocument();
    expect(screen.getByText('Task updated externally')).toBeInTheDocument();
  });

  it('does not show StaleNotification when isStale is false', () => {
    mockUseTaskDetail.mockReturnValue(mockReturn({ task: mockTask, isStale: false }));
    render(<TaskDetailPanel isOpen={true} onClose={vi.fn()} params={params} />);
    expect(screen.queryByTestId('stale-notification')).not.toBeInTheDocument();
  });
});
