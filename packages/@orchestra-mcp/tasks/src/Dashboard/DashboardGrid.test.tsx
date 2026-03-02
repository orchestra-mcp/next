import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardGrid } from './DashboardGrid';
import type { WidgetLayout } from '../stores/useDashboardStore';

const makeWidgets = (overrides?: Partial<WidgetLayout>[]): WidgetLayout[] => [
  {
    id: 'w-status',
    type: 'status-overview',
    col: 1,
    row: 1,
    colSpan: 4,
    rowSpan: 2,
    collapsed: false,
    ...overrides?.[0],
  },
  {
    id: 'w-backlog',
    type: 'backlog-tree',
    col: 5,
    row: 1,
    colSpan: 8,
    rowSpan: 4,
    collapsed: false,
    ...overrides?.[1],
  },
  {
    id: 'w-sprint',
    type: 'sprint-progress',
    col: 1,
    row: 3,
    colSpan: 4,
    rowSpan: 2,
    collapsed: false,
    ...overrides?.[2],
  },
];

describe('DashboardGrid', () => {
  it('renders correct number of grid items based on widgets prop', () => {
    const renderWidget = vi.fn((w: WidgetLayout) => <div>{w.type}</div>);
    render(<DashboardGrid widgets={makeWidgets()} columns={12} renderWidget={renderWidget} />);

    expect(screen.getByTestId('widget-w-status')).toBeInTheDocument();
    expect(screen.getByTestId('widget-w-backlog')).toBeInTheDocument();
    expect(screen.getByTestId('widget-w-sprint')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^widget-/).length).toBe(3);
  });

  it('grid items have correct gridColumn styles', () => {
    const renderWidget = vi.fn(() => <div>content</div>);
    render(<DashboardGrid widgets={makeWidgets()} columns={12} renderWidget={renderWidget} />);

    const statusItem = screen.getByTestId('widget-w-status');
    expect(statusItem).toHaveStyle({ gridColumn: 'span 4' });

    const backlogItem = screen.getByTestId('widget-w-backlog');
    expect(backlogItem).toHaveStyle({ gridColumn: 'span 8' });
  });

  it('calls renderWidget for each widget', () => {
    const renderWidget = vi.fn((w: WidgetLayout) => <div>{w.type}</div>);
    const widgets = makeWidgets();
    render(<DashboardGrid widgets={widgets} columns={12} renderWidget={renderWidget} />);

    expect(renderWidget).toHaveBeenCalledTimes(3);
    expect(renderWidget).toHaveBeenCalledWith(widgets[0]);
    expect(renderWidget).toHaveBeenCalledWith(widgets[1]);
    expect(renderWidget).toHaveBeenCalledWith(widgets[2]);
  });

  it('collapsed widgets get collapsed class', () => {
    const renderWidget = vi.fn(() => <div>content</div>);
    const widgets = makeWidgets([
      { collapsed: true },
      undefined,
      { collapsed: true },
    ]);
    render(<DashboardGrid widgets={widgets} columns={12} renderWidget={renderWidget} />);

    const statusItem = screen.getByTestId('widget-w-status');
    expect(statusItem).toHaveClass('dashboard-grid__item--collapsed');

    const backlogItem = screen.getByTestId('widget-w-backlog');
    expect(backlogItem).not.toHaveClass('dashboard-grid__item--collapsed');

    const sprintItem = screen.getByTestId('widget-w-sprint');
    expect(sprintItem).toHaveClass('dashboard-grid__item--collapsed');
  });

  it('applies custom className to the grid container', () => {
    const renderWidget = vi.fn(() => null);
    render(
      <DashboardGrid widgets={[]} columns={12} renderWidget={renderWidget} className="custom-class" />,
    );
    expect(screen.getByTestId('dashboard-grid')).toHaveClass('custom-class');
  });

  it('renders empty grid without errors', () => {
    const renderWidget = vi.fn(() => null);
    render(<DashboardGrid widgets={[]} columns={12} renderWidget={renderWidget} />);
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    expect(renderWidget).not.toHaveBeenCalled();
  });
});
