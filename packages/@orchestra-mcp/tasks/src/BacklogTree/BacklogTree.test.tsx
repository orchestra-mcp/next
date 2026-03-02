import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BacklogTree } from './BacklogTree';
import type { TreeNode } from '../widgets';

const makeTree = (): TreeNode[] => [
  {
    id: 'epic-1',
    title: 'Auth System',
    type: 'epic',
    status: 'in-progress',
    priority: 'critical',
    children: [
      {
        id: 'story-1',
        title: 'Login Flow',
        type: 'story',
        status: 'todo',
        children: [
          { id: 'task-1', title: 'Build login form', type: 'task', status: 'in-progress', priority: 'high' },
          { id: 'task-2', title: 'Add validation', type: 'task', status: 'done' },
        ],
      },
    ],
  },
  {
    id: 'epic-2',
    title: 'Dashboard',
    type: 'epic',
    status: 'backlog',
    children: [],
  },
];

beforeEach(() => {
  localStorage.clear();
});

describe('BacklogTree', () => {
  it('renders epic nodes', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);
    expect(screen.getByText('Auth System')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<BacklogTree tree={[]} projectSlug="test" loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when tree is empty', () => {
    render(<BacklogTree tree={[]} projectSlug="test" />);
    expect(screen.getByText('No epics yet')).toBeInTheDocument();
  });

  it('expands epic to show stories on click', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);
    expect(screen.queryByText('Login Flow')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Auth System'));
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
  });

  it('collapses epic on second click', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);

    fireEvent.click(screen.getByText('Auth System'));
    expect(screen.getByText('Login Flow')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Auth System'));
    expect(screen.queryByText('Login Flow')).not.toBeInTheDocument();
  });

  it('expands story to show tasks', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);

    fireEvent.click(screen.getByText('Auth System'));
    fireEvent.click(screen.getByText('Login Flow'));

    expect(screen.getByText('Build login form')).toBeInTheDocument();
    expect(screen.getByText('Add validation')).toBeInTheDocument();
  });

  it('calls onTaskClick when task is clicked', () => {
    const handleClick = vi.fn();
    render(<BacklogTree tree={makeTree()} projectSlug="test" onTaskClick={handleClick} />);

    fireEvent.click(screen.getByText('Auth System'));
    fireEvent.click(screen.getByText('Login Flow'));
    fireEvent.click(screen.getByText('Build login form'));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', title: 'Build login form' }),
    );
  });

  it('persists expanded state to localStorage', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test-persist" />);
    fireEvent.click(screen.getByText('Auth System'));

    const stored = localStorage.getItem('orchestra-backlog-expanded:test-persist');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toContain('epic-1');
  });

  it('restores expanded state from localStorage', () => {
    localStorage.setItem(
      'orchestra-backlog-expanded:test-restore',
      JSON.stringify(['epic-1']),
    );

    render(<BacklogTree tree={makeTree()} projectSlug="test-restore" />);
    expect(screen.getByText('Login Flow')).toBeInTheDocument();
  });

  it('shows task count on story rows', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);
    fireEvent.click(screen.getByText('Auth System'));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has testid on root element', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);
    expect(screen.getByTestId('backlog-tree')).toBeInTheDocument();
  });

  it('shows assignee initials on task rows', () => {
    const treeWithAssignee: TreeNode[] = [{
      id: 'epic-1', title: 'Epic', type: 'epic', status: 'in-progress',
      children: [{
        id: 'story-1', title: 'Story', type: 'story', status: 'todo',
        children: [
          { id: 'task-1', title: 'Assigned task', type: 'task', status: 'todo', assignedTo: 'John Doe' },
          { id: 'task-2', title: 'Unassigned task', type: 'task', status: 'todo' },
        ],
      }],
    }];
    localStorage.setItem('orchestra-backlog-expanded:test-assignee', JSON.stringify(['epic-1', 'story-1']));
    render(<BacklogTree tree={treeWithAssignee} projectSlug="test-assignee" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByTitle('John Doe')).toBeInTheDocument();
  });

  it('does not show assignee when not set', () => {
    render(<BacklogTree tree={makeTree()} projectSlug="test" />);
    fireEvent.click(screen.getByText('Auth System'));
    fireEvent.click(screen.getByText('Login Flow'));
    const assignees = document.querySelectorAll('.backlog-sidebar__assignee');
    expect(assignees).toHaveLength(0);
  });
});
