import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  it('renders topbar with navigation', () => {
    render(<Topbar />);

    expect(screen.getByLabelText('Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Forward')).toBeInTheDocument();
    expect(screen.getByText(/Orchestra/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const mockBack = vi.fn();
    render(<Topbar onBack={mockBack} />);

    fireEvent.click(screen.getByLabelText('Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls onForward when forward button is clicked', () => {
    const mockForward = vi.fn();
    render(<Topbar onForward={mockForward} />);

    fireEvent.click(screen.getByLabelText('Forward'));
    expect(mockForward).toHaveBeenCalled();
  });

  it('renders header element', () => {
    const { container } = render(<Topbar />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('renders custom breadcrumb text', () => {
    render(<Topbar breadcrumb="Settings" />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
