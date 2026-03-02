import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusOverviewWidget } from './StatusOverviewWidget';
import type { StatusCount } from '../StatusGrid';

const makeStatuses = (): StatusCount[] => [
  { status: 'todo', label: 'To Do', count: 12, color: '#eab308' },
  { status: 'in-progress', label: 'In Progress', count: 5, color: '#3b82f6' },
  { status: 'done', label: 'Done', count: 23, color: '#22c55e' },
];

describe('StatusOverviewWidget', () => {
  it('shows total tasks count and completion percent', () => {
    render(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={58}
      />,
    );

    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('58%')).toBeInTheDocument();
    expect(screen.getByText('total tasks')).toBeInTheDocument();
    expect(screen.getByText('complete')).toBeInTheDocument();
  });

  it('progress bar has correct width style', () => {
    render(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={75}
      />,
    );

    const progressTrack = screen.getByTestId('status-overview-progress');
    const progressBar = progressTrack.querySelector('.status-overview__progress-bar');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('clamps percent to 0-100 range', () => {
    const { rerender } = render(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={150}
      />,
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    const progressTrack = screen.getByTestId('status-overview-progress');
    const progressBar = progressTrack.querySelector('.status-overview__progress-bar');
    expect(progressBar).toHaveStyle({ width: '100%' });

    rerender(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={-10}
      />,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders StatusGrid with statuses', () => {
    render(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={58}
      />,
    );

    expect(screen.getByTestId('status-grid')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders status counts in the grid', () => {
    render(
      <StatusOverviewWidget
        statuses={makeStatuses()}
        totalTasks={40}
        completionPercent={58}
      />,
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });
});
