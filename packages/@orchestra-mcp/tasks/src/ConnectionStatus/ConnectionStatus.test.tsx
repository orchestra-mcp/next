import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionStatus, ConnectionStatusDot, ConnectionStatusBanner } from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('renders green dot for connected', () => {
    render(<ConnectionStatus status="connected" />);
    const dot = screen.getByRole('status');
    expect(dot).toHaveClass('connection-status__dot--connected');
  });

  it('renders amber pulsing dot for reconnecting', () => {
    render(<ConnectionStatus status="reconnecting" />);
    const dot = screen.getByRole('status');
    expect(dot).toHaveClass('connection-status__dot--reconnecting');
  });

  it('renders red dot for disconnected', () => {
    render(<ConnectionStatus status="disconnected" />);
    const dot = screen.getByRole('status');
    expect(dot).toHaveClass('connection-status__dot--disconnected');
  });

  it('shows no banner when connected', () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.queryByTestId('connection-status-banner')).not.toBeInTheDocument();
  });

  it('shows reconnecting banner with correct text', () => {
    render(<ConnectionStatus status="reconnecting" />);
    const banner = screen.getByTestId('connection-status-banner');
    expect(banner).toHaveTextContent('Reconnecting to server...');
    expect(banner).toHaveClass('connection-status__banner--reconnecting');
  });

  it('shows disconnected banner with correct text', () => {
    render(<ConnectionStatus status="disconnected" />);
    const banner = screen.getByTestId('connection-status-banner');
    expect(banner).toHaveTextContent('Connection lost. Click refresh to retry.');
    expect(banner).toHaveClass('connection-status__banner--disconnected');
  });

  it('has correct aria-label for connected', () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByLabelText('Connected')).toBeInTheDocument();
  });

  it('has correct aria-label for reconnecting', () => {
    render(<ConnectionStatus status="reconnecting" />);
    expect(screen.getByLabelText('Reconnecting...')).toBeInTheDocument();
  });

  it('has correct aria-label for disconnected', () => {
    render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByLabelText('Connection lost')).toBeInTheDocument();
  });

  it('has correct title attribute matching status', () => {
    render(<ConnectionStatus status="connected" />);
    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('title', 'Connected');
  });

  it('renders root element with testid', () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });

  it('banner has alert role for accessibility', () => {
    render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('ConnectionStatusDot', () => {
  it('renders dot with correct class for each status', () => {
    const { unmount } = render(<ConnectionStatusDot status="connected" />);
    expect(screen.getByRole('status')).toHaveClass('connection-status__dot--connected');
    unmount();

    render(<ConnectionStatusDot status="reconnecting" />);
    expect(screen.getByRole('status')).toHaveClass('connection-status__dot--reconnecting');
  });

  it('has testid on the dot element', () => {
    render(<ConnectionStatusDot status="connected" />);
    expect(screen.getByTestId('connection-status-dot')).toBeInTheDocument();
  });

  it('has correct title and aria-label', () => {
    render(<ConnectionStatusDot status="disconnected" />);
    const dot = screen.getByRole('status');
    expect(dot).toHaveAttribute('title', 'Connection lost');
    expect(dot).toHaveAttribute('aria-label', 'Connection lost');
  });
});

describe('ConnectionStatusBanner', () => {
  it('returns null when connected', () => {
    const { container } = render(<ConnectionStatusBanner status="connected" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders reconnecting banner text', () => {
    render(<ConnectionStatusBanner status="reconnecting" />);
    const banner = screen.getByTestId('connection-status-banner');
    expect(banner).toHaveTextContent('Reconnecting to server...');
    expect(banner).toHaveClass('connection-status__banner--reconnecting');
  });

  it('renders disconnected banner text', () => {
    render(<ConnectionStatusBanner status="disconnected" />);
    const banner = screen.getByTestId('connection-status-banner');
    expect(banner).toHaveTextContent('Connection lost. Click refresh to retry.');
    expect(banner).toHaveClass('connection-status__banner--disconnected');
  });

  it('has alert role', () => {
    render(<ConnectionStatusBanner status="disconnected" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
