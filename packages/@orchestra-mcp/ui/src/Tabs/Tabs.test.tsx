import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, Tab } from './Tabs';

const mockTabs: Tab[] = [
  { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
  { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
  { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
];

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={mockTabs} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    render(<Tabs tabs={mockTabs} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    render(<Tabs tabs={mockTabs} />);

    // Click second tab
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();

    // Click third tab
    fireEvent.click(screen.getByText('Tab 3'));
    expect(screen.getByText('Content 3')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('respects defaultActiveId', () => {
    render(<Tabs tabs={mockTabs} defaultActiveId="tab2" />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={mockTabs} onTabChange={handleChange} />);

    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('works in controlled mode', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Tabs tabs={mockTabs} activeId="tab1" onTabChange={handleChange} />
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();

    // Click tab 2
    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');

    // Content doesn't change until parent updates activeId
    expect(screen.getByText('Content 1')).toBeInTheDocument();

    // Parent updates activeId
    rerender(<Tabs tabs={mockTabs} activeId="tab2" onTabChange={handleChange} />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('renders disabled tabs', () => {
    const tabsWithDisabled: Tab[] = [
      ...mockTabs,
      { id: 'tab4', label: 'Disabled Tab', content: <div>Content 4</div>, disabled: true },
    ];

    render(<Tabs tabs={tabsWithDisabled} />);

    const disabledTab = screen.getByText('Disabled Tab').closest('button');
    expect(disabledTab).toHaveAttribute('disabled');
    expect(disabledTab).toHaveClass('tab--disabled');
  });

  it('does not switch to disabled tabs', () => {
    const tabsWithDisabled: Tab[] = [
      mockTabs[0],
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
    ];

    render(<Tabs tabs={tabsWithDisabled} />);

    fireEvent.click(screen.getByText('Tab 2'));
    // Should still show content 1
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('renders tabs with icons', () => {
    const tabsWithIcons: Tab[] = [
      {
        id: 'tab1',
        label: 'Tab 1',
        content: <div>Content 1</div>,
        icon: <span data-testid="icon-1">🏠</span>,
      },
    ];

    render(<Tabs tabs={tabsWithIcons} />);
    expect(screen.getByTestId('icon-1')).toBeInTheDocument();
  });

  it('renders horizontal orientation by default', () => {
    const { container } = render(<Tabs tabs={mockTabs} />);
    expect(container.querySelector('.tabs--horizontal')).toBeInTheDocument();
  });

  it('renders vertical orientation', () => {
    const { container } = render(<Tabs tabs={mockTabs} orientation="vertical" />);
    expect(container.querySelector('.tabs--vertical')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Tabs tabs={mockTabs} className="custom-class" />);
    expect(container.querySelector('.tabs.custom-class')).toBeInTheDocument();
  });

  it('sets aria attributes correctly', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab1 = screen.getByText('Tab 1').closest('[role="tab"]');
    const tab2 = screen.getByText('Tab 2').closest('[role="tab"]');

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('updates aria-orientation for vertical tabs', () => {
    render(<Tabs tabs={mockTabs} orientation="vertical" />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
  });
});
