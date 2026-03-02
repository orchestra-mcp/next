import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import type { SidebarView } from './Sidebar';

describe('Sidebar', () => {
  const views: SidebarView[] = [
    { id: 'files', title: 'Files', icon: 'files', route: '/panels/files' },
    { id: 'search', title: 'Search', icon: 'search', route: '/panels/search' },
    { id: 'extensions', title: 'Extensions', icon: 'extensions', route: '/panels/extensions' },
  ];

  it('renders sidebar with navigation buttons', () => {
    const { container } = render(<Sidebar views={views} />);

    const aside = container.querySelector('aside');
    expect(aside).toBeInTheDocument();

    expect(screen.getByLabelText('Files')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Extensions')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('navigates when a sidebar item is clicked', () => {
    const mockNavigate = vi.fn();
    render(<Sidebar views={views} onNavigate={mockNavigate} />);

    fireEvent.click(screen.getByLabelText('Files'));
    expect(mockNavigate).toHaveBeenCalledWith('/panels/files');
  });

  it('opens settings panel when settings button is clicked', () => {
    const mockNavigate = vi.fn();
    render(<Sidebar views={views} onNavigate={mockNavigate} />);

    fireEvent.click(screen.getByLabelText('Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/panels/settings');
  });

  it('renders the Orchestra logo', () => {
    const { container } = render(<Sidebar views={views} />);
    // Logo is rendered as an SVG by OrchestraLogo component
    const brand = container.querySelector('.desktop-sidebar__brand');
    expect(brand).toBeInTheDocument();
  });

  it('shows badge when a view has one', () => {
    const badgeViews: SidebarView[] = [
      {
        id: 'notifications',
        title: 'Notifications',
        icon: 'files',
        route: '/panels/notifications',
        badge: '3',
      },
    ];

    render(<Sidebar views={badgeViews} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
