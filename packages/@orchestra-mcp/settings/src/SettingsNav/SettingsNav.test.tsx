import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsNav } from './SettingsNav';
import type { SettingsNavItem } from './SettingsNav';

const items: SettingsNavItem[] = [
  { id: 'general', label: 'General' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'keybindings', label: 'Keybindings' },
];

describe('SettingsNav', () => {
  it('renders title and subtitle', () => {
    render(
      <SettingsNav
        title="Settings"
        subtitle="Customize your workspace"
        items={items}
        activeId="general"
        onSelect={() => {}}
      />
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Customize your workspace')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(
      <SettingsNav items={items} activeId="general" onSelect={() => {}} />
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Keybindings')).toBeInTheDocument();
  });

  it('marks active item with active class', () => {
    const { container } = render(
      <SettingsNav items={items} activeId="appearance" onSelect={() => {}} />
    );
    const activeBtn = container.querySelector('.settings-nav__item--active');
    expect(activeBtn).toBeInTheDocument();
    expect(activeBtn!.textContent).toContain('Appearance');
  });

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <SettingsNav items={items} activeId="general" onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('Keybindings'));
    expect(onSelect).toHaveBeenCalledWith('keybindings');
  });

  it('renders search input when showSearch is true', () => {
    render(
      <SettingsNav items={items} activeId="general" onSelect={() => {}} showSearch />
    );
    expect(screen.getByPlaceholderText('Search settings...')).toBeInTheDocument();
  });

  it('hides search input when showSearch is false', () => {
    render(
      <SettingsNav items={items} activeId="general" onSelect={() => {}} showSearch={false} />
    );
    expect(screen.queryByPlaceholderText('Search settings...')).not.toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', () => {
    const onSearchChange = vi.fn();
    render(
      <SettingsNav
        items={items}
        activeId="general"
        onSelect={() => {}}
        showSearch
        onSearchChange={onSearchChange}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Search settings...'), {
      target: { value: 'key' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('key');
  });

  it('renders icon when provided', () => {
    const itemsWithIcon: SettingsNavItem[] = [
      { id: 'general', label: 'General', icon: <span data-testid="icon">G</span> },
    ];
    render(
      <SettingsNav items={itemsWithIcon} activeId="general" onSelect={() => {}} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
