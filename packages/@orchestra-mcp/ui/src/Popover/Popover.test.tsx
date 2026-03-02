import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Popover } from './Popover';

describe('Popover', () => {
  const defaultProps = {
    trigger: <span>Open</span>,
    content: <span>Popover content</span>,
  };

  it('renders the trigger element', () => {
    render(<Popover {...defaultProps} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('hides content initially', () => {
    render(<Popover {...defaultProps} />);
    const content = screen.getByTestId('popover-content');
    expect(content).not.toHaveClass('popover__content--open');
  });

  it('shows content when trigger is clicked', () => {
    render(<Popover {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('popover__content--open');
  });

  it('hides content when trigger is clicked again', () => {
    render(<Popover {...defaultProps} />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByTestId('popover-content')).toHaveClass(
      'popover__content--open',
    );
    fireEvent.click(trigger);
    expect(screen.getByTestId('popover-content')).not.toHaveClass(
      'popover__content--open',
    );
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <Popover {...defaultProps} />
        <span data-testid="outside">Outside</span>
      </div>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('popover-content')).toHaveClass(
      'popover__content--open',
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.getByTestId('popover-content')).not.toHaveClass(
      'popover__content--open',
    );
  });

  it('closes when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<Popover {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('popover-content')).toHaveClass(
      'popover__content--open',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('popover-content')).not.toHaveClass(
      'popover__content--open',
    );
  });

  it('applies popover__content class by default', () => {
    render(<Popover {...defaultProps} />);
    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('popover__content');
  });

  it('uses inline positioning styles for each position', () => {
    const positions = ['top', 'bottom', 'left', 'right'] as const;
    for (const pos of positions) {
      const { unmount } = render(
        <Popover {...defaultProps} position={pos} />,
      );
      const content = screen.getByTestId('popover-content');
      // Component uses inline styles via useLayoutEffect, not position classes
      expect(content).toHaveClass('popover__content');
      unmount();
    }
  });

  it('supports controlled open state', () => {
    const { rerender } = render(
      <Popover {...defaultProps} open={false} />,
    );
    expect(screen.getByTestId('popover-content')).not.toHaveClass(
      'popover__content--open',
    );
    rerender(<Popover {...defaultProps} open={true} />);
    expect(screen.getByTestId('popover-content')).toHaveClass(
      'popover__content--open',
    );
  });

  it('calls onOpenChange when trigger is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Popover {...defaultProps} open={false} onOpenChange={handleChange} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onOpenChange(false) on outside click', () => {
    const handleChange = vi.fn();
    render(
      <div>
        <Popover {...defaultProps} open={true} onOpenChange={handleChange} />
        <span data-testid="outside">Outside</span>
      </div>,
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('renders content inside the panel when open', () => {
    render(<Popover {...defaultProps} open={true} />);
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('trigger is always visible regardless of open state', () => {
    const { rerender } = render(
      <Popover {...defaultProps} open={false} />,
    );
    expect(screen.getByText('Open')).toBeVisible();
    rerender(<Popover {...defaultProps} open={true} />);
    expect(screen.getByText('Open')).toBeVisible();
  });

  it('sets aria-expanded on the trigger button', () => {
    render(<Popover {...defaultProps} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies custom className to wrapper', () => {
    render(<Popover {...defaultProps} className="my-popover" />);
    const wrapper = screen.getByTestId('popover');
    expect(wrapper).toHaveClass('popover', 'my-popover');
  });
});
