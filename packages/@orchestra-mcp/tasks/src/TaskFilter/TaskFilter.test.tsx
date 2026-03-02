import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskFilter } from './TaskFilter';
import type { FilterState } from './TaskFilter';

const emptyFilters: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: '' };

describe('TaskFilter', () => {
  it('renders three filter buttons', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    expect(screen.getByTestId('filter-trigger-status')).toBeInTheDocument();
    expect(screen.getByTestId('filter-trigger-priority')).toBeInTheDocument();
    expect(screen.getByTestId('filter-trigger-assignee')).toBeInTheDocument();
  });

  it('opens status dropdown on click', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    expect(screen.queryByTestId('filter-dropdown-status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('filter-trigger-status'));
    expect(screen.getByTestId('filter-dropdown-status')).toBeInTheDocument();
  });

  it('selects a status and calls onChange', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('filter-trigger-status'));
    const backlogOption = screen.getByText('Backlog');
    fireEvent.click(backlogOption);
    expect(onChange).toHaveBeenCalledWith({
      statuses: ['backlog'],
      priorities: [],
      assignee: '',
      searchQuery: '',
    });
  });

  it('shows count badge when statuses are selected', () => {
    const onChange = vi.fn();
    const filters: FilterState = { statuses: ['todo', 'done'], priorities: [], assignee: '', searchQuery: '' };
    render(<TaskFilter value={filters} onChange={onChange} />);
    const trigger = screen.getByTestId('filter-trigger-status');
    const badge = trigger.querySelector('.task-filter__count');
    expect(badge).toBeInTheDocument();
    expect(badge!.textContent).toBe('2');
  });

  it('opens priority dropdown on click', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('filter-trigger-priority'));
    expect(screen.getByTestId('filter-dropdown-priority')).toBeInTheDocument();
  });

  it('opens assignee dropdown with provided assignees', () => {
    const onChange = vi.fn();
    render(
      <TaskFilter value={emptyFilters} onChange={onChange} assignees={['alice', 'bob']} />,
    );
    fireEvent.click(screen.getByTestId('filter-trigger-assignee'));
    const dropdown = screen.getByTestId('filter-dropdown-assignee');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('clears all filters when Clear is clicked', () => {
    const onChange = vi.fn();
    const filters: FilterState = { statuses: ['todo'], priorities: ['high'], assignee: 'alice', searchQuery: '' };
    render(<TaskFilter value={filters} onChange={onChange} />);
    const clearBtn = screen.getByText('Clear all');
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith({ statuses: [], priorities: [], assignee: '', searchQuery: '' });
  });

  it('closes dropdown when clicking outside', () => {
    const onChange = vi.fn();
    render(
      <div>
        <TaskFilter value={emptyFilters} onChange={onChange} />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    fireEvent.click(screen.getByTestId('filter-trigger-status'));
    expect(screen.getByTestId('filter-dropdown-status')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('filter-dropdown-status')).not.toBeInTheDocument();
  });

  it('renders search input', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    const input = screen.getByTestId('task-filter-search');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search tasks...');
  });

  it('calls onChange when search text changes', () => {
    const onChange = vi.fn();
    render(<TaskFilter value={emptyFilters} onChange={onChange} />);
    const input = screen.getByTestId('task-filter-search');
    fireEvent.change(input, { target: { value: 'login' } });
    expect(onChange).toHaveBeenCalledWith({
      statuses: [],
      priorities: [],
      assignee: '',
      searchQuery: 'login',
    });
  });
});
