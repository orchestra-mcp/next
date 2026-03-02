import { render, screen, fireEvent } from '@testing-library/react';
import { IconPicker } from './IconPicker';
import type { IconItem } from './IconPicker';
import type { ReactNode } from 'react';

/** Test renderer — renders string icon names as simple spans */
const testRenderIcon = (icon: string | ReactNode) => {
  if (typeof icon !== 'string') return icon;
  return <span data-icon={icon}>{icon}</span>;
};

const makeIcons = (count: number, category?: string): IconItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `bx-icon-${i}`,
    name: `Icon ${i}`,
    icon: `bx-icon-${i}`,
    category,
  }));

const mixedIcons: IconItem[] = [
  { id: 'bxs-star', name: 'Star', icon: 'bxs-star', category: 'shapes' },
  { id: 'bxs-heart', name: 'Heart', icon: 'bxs-heart', category: 'shapes' },
  { id: 'bx-code-alt', name: 'Code', icon: 'bx-code-alt', category: 'dev' },
  { id: 'bx-bug', name: 'Bug', icon: 'bx-bug', category: 'dev' },
  { id: 'bx-sun', name: 'Sun', icon: 'bx-sun', category: 'weather' },
];

describe('IconPicker — panel mode', () => {
  it('renders icon grid', () => {
    const icons = makeIcons(4);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('displays all icons without filter', () => {
    const icons = makeIcons(6);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} renderIcon={testRenderIcon} />);
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('fires onSelect when icon is clicked', () => {
    const handleSelect = vi.fn();
    const icons = makeIcons(3);
    render(<IconPicker mode="panel" icons={icons} onSelect={handleSelect} renderIcon={testRenderIcon} />);
    screen.getAllByRole('button')[1].click();
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(icons[1]);
  });

  it('highlights selected icon via deprecated selected prop', () => {
    const icons = makeIcons(3);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} selected="bx-icon-1" renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('icon-picker__icon-btn--selected');
    expect(buttons[0]).not.toHaveClass('icon-picker__icon-btn--selected');
  });

  it('highlights selected icon via value prop', () => {
    const icons = makeIcons(3);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} value="bx-icon-2" renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveClass('icon-picker__icon-btn--selected');
  });

  it('value prop takes precedence over selected', () => {
    const icons = makeIcons(3);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} value="bx-icon-0" selected="bx-icon-2" renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('icon-picker__icon-btn--selected');
    expect(buttons[2]).not.toHaveClass('icon-picker__icon-btn--selected');
  });

  it('filters icons by search text', () => {
    render(<IconPicker mode="panel" icons={mixedIcons} onSelect={() => {}} searchable renderIcon={testRenderIcon} />);
    const input = screen.getByPlaceholderText('Search icons...');
    fireEvent.change(input, { target: { value: 'star' } });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('title', 'Star');
  });

  it('shows empty message when search has no results', () => {
    render(<IconPicker mode="panel" icons={mixedIcons} onSelect={() => {}} searchable renderIcon={testRenderIcon} />);
    const input = screen.getByPlaceholderText('Search icons...');
    fireEvent.change(input, { target: { value: 'zzzzz' } });
    expect(screen.getByText('No icons found')).toBeInTheDocument();
  });

  it('filters icons by category tab', () => {
    render(<IconPicker mode="panel" icons={mixedIcons} onSelect={() => {}} categories={['shapes', 'dev', 'weather']} renderIcon={testRenderIcon} />);
    const devTab = screen.getByRole('tab', { name: 'dev' });
    fireEvent.click(devTab);
    const iconButtons = screen.getAllByTitle(/.+/);
    expect(iconButtons).toHaveLength(2);
    expect(iconButtons[0]).toHaveAttribute('title', 'Code');
    expect(iconButtons[1]).toHaveAttribute('title', 'Bug');
  });

  it('renders correct number of grid columns via inline style', () => {
    const icons = makeIcons(4);
    render(<IconPicker mode="panel" icons={icons} onSelect={() => {}} columns={5} renderIcon={testRenderIcon} />);
    const grid = screen.getByTestId('icon-picker').querySelector('.icon-picker__grid');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
  });

  it('resets to all icons when All category tab is clicked', () => {
    render(<IconPicker mode="panel" icons={mixedIcons} onSelect={() => {}} categories={['shapes', 'dev', 'weather']} renderIcon={testRenderIcon} />);
    fireEvent.click(screen.getByRole('tab', { name: 'dev' }));
    expect(screen.getAllByTitle(/.+/)).toHaveLength(2);
    fireEvent.click(screen.getByRole('tab', { name: 'All' }));
    expect(screen.getAllByTitle(/.+/)).toHaveLength(5);
  });
});

