import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BacklogTreeWidget } from './BacklogTreeWidget';
import type { TreeNode } from './BacklogTreeWidget';

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
          { id: 'task-1', title: 'Build login form', type: 'task', status: 'todo', priority: 'high' },
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
  },
];

describe('BacklogTreeWidget', () => {
  it('renders tree nodes with correct titles', () => {
    render(<BacklogTreeWidget tree={makeTree()} />);

    expect(screen.getByText('Auth System')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows expand arrow for nodes with children', () => {
    render(<BacklogTreeWidget tree={makeTree()} />);

    const epicNode = screen.getByTestId('tree-node-epic-1');
    const expandArrow = epicNode.querySelector('.backlog-tree__expand');
    expect(expandArrow).not.toHaveClass('backlog-tree__expand--hidden');

    const leafNode = screen.getByTestId('tree-node-epic-2');
    const hiddenArrow = leafNode.querySelector('.backlog-tree__expand');
    expect(hiddenArrow).toHaveClass('backlog-tree__expand--hidden');
  });

  it('calls onNodeClick when a node is clicked', () => {
    const handleClick = vi.fn();
    render(<BacklogTreeWidget tree={makeTree()} onNodeClick={handleClick} />);

    fireEvent.click(screen.getByTestId('tree-node-epic-2'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'epic-2', title: 'Dashboard' }),
    );
  });

  it('calls onNodeExpand when expandable node is clicked (controlled mode)', () => {
    const handleExpand = vi.fn();
    const expandedNodes = new Set<string>();
    render(<BacklogTreeWidget tree={makeTree()} onNodeExpand={handleExpand} expandedNodes={expandedNodes} />);

    fireEvent.click(screen.getByTestId('tree-node-epic-1'));
    expect(handleExpand).toHaveBeenCalledTimes(1);
    expect(handleExpand).toHaveBeenCalledWith('epic-1');
  });

  it('does not call onNodeExpand for leaf nodes', () => {
    const handleExpand = vi.fn();
    render(<BacklogTreeWidget tree={makeTree()} onNodeExpand={handleExpand} />);

    fireEvent.click(screen.getByTestId('tree-node-epic-2'));
    expect(handleExpand).not.toHaveBeenCalled();
  });

  it('shows selected state for selectedNode', () => {
    render(
      <BacklogTreeWidget tree={makeTree()} selectedNode="epic-1" />,
    );

    const selected = screen.getByTestId('tree-node-epic-1');
    expect(selected).toHaveClass('backlog-tree__node--selected');

    const notSelected = screen.getByTestId('tree-node-epic-2');
    expect(notSelected).not.toHaveClass('backlog-tree__node--selected');
  });

  it('renders children when node is expanded', () => {
    const expandedNodes = new Set(['epic-1']);
    render(
      <BacklogTreeWidget tree={makeTree()} expandedNodes={expandedNodes} />,
    );

    expect(screen.getByText('Login Flow')).toBeInTheDocument();
    expect(screen.getByTestId('tree-children-epic-1')).toBeInTheDocument();
  });

  it('does not render children when node is collapsed', () => {
    render(<BacklogTreeWidget tree={makeTree()} />);

    expect(screen.queryByText('Login Flow')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tree-children-epic-1')).not.toBeInTheDocument();
  });

  it('renders nested children when multiple levels are expanded', () => {
    const expandedNodes = new Set(['epic-1', 'story-1']);
    render(
      <BacklogTreeWidget tree={makeTree()} expandedNodes={expandedNodes} />,
    );

    expect(screen.getByText('Build login form')).toBeInTheDocument();
    expect(screen.getByText('Add validation')).toBeInTheDocument();
  });

  it('shows empty message when tree is empty', () => {
    render(<BacklogTreeWidget tree={[]} />);
    expect(screen.getByTestId('backlog-tree-empty')).toHaveTextContent('No items in backlog');
  });
});
