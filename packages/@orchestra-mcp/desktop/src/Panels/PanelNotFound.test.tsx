import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PanelNotFound } from './PanelNotFound';

describe('PanelNotFound', () => {
  it('renders the Panel Not Found heading', () => {
    render(<PanelNotFound route="/panels/missing" />);
    expect(screen.getByRole('heading', { name: 'Panel Not Found' })).toBeInTheDocument();
  });

  it('shows the route in the message', () => {
    render(<PanelNotFound route="/panels/my-panel" />);
    expect(screen.getByText('/panels/my-panel')).toBeInTheDocument();
  });

  it('renders the Go Back button', () => {
    render(<PanelNotFound route="/panels/missing" />);
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });

  it('calls onGoBack when Go Back is clicked', async () => {
    const user = userEvent.setup();
    const onGoBack = vi.fn();
    render(<PanelNotFound route="/panels/missing" onGoBack={onGoBack} />);

    await user.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(onGoBack).toHaveBeenCalledTimes(1);
  });

  it('calls window.history.back when no onGoBack is provided', async () => {
    const user = userEvent.setup();
    const historyBackMock = vi.fn();
    vi.spyOn(window.history, 'back').mockImplementation(historyBackMock);

    render(<PanelNotFound route="/panels/missing" />);
    await user.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(historyBackMock).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('shows hint about plugin installation', () => {
    render(<PanelNotFound route="/panels/missing" />);
    expect(screen.getByText(/not be registered/i)).toBeInTheDocument();
  });

  it('renders centered layout structure', () => {
    const { container } = render(<PanelNotFound route="/panels/missing" />);
    const wrapper = container.querySelector('.desktop-panel-state');
    expect(wrapper).toBeInTheDocument();
  });

  it('displays the route in a code element', () => {
    const { container } = render(<PanelNotFound route="/panels/settings" />);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('/panels/settings');
  });
});
