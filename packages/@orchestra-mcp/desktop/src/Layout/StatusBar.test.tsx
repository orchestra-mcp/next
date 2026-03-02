import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  it('renders status bar with info', () => {
    render(<StatusBar />);

    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/Orchestra v0.1.0/)).toBeInTheDocument();
    // Plugin count is shown as a number next to an ExtensionsIcon, not "Plugins:" text
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays the loaded plugin count', () => {
    render(<StatusBar loadedCount={5} />);

    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('shows notification count when notifications exist', () => {
    render(<StatusBar notificationCount={2} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides notification count when there are no notifications', () => {
    render(<StatusBar notificationCount={0} />);

    // The notification span is not rendered when count is 0
    const notification = screen.queryByText('0', {
      selector: '.desktop-statusbar__notification',
    });
    expect(notification).not.toBeInTheDocument();
  });

  it('renders footer element', () => {
    const { container } = render(<StatusBar />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
