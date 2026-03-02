import { render, screen, fireEvent } from '@testing-library/react';
import { EmojiPicker } from './EmojiPicker';
import type { EmojiCategory } from './EmojiPicker';

describe('EmojiPicker', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  // ─── Panel mode ───
  describe('panel mode', () => {
    it('renders default categories as tabs', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      expect(tabs[0]).toHaveAttribute('aria-label', 'Smileys');
      expect(tabs[1]).toHaveAttribute('aria-label', 'Gestures');
    });

    it('has correct data-testid', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
    });

    it('fires onSelect with correct emoji when clicked', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      fireEvent.click(screen.getByLabelText('Emoji 😀'));
      expect(onSelect).toHaveBeenCalledWith('😀');
    });

    it('switches category content when tab is clicked', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Gestures' }));
      expect(screen.getByLabelText('Emoji 👋')).toBeInTheDocument();
      expect(screen.queryByLabelText('Emoji 😀')).not.toBeInTheDocument();
    });

    it('filters emojis when searching', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      fireEvent.change(screen.getByPlaceholderText('Search emojis...'), { target: { value: '😀' } });
      expect(screen.getByLabelText('Emoji 😀')).toBeInTheDocument();
      expect(screen.queryByLabelText('Emoji 👋')).not.toBeInTheDocument();
    });

    it('shows recents as the first tab when provided', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} recents={['🔥', '🎉']} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-label', 'Recents');
      expect(screen.getByLabelText('Emoji 🔥')).toBeInTheDocument();
    });

    it('renders the correct number of grid columns', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} columns={5} />);
      expect(screen.getByRole('grid')).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
    });

    it('uses custom categories when provided', () => {
      const custom: EmojiCategory[] = [
        { id: 'flags', label: 'Flags', icon: '🏁', emojis: ['🇺🇸', '🇬🇧', '🇫🇷'] },
      ];
      render(<EmojiPicker mode="panel" onSelect={onSelect} categories={custom} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveAttribute('aria-label', 'Flags');
    });

    it('shows empty state when search has no results', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} />);
      fireEvent.change(screen.getByPlaceholderText('Search emojis...'), { target: { value: 'zzzzzzz' } });
      expect(screen.getByText('No emojis found')).toBeInTheDocument();
    });

    it('renders custom search placeholder', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} searchPlaceholder="Find emoji..." />);
      expect(screen.getByPlaceholderText('Find emoji...')).toBeInTheDocument();
    });

    it('applies className', () => {
      render(<EmojiPicker mode="panel" onSelect={onSelect} className="extra" />);
      expect(screen.getByTestId('emoji-picker')).toHaveClass('emoji-picker', 'extra');
    });
  });

  // ─── Select mode (default) ───
  describe('select mode', () => {
    it('renders trigger with placeholder', () => {
      render(<EmojiPicker onSelect={onSelect} />);
      expect(screen.getByTestId('emoji-select')).toBeInTheDocument();
      expect(screen.getByTestId('emoji-select-trigger')).toHaveTextContent('Select emoji');
    });

    it('shows selected value in trigger', () => {
      render(<EmojiPicker onSelect={onSelect} value="🔥" />);
      expect(screen.getByTestId('emoji-select-trigger')).toHaveTextContent('🔥');
    });

    it('opens dropdown on click', () => {
      render(<EmojiPicker onSelect={onSelect} />);
      expect(screen.queryByTestId('emoji-select-dropdown')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      expect(screen.getByTestId('emoji-select-dropdown')).toBeInTheDocument();
    });

    it('closes dropdown after selecting an emoji', () => {
      render(<EmojiPicker onSelect={onSelect} />);
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      fireEvent.click(screen.getByLabelText('Emoji 😀'));
      expect(onSelect).toHaveBeenCalledWith('😀');
      expect(screen.queryByTestId('emoji-select-dropdown')).not.toBeInTheDocument();
    });

    it('toggles dropdown closed on second trigger click', () => {
      render(<EmojiPicker onSelect={onSelect} />);
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      expect(screen.getByTestId('emoji-select-dropdown')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      expect(screen.queryByTestId('emoji-select-dropdown')).not.toBeInTheDocument();
    });

    it('does not open when disabled', () => {
      render(<EmojiPicker onSelect={onSelect} disabled />);
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      expect(screen.queryByTestId('emoji-select-dropdown')).not.toBeInTheDocument();
    });

    it('closes dropdown on outside click', () => {
      render(<EmojiPicker onSelect={onSelect} />);
      fireEvent.click(screen.getByTestId('emoji-select-trigger'));
      expect(screen.getByTestId('emoji-select-dropdown')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId('emoji-select-dropdown')).not.toBeInTheDocument();
    });

    it('uses custom placeholder', () => {
      render(<EmojiPicker onSelect={onSelect} placeholder="Pick one" />);
      expect(screen.getByTestId('emoji-select-trigger')).toHaveTextContent('Pick one');
    });

    it('applies className', () => {
      render(<EmojiPicker onSelect={onSelect} className="custom" />);
      expect(screen.getByTestId('emoji-select')).toHaveClass('emoji-select', 'custom');
    });
  });

  // ─── Inline mode ───
  describe('inline mode', () => {
    it('renders all emojis from all categories', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} />);
      expect(screen.getByTestId('emoji-inline')).toBeInTheDocument();
      expect(screen.getByLabelText('Emoji 😀')).toBeInTheDocument();
      expect(screen.getByLabelText('Emoji 👋')).toBeInTheDocument();
      expect(screen.getByLabelText('Emoji ❤️')).toBeInTheDocument();
    });

    it('fires onSelect when an emoji is clicked', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} />);
      fireEvent.click(screen.getByLabelText('Emoji 🐶'));
      expect(onSelect).toHaveBeenCalledWith('🐶');
    });

    it('marks the selected emoji with --selected class', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} value="😀" />);
      const btn = screen.getByLabelText('Emoji 😀');
      expect(btn).toHaveClass('emoji-inline__item--selected');
    });

    it('does not mark non-selected emojis', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} value="😀" />);
      const btn = screen.getByLabelText('Emoji 😃');
      expect(btn).not.toHaveClass('emoji-inline__item--selected');
    });

    it('disables buttons when disabled', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} disabled />);
      const btn = screen.getByLabelText('Emoji 😀');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('applies grid columns', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} columns={5} />);
      const grid = screen.getByTestId('emoji-inline').querySelector('.emoji-inline__grid');
      expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
    });

    it('uses custom categories', () => {
      const custom: EmojiCategory[] = [
        { id: 'flags', label: 'Flags', icon: '🏁', emojis: ['🇺🇸', '🇬🇧'] },
      ];
      render(<EmojiPicker mode="inline" onSelect={onSelect} categories={custom} />);
      expect(screen.getByLabelText('Emoji 🇺🇸')).toBeInTheDocument();
      expect(screen.queryByLabelText('Emoji 😀')).not.toBeInTheDocument();
    });

    it('has no search or tabs', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} />);
      expect(screen.queryByPlaceholderText('Search emojis...')).not.toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('applies className', () => {
      render(<EmojiPicker mode="inline" onSelect={onSelect} className="extra" />);
      expect(screen.getByTestId('emoji-inline')).toHaveClass('emoji-inline', 'extra');
    });
  });
});
