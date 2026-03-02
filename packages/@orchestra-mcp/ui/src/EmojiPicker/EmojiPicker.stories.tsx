import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmojiPicker } from './EmojiPicker';

/**
 * EmojiPicker supports three modes:
 * - **select** (default) — Trigger input that opens a dropdown with search, tabs, and grid
 * - **inline** — Flat grid of emojis for direct selection (like checkboxes)
 * - **panel** — Always-visible panel with search, tabs, and grid
 *
 * 26 color themes and 3 component variants via toolbar dropdowns.
 */
const meta = {
  title: 'UI/EmojiPicker',
  component: EmojiPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['select', 'inline', 'panel'] },
    columns: { control: { type: 'number', min: 4, max: 12 } },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    searchPlaceholder: { control: 'text' },
  },
} satisfies Meta<typeof EmojiPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Select mode ─────────────────────────────

export const SelectDefault: Story = {
  args: { mode: 'select', onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

export const SelectWithValue: Story = {
  args: { mode: 'select', onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>('🔥');
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

export const SelectDisabled: Story = {
  args: { mode: 'select', value: '😊', disabled: true, onSelect: () => {} },
};

export const SelectCustomCategories: Story = {
  args: {
    mode: 'select',
    onSelect: () => {},
    categories: [
      { id: 'flags', label: 'Flags', icon: '🏁', emojis: ['🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷'] },
      { id: 'weather', label: 'Weather', icon: '☀️', emojis: ['☀️', '🌤️', '⛅', '🌧️', '⛈️', '🌈'] },
      { id: 'sports', label: 'Sports', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'] },
    ],
  },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

// ── Inline mode ─────────────────────────────

export const InlineDefault: Story = {
  args: { mode: 'inline', columns: 10, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

export const InlinePreselected: Story = {
  args: { mode: 'inline', columns: 10, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>('❤️');
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

export const InlineSmallSet: Story = {
  args: {
    mode: 'inline',
    columns: 6,
    onSelect: () => {},
    categories: [
      { id: 'reactions', label: 'Reactions', icon: '👍', emojis: ['👍', '👎', '❤️', '😂', '😮', '😢'] },
    ],
  },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <EmojiPicker {...args} value={val} onSelect={setVal} />;
  },
};

export const InlineDisabled: Story = {
  args: { mode: 'inline', columns: 10, value: '😊', disabled: true, onSelect: () => {} },
};

// ── Panel mode ──────────────────────────────

export const PanelDefault: Story = {
  args: { mode: 'panel', columns: 8, onSelect: () => {} },
};

export const PanelWithRecents: Story = {
  args: {
    mode: 'panel',
    columns: 8,
    onSelect: () => {},
    recents: ['🔥', '🎉', '💯', '👍', '❤️'],
  },
};

export const PanelCustomCategories: Story = {
  args: {
    mode: 'panel',
    columns: 6,
    onSelect: () => {},
    categories: [
      { id: 'flags', label: 'Flags', icon: '🏁', emojis: ['🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷'] },
      { id: 'weather', label: 'Weather', icon: '☀️', emojis: ['☀️', '🌤️', '⛅', '🌧️', '⛈️', '🌈'] },
      { id: 'sports', label: 'Sports', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐'] },
    ],
  },
};
