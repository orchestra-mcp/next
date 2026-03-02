import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusActions } from './StatusActions';

vi.mock('../hooks/useTaskActions', () => ({
  useTaskActions: vi.fn(),
}));

import { useTaskActions } from '../hooks/useTaskActions';
const mockUseTaskActions = vi.mocked(useTaskActions);

const baseProps = {
  status: 'todo',
  project: 'test-proj',
  epicId: 'E-1',
  storyId: 'S-1',
  taskId: 'T-1',
  onAction: vi.fn(),
};

const mockStart = vi.fn();
const mockAdvance = vi.fn();
const mockBlock = vi.fn();
const mockComplete = vi.fn();

const mockActions = {
  startTask: mockStart,
  advanceTask: mockAdvance,
  blockTask: mockBlock,
  assignTask: vi.fn(),
  completeTask: mockComplete,
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

describe('StatusActions', () => {
  it('shows Start button for todo status', () => {
    render(<StatusActions {...baseProps} status="todo" />);
    expect(screen.getByLabelText('Start task')).toBeInTheDocument();
  });

  it('shows Start button for backlog status', () => {
    render(<StatusActions {...baseProps} status="backlog" />);
    expect(screen.getByLabelText('Start task')).toBeInTheDocument();
  });

  it('shows Start button for blocked status', () => {
    render(<StatusActions {...baseProps} status="blocked" />);
    expect(screen.getByLabelText('Start task')).toBeInTheDocument();
  });

  it('shows Advance, Block, and Complete buttons for in-progress status', () => {
    render(<StatusActions {...baseProps} status="in-progress" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
    expect(screen.getByLabelText('Block task')).toBeInTheDocument();
    expect(screen.getByLabelText('Complete task')).toBeInTheDocument();
    expect(screen.queryByLabelText('Start task')).not.toBeInTheDocument();
  });

  it('shows Advance button for ready-for-testing gate state', () => {
    render(<StatusActions {...baseProps} status="ready-for-testing" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
    expect(screen.queryByLabelText('Start task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Block task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Complete task')).not.toBeInTheDocument();
  });

  it('shows Advance button for in-testing gate state', () => {
    render(<StatusActions {...baseProps} status="in-testing" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
  });

  it('shows Advance button for ready-for-docs gate state', () => {
    render(<StatusActions {...baseProps} status="ready-for-docs" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
  });

  it('shows Advance button for in-docs gate state', () => {
    render(<StatusActions {...baseProps} status="in-docs" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
  });

  it('shows Advance button for documented gate state', () => {
    render(<StatusActions {...baseProps} status="documented" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
  });

  it('shows Advance button for in-review gate state', () => {
    render(<StatusActions {...baseProps} status="in-review" />);
    expect(screen.getByLabelText('Advance task')).toBeInTheDocument();
  });

  it('shows no buttons for done status', () => {
    const { container } = render(<StatusActions {...baseProps} status="done" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows no buttons for cancelled status', () => {
    const { container } = render(<StatusActions {...baseProps} status="cancelled" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows no buttons for rejected status', () => {
    const { container } = render(<StatusActions {...baseProps} status="rejected" />);
    expect(container.innerHTML).toBe('');
  });

  it('calls startTask on Start click', () => {
    render(<StatusActions {...baseProps} status="todo" />);
    fireEvent.click(screen.getByLabelText('Start task'));
    expect(mockStart).toHaveBeenCalledWith({
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
  });

  it('calls advanceTask on Advance click', () => {
    render(<StatusActions {...baseProps} status="in-progress" />);
    fireEvent.click(screen.getByLabelText('Advance task'));
    expect(mockAdvance).toHaveBeenCalledWith(
      { project: 'test-proj', epic_id: 'E-1', story_id: 'S-1', task_id: 'T-1' },
      undefined,
    );
  });

  it('calls blockTask on Block click', () => {
    render(<StatusActions {...baseProps} status="in-progress" />);
    fireEvent.click(screen.getByLabelText('Block task'));
    expect(mockBlock).toHaveBeenCalledWith({
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
  });

  it('calls completeTask on Complete click', () => {
    render(<StatusActions {...baseProps} status="in-progress" />);
    fireEvent.click(screen.getByLabelText('Complete task'));
    expect(mockComplete).toHaveBeenCalledWith({
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
  });

  it('shows loading spinner when start is in progress', () => {
    mockUseTaskActions.mockReturnValue({
      ...mockActions,
      starting: { loading: true, error: null },
    });
    render(<StatusActions {...baseProps} status="todo" />);
    const btn = screen.getByLabelText('Start task');
    expect(btn).toHaveClass('status-actions__btn--loading');
    expect(btn.querySelector('.status-actions__spinner')).toBeInTheDocument();
  });

  it('shows loading spinner when advance is in progress', () => {
    mockUseTaskActions.mockReturnValue({
      ...mockActions,
      advancing: { loading: true, error: null },
    });
    render(<StatusActions {...baseProps} status="in-progress" />);
    const btn = screen.getByLabelText('Advance task');
    expect(btn).toHaveClass('status-actions__btn--loading');
    expect(btn.querySelector('.status-actions__spinner')).toBeInTheDocument();
  });

  it('shows loading spinner when block is in progress', () => {
    mockUseTaskActions.mockReturnValue({
      ...mockActions,
      blocking: { loading: true, error: null },
    });
    render(<StatusActions {...baseProps} status="in-progress" />);
    const btn = screen.getByLabelText('Block task');
    expect(btn).toHaveClass('status-actions__btn--loading');
  });

  it('shows loading spinner when complete is in progress', () => {
    mockUseTaskActions.mockReturnValue({
      ...mockActions,
      completing: { loading: true, error: null },
    });
    render(<StatusActions {...baseProps} status="in-progress" />);
    const btn = screen.getByLabelText('Complete task');
    expect(btn).toHaveClass('status-actions__btn--loading');
  });

  it('does not show Start for in-progress status', () => {
    render(<StatusActions {...baseProps} status="in-progress" />);
    expect(screen.queryByLabelText('Start task')).not.toBeInTheDocument();
  });

  it('does not show Block or Complete for gate states', () => {
    render(<StatusActions {...baseProps} status="in-testing" />);
    expect(screen.queryByLabelText('Block task')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Complete task')).not.toBeInTheDocument();
  });
});
