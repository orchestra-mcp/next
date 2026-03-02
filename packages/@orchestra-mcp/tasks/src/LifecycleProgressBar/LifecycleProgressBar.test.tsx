import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LifecycleProgressBar } from './LifecycleProgressBar';

const STEP_KEYS = [
  'backlog',
  'todo',
  'in-progress',
  'ready-for-testing',
  'in-testing',
  'ready-for-docs',
  'in-docs',
  'documented',
  'in-review',
  'done',
];

const STEP_LABELS = [
  'Backlog',
  'To Do',
  'In Progress',
  'Ready for Testing',
  'In Testing',
  'Ready for Docs',
  'In Docs',
  'Documented',
  'In Review',
  'Done',
];

describe('LifecycleProgressBar', () => {
  it('renders 10 dots for the main lifecycle track', () => {
    render(<LifecycleProgressBar status="backlog" />);
    STEP_KEYS.forEach((key) => {
      expect(screen.getByTestId(`step-${key}`)).toBeInTheDocument();
    });
  });

  it('marks correct dot as current for "in-progress" status', () => {
    render(<LifecycleProgressBar status="in-progress" />);
    const dot = screen.getByTestId('step-in-progress');
    expect(dot).toHaveClass('lifecycle-bar__dot--current');
  });

  it('marks first 2 dots as past for "in-progress" (backlog, todo)', () => {
    render(<LifecycleProgressBar status="in-progress" />);
    expect(screen.getByTestId('step-backlog')).toHaveClass('lifecycle-bar__dot--past');
    expect(screen.getByTestId('step-todo')).toHaveClass('lifecycle-bar__dot--past');
  });

  it('marks dots after current as future', () => {
    render(<LifecycleProgressBar status="in-progress" />);
    const futureKeys = [
      'ready-for-testing',
      'in-testing',
      'ready-for-docs',
      'in-docs',
      'documented',
      'in-review',
      'done',
    ];
    futureKeys.forEach((key) => {
      expect(screen.getByTestId(`step-${key}`)).toHaveClass('lifecycle-bar__dot--future');
    });
  });

  it('shows all dots as future/dimmed for "blocked" status', () => {
    render(<LifecycleProgressBar status="blocked" />);
    STEP_KEYS.forEach((key) => {
      expect(screen.getByTestId(`step-${key}`)).toHaveClass('lifecycle-bar__dot--future');
    });
  });

  it('shows special indicator text for "blocked" status', () => {
    render(<LifecycleProgressBar status="blocked" />);
    const special = screen.getByTestId('special-status');
    expect(special).toHaveTextContent('Blocked');
    expect(special).toHaveStyle({ color: '#ef4444' });
  });

  it('shows special indicator text for "rejected" status', () => {
    render(<LifecycleProgressBar status="rejected" />);
    const special = screen.getByTestId('special-status');
    expect(special).toHaveTextContent('Rejected');
    expect(special).toHaveStyle({ color: '#ef4444' });
  });

  it('shows special indicator text for "cancelled" status', () => {
    render(<LifecycleProgressBar status="cancelled" />);
    const special = screen.getByTestId('special-status');
    expect(special).toHaveTextContent('Cancelled');
    expect(special).toHaveStyle({ color: '#6b7280' });
  });

  it('does not show special indicator for normal statuses like "todo"', () => {
    render(<LifecycleProgressBar status="todo" />);
    expect(screen.queryByTestId('special-status')).not.toBeInTheDocument();
  });

  it('marks all 10 dots as past or current for "done" status', () => {
    render(<LifecycleProgressBar status="done" />);
    // "done" is the last step (index 9), so indices 0-8 are past, index 9 is current
    const pastKeys = STEP_KEYS.slice(0, 9);
    pastKeys.forEach((key) => {
      expect(screen.getByTestId(`step-${key}`)).toHaveClass('lifecycle-bar__dot--past');
    });
    expect(screen.getByTestId('step-done')).toHaveClass('lifecycle-bar__dot--current');
  });

  it('uses sm size class by default', () => {
    render(<LifecycleProgressBar status="todo" />);
    expect(screen.getByTestId('lifecycle-bar')).toHaveClass('lifecycle-bar--sm');
  });

  it('applies md size class when specified', () => {
    render(<LifecycleProgressBar status="todo" size="md" />);
    expect(screen.getByTestId('lifecycle-bar')).toHaveClass('lifecycle-bar--md');
  });

  it('each dot has correct title attribute', () => {
    render(<LifecycleProgressBar status="backlog" />);
    STEP_KEYS.forEach((key, i) => {
      expect(screen.getByTestId(`step-${key}`)).toHaveAttribute('title', STEP_LABELS[i]);
    });
  });
});
