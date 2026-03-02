import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuItem } from './ContextMenu';

const items: ContextMenuItem[] = [
  { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
  { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
  { id: 'sep1', label: '', separator: true },
  { id: 'paste', label: 'Paste', disabled: true },
  {
    id: 'more',
    label: 'More',
    children: [
      { id: 'sub1', label: 'Sub Item 1' },
      { id: 'sub2', label: 'Sub Item 2' },
    ],
  },
];

const openMenu = () => {
  const target = screen.getByText('Right-click me');
  fireEvent.contextMenu(target);
};

const renderMenu = (onAction = vi.fn(), props = {}) =>
  render(
    <ContextMenu items={items} onAction={onAction} {...props}>
      <div>Right-click me</div>
    </ContextMenu>,
  );

describe('ContextMenu', () => {
  it('renders children', () => {
    renderMenu();
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('opens menu on right-click', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('displays menu items', () => {
    renderMenu();
    openMenu();
    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('calls onAction when an item is clicked', () => {
    const onAction = vi.fn();
    renderMenu(onAction);
    openMenu();
    fireEvent.click(screen.getByText('Cut'));
    expect(onAction).toHaveBeenCalledWith('cut');
  });

  it('does not call onAction for disabled items', () => {
    const onAction = vi.fn();
    renderMenu(onAction);
    openMenu();
    fireEvent.click(screen.getByText('Paste'));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    renderMenu();
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders shortcut text', () => {
    renderMenu();
    openMenu();
    expect(screen.getByText('Ctrl+X')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
  });

  it('renders separators', () => {
    renderMenu();
    openMenu();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('shows nested submenu on hover', () => {
    renderMenu();
    openMenu();
    const moreItem = screen.getByText('More').closest('.ctx-menu-item-wrap')!;
    fireEvent.mouseEnter(moreItem);
    expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
    expect(screen.getByText('Sub Item 2')).toBeInTheDocument();
  });

  it('closes menu when clicking an item', () => {
    renderMenu();
    openMenu();
    fireEvent.click(screen.getByText('Copy'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

/* ── Searchable tests ──────────────────────────── */

const searchableItems: ContextMenuItem[] = [
  { id: 'js', label: 'JavaScript' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'py', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'rs', label: 'Rust' },
];

const renderSearchable = (onAction = vi.fn()) =>
  render(
    <ContextMenu items={searchableItems} onAction={onAction} searchable searchPlaceholder="Search file type...">
      <div>Right-click me</div>
    </ContextMenu>,
  );

const openSearchableMenu = () => {
  const target = screen.getByText('Right-click me');
  fireEvent.contextMenu(target);
};

describe('ContextMenu (searchable)', () => {
  it('shows search input when searchable is true', () => {
    renderSearchable();
    openSearchableMenu();
    expect(screen.getByLabelText('Search menu items')).toBeInTheDocument();
  });

  it('has correct placeholder text', () => {
    renderSearchable();
    openSearchableMenu();
    expect(screen.getByPlaceholderText('Search file type...')).toBeInTheDocument();
  });

  it('filters items by search query', () => {
    renderSearchable();
    openSearchableMenu();
    const input = screen.getByLabelText('Search menu items');
    fireEvent.change(input, { target: { value: 'type' } });
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('shows all items when search is empty', () => {
    renderSearchable();
    openSearchableMenu();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('shows "No matches" when nothing matches', () => {
    renderSearchable();
    openSearchableMenu();
    const input = screen.getByLabelText('Search menu items');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByText('No matches')).toBeInTheDocument();
  });

  it('case-insensitive search', () => {
    renderSearchable();
    openSearchableMenu();
    const input = screen.getByLabelText('Search menu items');
    fireEvent.change(input, { target: { value: 'RUST' } });
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('resets search on close', () => {
    renderSearchable();
    openSearchableMenu();
    const input = screen.getByLabelText('Search menu items');
    fireEvent.change(input, { target: { value: 'py' } });
    expect(screen.getByText('Python')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    // Reopen — search should be reset
    openSearchableMenu();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('calls onAction for filtered item', () => {
    const onAction = vi.fn();
    renderSearchable(onAction);
    openSearchableMenu();
    const input = screen.getByLabelText('Search menu items');
    fireEvent.change(input, { target: { value: 'Go' } });
    fireEvent.click(screen.getByText('Go'));
    expect(onAction).toHaveBeenCalledWith('go');
  });
});

/* ── Color tests ─────────────────────────────── */

const colorItems: ContextMenuItem[] = [
  { id: 'primary', label: 'Primary', color: 'primary' },
  { id: 'success', label: 'Success', color: 'success' },
  { id: 'danger', label: 'Danger', color: 'danger' },
  { id: 'default', label: 'Default' },
];

const renderColored = () =>
  render(
    <ContextMenu items={colorItems}>
      <div>Right-click me</div>
    </ContextMenu>,
  );

describe('ContextMenu (colors)', () => {
  it('applies color class to colored items', () => {
    renderColored();
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const primaryBtn = screen.getByText('Primary').closest('.ctx-menu-item');
    expect(primaryBtn).toHaveClass('ctx-menu-item--primary');
  });

  it('applies danger color class', () => {
    renderColored();
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const dangerBtn = screen.getByText('Danger').closest('.ctx-menu-item');
    expect(dangerBtn).toHaveClass('ctx-menu-item--danger');
  });

  it('does not apply color class when no color set', () => {
    renderColored();
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const defaultBtn = screen.getByText('Default').closest('.ctx-menu-item');
    expect(defaultBtn).not.toHaveClass('ctx-menu-item--primary');
    expect(defaultBtn).not.toHaveClass('ctx-menu-item--success');
    expect(defaultBtn).not.toHaveClass('ctx-menu-item--danger');
  });

  it('applies success color class', () => {
    renderColored();
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const successBtn = screen.getByText('Success').closest('.ctx-menu-item');
    expect(successBtn).toHaveClass('ctx-menu-item--success');
  });
});
