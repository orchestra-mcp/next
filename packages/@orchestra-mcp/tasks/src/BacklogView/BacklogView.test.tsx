import { render, screen, fireEvent } from '@testing-library/react';
import { BacklogView } from './BacklogView';
import type { BacklogColumn } from './BacklogView';

const makeColumns = (overrides?: Partial<BacklogColumn>[]): BacklogColumn[] => [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c1', title: 'Setup repo', priority: 'high', type: 'task', assignee: 'Jane Doe', tags: ['infra'] },
      { id: 'c2', title: 'Fix login bug', priority: 'critical', type: 'bug' },
    ],
    ...overrides?.[0],
  },
  {
    id: 'progress',
    title: 'In Progress',
    cards: [
      { id: 'c3', title: 'Build dashboard', type: 'story', description: 'Main dashboard view' },
    ],
    ...overrides?.[1],
  },
];

describe('BacklogView', () => {
  it('renders columns', () => {
    render(<BacklogView columns={makeColumns()} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders cards within their columns', () => {
    render(<BacklogView columns={makeColumns()} />);
    expect(screen.getByText('Setup repo')).toBeInTheDocument();
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Build dashboard')).toBeInTheDocument();
  });

  it('shows card count in column header', () => {
    render(<BacklogView columns={makeColumns()} />);
    expect(screen.getByTestId('count-todo')).toHaveTextContent('2');
    expect(screen.getByTestId('count-progress')).toHaveTextContent('1');
  });

  it('displays priority badge on cards', () => {
    render(<BacklogView columns={makeColumns()} />);
    const highPriority = screen.getByTestId('priority-c1');
    expect(highPriority).toHaveClass('backlog__card-priority--high');
    const criticalPriority = screen.getByTestId('priority-c2');
    expect(criticalPriority).toHaveClass('backlog__card-priority--critical');
  });

  it('fires onCardClick when a card is clicked', () => {
    const handleClick = vi.fn();
    render(<BacklogView columns={makeColumns()} onCardClick={handleClick} />);
    fireEvent.click(screen.getByTestId('card-c1'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'c1', title: 'Setup repo' }),
    );
  });

  it('displays card type icon', () => {
    render(<BacklogView columns={makeColumns()} />);
    expect(screen.getByTestId('type-c1')).toBeInTheDocument();
    expect(screen.getByTestId('type-c2')).toBeInTheDocument();
  });

  it('displays assignee initials', () => {
    render(<BacklogView columns={makeColumns()} />);
    const assignee = screen.getByTestId('assignee-c1');
    expect(assignee).toHaveTextContent('JD');
  });

  it('displays tag chips', () => {
    render(<BacklogView columns={makeColumns()} />);
    const tags = screen.getByTestId('tags-c1');
    expect(tags).toHaveTextContent('infra');
  });

  it('renders empty columns without errors', () => {
    const empty: BacklogColumn[] = [
      { id: 'empty', title: 'Empty', cards: [] },
    ];
    render(<BacklogView columns={empty} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByTestId('count-empty')).toHaveTextContent('0');
  });

  it('applies compact class when compact prop is true', () => {
    render(<BacklogView columns={makeColumns()} compact />);
    expect(screen.getByTestId('backlog-view')).toHaveClass('backlog--compact');
  });
});
