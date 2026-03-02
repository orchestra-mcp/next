import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PanelTitleBar } from './PanelTitleBar';

describe('PanelTitleBar', () => {
  it('renders the title text', () => {
    render(<PanelTitleBar title="Settings" />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders with a different title', () => {
    render(<PanelTitleBar title="Extensions" />);
    expect(screen.getByText('Extensions')).toBeInTheDocument();
  });

  it('has the desktop-panel-titlebar class', () => {
    const { container } = render(<PanelTitleBar title="Test" />);
    const bar = container.querySelector('.desktop-panel-titlebar');
    expect(bar).toBeInTheDocument();
  });

  it('has relative positioning for layout', () => {
    const { container } = render(<PanelTitleBar title="Test" />);
    const bar = container.querySelector('.desktop-panel-titlebar');
    expect(bar).toHaveStyle({ position: 'relative' });
  });

  it('renders title inside titlebar element', () => {
    const { container } = render(<PanelTitleBar title="Test" />);
    const bar = container.querySelector('.desktop-panel-titlebar');
    expect(bar).toBeInTheDocument();
  });

  it('renders title with the title class', () => {
    const { container } = render(<PanelTitleBar title="Test" />);
    const titleEl = container.querySelector('.desktop-panel-titlebar__title');
    expect(titleEl).toBeInTheDocument();
  });

  it('renders title text correctly', () => {
    const { container } = render(<PanelTitleBar title="Test" />);
    const titleEl = container.querySelector('.desktop-panel-titlebar__title');
    expect(titleEl).toHaveTextContent('Test');
  });

  it('renders a long title', () => {
    render(<PanelTitleBar title="Orchestra / Extensions / Marketplace" />);
    expect(screen.getByText('Orchestra / Extensions / Marketplace')).toBeInTheDocument();
  });
});
