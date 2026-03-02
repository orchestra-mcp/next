import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StaleNotification } from './StaleNotification';

describe('StaleNotification', () => {
  it('renders notification text', () => {
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Task updated externally')).toBeInTheDocument();
  });

  it('calls onRefresh when Refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<StaleNotification onRefresh={onRefresh} onDismiss={vi.fn()} />);

    fireEvent.click(screen.getByText('Refresh'));
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has role="status" for accessibility', () => {
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct data-testid', () => {
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByTestId('stale-notification')).toBeInTheDocument();
  });

  it('renders Refresh button with correct BEM class', () => {
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={vi.fn()} />);
    const btn = screen.getByText('Refresh');
    expect(btn).toHaveClass('stale-notification__btn--refresh');
  });

  it('renders dismiss button with correct BEM class', () => {
    render(<StaleNotification onRefresh={vi.fn()} onDismiss={vi.fn()} />);
    const btn = screen.getByLabelText('Dismiss');
    expect(btn).toHaveClass('stale-notification__btn--dismiss');
  });
});
