import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TasksSidebar } from './TasksSidebar';
import type { TreeNode } from '../widgets';

const makeTree = (): TreeNode[] => [
  {
    id: 'epic-1',
    title: 'Auth System',
    type: 'epic',
    status: 'in-progress',
    children: [
      {
        id: 'story-1',
        title: 'Login Flow',
        type: 'story',
        status: 'todo',
        children: [
          { id: 'task-1', title: 'Build form', type: 'task', status: 'done' },
        ],
      },
    ],
  },
];

describe('TasksSidebar', () => {
  it('renders project name in header', () => {
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} />,
    );
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders BacklogTree with tree data', () => {
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} />,
    );
    expect(screen.getByTestId('backlog-tree')).toBeInTheDocument();
    expect(screen.getByText('Auth System')).toBeInTheDocument();
  });

  it('shows back button when onBack is provided', () => {
    const handleBack = vi.fn();
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} onBack={handleBack} />,
    );
    const backBtn = screen.getByLabelText('Back to projects');
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('hides back button when onBack is not provided', () => {
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} />,
    );
    expect(screen.queryByLabelText('Back to projects')).not.toBeInTheDocument();
  });

  it('shows refresh button when onRefresh is provided', () => {
    const handleRefresh = vi.fn();
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} onRefresh={handleRefresh} />,
    );
    const refreshBtn = screen.getByLabelText('Refresh');
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('hides refresh button when onRefresh is not provided', () => {
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} />,
    );
    expect(screen.queryByLabelText('Refresh')).not.toBeInTheDocument();
  });

  it('has testid on root element', () => {
    render(
      <TasksSidebar projectName="My App" projectSlug="my-app" tree={makeTree()} />,
    );
    expect(screen.getByTestId('tasks-sidebar')).toBeInTheDocument();
  });

  it('passes onTaskClick to BacklogTree', () => {
    const handleTaskClick = vi.fn();
    render(
      <TasksSidebar
        projectName="My App"
        projectSlug="my-app"
        tree={makeTree()}
        onTaskClick={handleTaskClick}
      />,
    );
    // Expand epic, then story, then click task
    fireEvent.click(screen.getByText('Auth System'));
    fireEvent.click(screen.getByText('Login Flow'));
    fireEvent.click(screen.getByText('Build form'));
    expect(handleTaskClick).toHaveBeenCalledTimes(1);
    expect(handleTaskClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', title: 'Build form' }),
    );
  });
});
