import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders content', () => {
    render(<Panel>Panel content</Panel>);
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Panel title="Test Panel">Content</Panel>);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Panel title="Test Panel" footer={<div>Footer content</div>}>
        Content
      </Panel>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('renders header actions when provided', () => {
    render(
      <Panel title="Test Panel" headerActions={<button>Action</button>}>
        Content
      </Panel>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('is not collapsible by default', () => {
    render(<Panel title="Test Panel">Content</Panel>);
    const header = screen.getByText('Test Panel').closest('.panel-header');
    expect(header).not.toHaveClass('collapsible');
  });

  it('can be collapsible', () => {
    render(
      <Panel title="Test Panel" collapsible>
        Content
      </Panel>
    );
    const header = screen.getByText('Test Panel').closest('.panel-header');
    expect(header).toHaveClass('collapsible');
  });

  it('toggles collapse when clicked', () => {
    render(
      <Panel title="Test Panel" collapsible>
        Content
      </Panel>
    );

    // Initially expanded
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Click to collapse
    const header = screen.getByText('Test Panel').closest('.panel-header');
    if (header) {
      fireEvent.click(header);
    }

    // Content should be hidden
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Click to expand
    if (header) {
      fireEvent.click(header);
    }

    // Content should be visible again
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('can start collapsed', () => {
    render(
      <Panel title="Test Panel" collapsible defaultCollapsed>
        Content
      </Panel>
    );

    // Content should be hidden initially
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Panel className="custom-class">Content</Panel>
    );
    expect(container.querySelector('.panel.custom-class')).toBeInTheDocument();
  });

  it('does not collapse footer when collapsed', () => {
    render(
      <Panel title="Test Panel" collapsible defaultCollapsed footer={<div>Footer</div>}>
        Content
      </Panel>
    );

    // Footer should also be hidden when collapsed
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();
  });

  it('prevents header action clicks from toggling collapse', () => {
    const handleActionClick = vi.fn();

    render(
      <Panel
        title="Test Panel"
        collapsible
        headerActions={<button onClick={handleActionClick}>Action</button>}
      >
        Content
      </Panel>
    );

    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);

    // Action should be clicked
    expect(handleActionClick).toHaveBeenCalledTimes(1);

    // Panel should still be expanded (stopPropagation should prevent collapse)
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