describe('IconPicker — select mode (default)', () => {
  it('defaults to select mode', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} renderIcon={testRenderIcon} />);
    expect(screen.getByTestId('icon-select')).toBeInTheDocument();
  });

  it('shows placeholder when no value is selected', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} placeholder="Pick one" renderIcon={testRenderIcon} />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('shows selected icon name in trigger', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} value="bx-icon-1" renderIcon={testRenderIcon} />);
    expect(screen.getByText('Icon 1')).toBeInTheDocument();
  });

  it('renders boxicon string name via renderIcon', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} value="bx-icon-1" renderIcon={testRenderIcon} />);
    expect(screen.getByTestId('icon-select-trigger').querySelector('[data-icon="bx-icon-1"]')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} searchable renderIcon={testRenderIcon} />);
    expect(screen.queryByTestId('icon-select-dropdown')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('icon-select-trigger'));
    expect(screen.getByTestId('icon-select-dropdown')).toBeInTheDocument();
  });

  it('closes dropdown after selecting an icon', () => {
    const handleSelect = vi.fn();
    render(<IconPicker icons={makeIcons(3)} onSelect={handleSelect} renderIcon={testRenderIcon} />);
    fireEvent.click(screen.getByTestId('icon-select-trigger'));
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('icon-select-dropdown')).not.toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} disabled renderIcon={testRenderIcon} />);
    fireEvent.click(screen.getByTestId('icon-select-trigger'));
    expect(screen.queryByTestId('icon-select-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on click outside', () => {
    render(<IconPicker icons={makeIcons(3)} onSelect={() => {}} renderIcon={testRenderIcon} />);
    fireEvent.click(screen.getByTestId('icon-select-trigger'));
    expect(screen.getByTestId('icon-select-dropdown')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('icon-select-dropdown')).not.toBeInTheDocument();
  });
});

describe('IconPicker — inline mode', () => {
  it('renders flat grid of icon buttons', () => {
    render(<IconPicker mode="inline" icons={makeIcons(4)} onSelect={() => {}} renderIcon={testRenderIcon} />);
    expect(screen.getByTestId('icon-inline')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('renders boxicon string names via renderIcon', () => {
    render(<IconPicker mode="inline" icons={makeIcons(2)} onSelect={() => {}} renderIcon={testRenderIcon} />);
    expect(screen.getByTestId('icon-inline').querySelector('[data-icon="bx-icon-0"]')).toBeInTheDocument();
    expect(screen.getByTestId('icon-inline').querySelector('[data-icon="bx-icon-1"]')).toBeInTheDocument();
  });

  it('highlights selected icon', () => {
    render(<IconPicker mode="inline" icons={makeIcons(3)} onSelect={() => {}} value="bx-icon-1" renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('icon-inline__item--selected');
    expect(buttons[0]).not.toHaveClass('icon-inline__item--selected');
  });

  it('fires onSelect when icon clicked', () => {
    const handleSelect = vi.fn();
    const icons = makeIcons(3);
    render(<IconPicker mode="inline" icons={icons} onSelect={handleSelect} renderIcon={testRenderIcon} />);
    screen.getAllByRole('button')[2].click();
    expect(handleSelect).toHaveBeenCalledWith(icons[2]);
  });

  it('disables buttons when disabled prop is set', () => {
    render(<IconPicker mode="inline" icons={makeIcons(2)} onSelect={() => {}} disabled renderIcon={testRenderIcon} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });
});
