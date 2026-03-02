import { render, screen, fireEvent } from '@testing-library/react';
import { Widget } from './Widget';

describe('Widget', () => {
  it('renders title and content', () => {
    render(<Widget title="My Widget">Hello World</Widget>);
    expect(screen.getByText('My Widget')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders icon in header', () => {
    render(
      <Widget title="With Icon" icon={<span data-testid="icon">IC</span>}>
        Content
      </Widget>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders actions and fires callbacks', () => {
    const handleClick = vi.fn();
    render(
      <Widget
        title="Actions"
        actions={[{ id: 'a1', label: 'Delete', onClick: handleClick }]}
      >
        Content
      </Widget>,
    );
    const btn = screen.getByLabelText('Delete');
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders action icon when provided', () => {
    render(
      <Widget
        title="Icon Action"
        actions={[
          { id: 'a1', label: 'Star', icon: <span data-testid="star">S</span>, onClick: vi.fn() },
        ]}
      >
        Content
      </Widget>,
    );
    expect(screen.getByTestId('star')).toBeInTheDocument();
  });

  it('toggles collapse when collapsible', () => {
    render(
      <Widget title="Collapsible" collapsible>
        Body Text
      </Widget>,
    );
    const toggle = screen.getByLabelText('Collapse');
    expect(screen.getByText('Body Text')).toBeVisible();
    fireEvent.click(toggle);
    expect(screen.getByLabelText('Expand')).toBeInTheDocument();
  });

  it('starts collapsed when defaultCollapsed is true', () => {
    render(
      <Widget title="Start Collapsed" collapsible defaultCollapsed>
        Hidden Content
      </Widget>,
    );
    expect(screen.getByLabelText('Expand')).toBeInTheDocument();
    const body = screen.getByText('Hidden Content').closest('.widget__body');
    expect(body).toHaveClass('widget__body--hidden');
  });

  it('shows loading shimmer overlay', () => {
    render(
      <Widget title="Loading" loading>
        Content
      </Widget>,
    );
    expect(screen.getByTestId('widget-loading')).toBeInTheDocument();
  });

  it('shows error message with retry button', () => {
    const handleRefresh = vi.fn();
    render(
      <Widget title="Error Widget" error="Something went wrong" onRefresh={handleRefresh}>
        Content
      </Widget>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    const retryBtn = screen.getByText('Retry');
    retryBtn.click();
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows error without retry when no onRefresh', () => {
    render(
      <Widget title="Error No Retry" error="Failure">
        Content
      </Widget>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failure');
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const handleRefresh = vi.fn();
    render(
      <Widget title="Refreshable" onRefresh={handleRefresh}>
        Content
      </Widget>,
    );
    const refreshBtn = screen.getByLabelText('Refresh');
    refreshBtn.click();
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('applies size classes', () => {
    const { rerender } = render(
      <Widget title="Small" size="small">Content</Widget>,
    );
    expect(screen.getByTestId('widget')).toHaveClass('widget--small');

    rerender(<Widget title="Large" size="large">Content</Widget>);
    expect(screen.getByTestId('widget')).toHaveClass('widget--large');
  });

  it('renders children correctly', () => {
    render(
      <Widget title="Children">
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </Widget>,
    );
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
