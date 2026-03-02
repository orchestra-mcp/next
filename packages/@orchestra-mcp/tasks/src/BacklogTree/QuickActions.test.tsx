import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickActions } from './QuickActions';

vi.mock('../hooks/useTaskActions', () => ({
  useTaskActions: vi.fn(),
}));

import { useTaskActions } from '../hooks/useTaskActions';
const mockUseTaskActions = vi.mocked(useTaskActions);

const baseProps = {
  taskId: 'T-1',
  status: 'todo',
  projectSlug: 'test-proj',
  epicId: 'E-1',
  storyId: 'S-1',
};

const mockActions = {
  startTask: vi.fn(),
  advanceTask: vi.fn(),
  blockTask: vi.fn(),
  assignTask: vi.fn(),
  completeTask: vi.fn(),
  starting: { loading: false, error: null },
  advancing: { loading: false, error: null },
  blocking: { loading: false, error: null },
  assigning: { loading: false, error: null },
  completing: { loading: false, error: null },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseTaskActions.mockReturnValue(mockActions);
});

describe('QuickActions', () => {
  it('shows Start button for todo status', () => {
    render(<QuickActions {...baseProps} status="todo" />);
    expect(screen.getByLabelText('Start task')).toBeInTheDocument();
  });

  it('shows Start button for backlog status', () => {
    render(<QuickActions {...baseProps} status="backlog" />);
    expect(screen.getByLabelText('Start task')).toBeInTheDocument();
  });

  it('shows Advance and Block buttons for in-progress status', () => {
    render(<QuickActions {...baseProps} status="in-progress" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
    expect(screen.getByLabelText('Block task')).toBeInTheDocument();
  });

  it('shows only Advance for testing/docs statuses', () => {
    render(<QuickActions {...baseProps} status="in-testing" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
    expect(screen.queryByLabelText('Start task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Block task')).not.toBeInTheDocument();
  });

  it('shows nothing for done status', () => {
    const { container } = render(<QuickActions {...baseProps} status="done" />);
    expect(container.querySelector('.quick-actions')?.children).toHaveLength(0);
  });

  it('calls startTask on Start click', () => {
    render(<QuickActions {...baseProps} status="todo" />);
    fireEvent.click(screen.getByLabelText('Start task'));
    expect(mockActions.startTask).toHaveBeenCalledWith({
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
  });

  it('calls advanceTask on Advance click', () => {
    render(<QuickActions {...baseProps} status="in-progress" />);
    fireEvent.click(screen.getByLabelText('Advance task'));
    expect(mockActions.advanceTask).toHaveBeenCalledWith(
      { project: 'test-proj', epic_id: 'E-1', story_id: 'S-1', task_id: 'T-1' },
      undefined,
    );
  });

  it('calls blockTask on Block click', () => {
    render(<QuickActions {...baseProps} status="in-progress" />);
    fireEvent.click(screen.getByLabelText('Block task'));
    expect(mockActions.blockTask).toHaveBeenCalledWith({
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
  });

  it('shows loading state on start button', () => {
    mockUseTaskActions.mockReturnValue({
      ...mockActions,
      starting: { loading: true, error: null },
    });
    render(<QuickActions {...baseProps} status="todo" />);
    expect(screen.getByLabelText('Start task')).toHaveClass('quick-actions__btn--loading');
  });

  it('stops click propagation', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <QuickActions {...baseProps} status="todo" />
      </div>,
    );
    fireEvent.click(screen.getByLabelText('Start task'));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
