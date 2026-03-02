import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PanelError } from './PanelError';

describe('PanelError', () => {
  const testError = new Error('Something went wrong');
  const testRoute = '/panels/settings';

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the Panel Error heading', () => {
    render(<PanelError error={testError} route={testRoute} />);
    expect(screen.getByRole('heading', { name: 'Panel Error' })).toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(<PanelError error={testError} route={testRoute} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows the panel route in the error description', () => {
    render(<PanelError error={testError} route={testRoute} />);
    expect(screen.getByText('/panels/settings')).toBeInTheDocument();
  });

  it('renders the Reload Panel button', () => {
    render(<PanelError error={testError} route={testRoute} />);
    expect(screen.getByRole('button', { name: 'Reload Panel' })).toBeInTheDocument();
  });

  it('calls onReload when Reload button is clicked', async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();
    render(<PanelError error={testError} route={testRoute} onReload={onReload} />);

    await user.click(screen.getByRole('button', { name: 'Reload Panel' }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('calls window.location.reload when no onReload is provided', async () => {
    const user = userEvent.setup();
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    render(<PanelError error={testError} route={testRoute} />);

    await user.click(screen.getByRole('button', { name: 'Reload Panel' }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('logs the error to console on mount', () => {
    render(<PanelError error={testError} route={testRoute} />);
    expect(console.error).toHaveBeenCalledWith('Panel error:', testError);
  });

  it('shows stack trace details section when error has a stack', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at Component (file.tsx:10)';
    render(<PanelError error={errorWithStack} route={testRoute} />);
    expect(screen.getByText('Stack trace')).toBeInTheDocument();
  });

  it('does not show stack trace when error has no stack', () => {
    const errorNoStack = new Error('No stack');
    delete errorNoStack.stack;
    render(<PanelError error={errorNoStack} route={testRoute} />);
    expect(screen.queryByText('Stack trace')).not.toBeInTheDocument();
  });
});
