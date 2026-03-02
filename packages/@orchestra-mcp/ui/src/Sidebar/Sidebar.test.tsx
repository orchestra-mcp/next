import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders children content', () => {
    render(
      <Sidebar>
        <div>Sidebar Content</div>
      </Sidebar>
    );

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
  });

  it('applies left position by default', () => {
    const { container } = render(
      <Sidebar>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--left');
  });

  it('applies right position when specified', () => {
    const { container } = render(
      <Sidebar position="right">
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--right');
  });

  it('is open by default', () => {
    const { container } = render(
      <Sidebar>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--open');
    expect(sidebar).not.toHaveClass('sidebar--closed');
  });

  it('can be closed', () => {
    const { container } = render(
      <Sidebar isOpen={false}>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('sidebar--closed');
    expect(sidebar).not.toHaveClass('sidebar--open');
  });

  it('applies custom width', () => {
    const { container } = render(
      <Sidebar width={320}>
        <div>Content</div>
      </Sidebar>
    );

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveStyle({ width: '320px' });
  });

  it('shows overlay when open and showOverlay is true', () => {
    const { container } = render(
      <Sidebar isOpen={true} showOverlay={true}>
        <div>Content</div>
      </Sidebar>
    );

    const overlay = container.querySelector('.sidebar-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('hides overlay when closed', () => {
    const { container } = render(
      <Sidebar isOpen={false} showOverlay={true}>
        <div>Content</div>
      </Sidebar>
    );

    const overlay = container.querySelector('.sidebar-overlay');
    expect(overlay).not.toBeInTheDocument();
  });

  it('hides overlay when showOverlay is false', () => {
    const { container } = render(
      <Sidebar isOpen={true} showOverlay={false}>
        <div>Content</div>
      </Sidebar>
    );

    const overlay = container.querySelector('.sidebar-overlay');
    expect(overlay).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', async () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Sidebar isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Sidebar>
    );

    const overlay = container.querySelector('.sidebar-overlay');
    expect(overlay).toBeInTheDocument();

    await userEvent.click(overlay!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
