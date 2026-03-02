import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { IconPicker } from './IconPicker';
import type { IconItem } from './IconPicker';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { ReactNode } from 'react';

/** Renders boxicon string names via BoxIcon component */
const renderBoxIcon = (icon: string | ReactNode, size = 20): ReactNode => {
  if (typeof icon !== 'string') return icon;
  return <BoxIcon name={icon} size={size} />;
};

const sampleIcons: IconItem[] = [
  { id: 'bxs-star', name: 'Star', icon: 'bxs-star', category: 'shapes' },
  { id: 'bxs-heart', name: 'Heart', icon: 'bxs-heart', category: 'shapes' },
  { id: 'bx-circle', name: 'Circle', icon: 'bx-circle', category: 'shapes' },
  { id: 'bx-square', name: 'Square', icon: 'bx-square', category: 'shapes' },
  { id: 'bx-code-alt', name: 'Code', icon: 'bx-code-alt', category: 'dev' },
  { id: 'bx-bug', name: 'Bug', icon: 'bx-bug', category: 'dev' },
  { id: 'bx-terminal', name: 'Terminal', icon: 'bx-terminal', category: 'dev' },
  { id: 'bx-git-branch', name: 'Git Branch', icon: 'bx-git-branch', category: 'dev' },
  { id: 'bx-sun', name: 'Sun', icon: 'bx-sun', category: 'weather' },
  { id: 'bx-cloud', name: 'Cloud', icon: 'bx-cloud', category: 'weather' },
  { id: 'bx-bolt-circle', name: 'Bolt', icon: 'bx-bolt-circle', category: 'weather' },
  { id: 'bx-moon', name: 'Moon', icon: 'bx-moon', category: 'weather' },
  { id: 'bx-music', name: 'Music', icon: 'bx-music', category: 'media' },
  { id: 'bx-camera', name: 'Camera', icon: 'bx-camera', category: 'media' },
  { id: 'bx-microphone', name: 'Microphone', icon: 'bx-microphone', category: 'media' },
];

const logoIcons: IconItem[] = [
  { id: 'bxl-github', name: 'GitHub', icon: 'bxl-github', category: 'logos' },
  { id: 'bxl-react', name: 'React', icon: 'bxl-react', category: 'logos' },
  { id: 'bxl-typescript', name: 'TypeScript', icon: 'bxl-typescript', category: 'logos' },
  { id: 'bxl-nodejs', name: 'Node.js', icon: 'bxl-nodejs', category: 'logos' },
  { id: 'bxl-docker', name: 'Docker', icon: 'bxl-docker', category: 'logos' },
  { id: 'bxl-python', name: 'Python', icon: 'bxl-python', category: 'logos' },
  { id: 'bxl-rust', name: 'Rust', icon: 'bxl-rust', category: 'logos' },
  { id: 'bxl-go-lang', name: 'Go', icon: 'bxl-go-lang', category: 'logos' },
];

const allIcons = [...sampleIcons, ...logoIcons];

/**
 * IconPicker renders **Boxicons** (1634 icons) in three modes:
 * - **select** (default) — Trigger input that opens a dropdown with search, categories, and grid
 * - **inline** — Flat grid of icons for direct selection (like checkboxes)
 * - **panel** — Always-visible panel with search, categories, and grid
 *
 * Pass Boxicon names as `icon` strings (e.g. `'bx-home'`, `'bxs-star'`, `'bxl-github'`).
 * 26 color themes and 3 component variants via toolbar dropdowns.
 */
const meta = {
  title: 'UI/IconPicker',
  component: IconPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['select', 'inline', 'panel'] },
    searchable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    columns: { control: { type: 'number', min: 2, max: 12 } },
  },
} satisfies Meta<typeof IconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Select mode ─────────────────────────────

export const SelectDefault: Story = {
  args: { mode: 'select', icons: sampleIcons, searchable: true, renderIcon: renderBoxIcon, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const SelectWithCategories: Story = {
  args: {
    mode: 'select', icons: allIcons, searchable: true, renderIcon: renderBoxIcon,
    categories: ['shapes', 'dev', 'weather', 'media', 'logos'], onSelect: () => {},
  },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const SelectPreselected: Story = {
  args: { mode: 'select', icons: sampleIcons, searchable: true, renderIcon: renderBoxIcon, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>('bxs-heart');
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const SelectDisabled: Story = {
  args: { mode: 'select', icons: sampleIcons, value: 'bxs-star', disabled: true, renderIcon: renderBoxIcon, onSelect: () => {} },
};

// ── Inline mode ─────────────────────────────

export const InlineDefault: Story = {
  args: { mode: 'inline', icons: sampleIcons, columns: 6, renderIcon: renderBoxIcon, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const InlinePreselected: Story = {
  args: { mode: 'inline', icons: sampleIcons, columns: 6, renderIcon: renderBoxIcon, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>('bxs-heart');
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const InlineLogos: Story = {
  args: { mode: 'inline', icons: logoIcons, columns: 4, renderIcon: renderBoxIcon, onSelect: () => {} },
  render: (args) => {
    const [val, setVal] = useState<string | undefined>();
    return <IconPicker {...args} value={val} onSelect={(icon) => { setVal(icon.id); args.onSelect(icon); }} />;
  },
};

export const InlineDisabled: Story = {
  args: { mode: 'inline', icons: sampleIcons, columns: 6, value: 'bxs-star', disabled: true, renderIcon: renderBoxIcon, onSelect: () => {} },
};

// ── Panel mode ──────────────────────────────

export const PanelDefault: Story = {
  args: { mode: 'panel', icons: allIcons, columns: 8, renderIcon: renderBoxIcon, onSelect: () => {} },
};

export const PanelWithSearch: Story = {
  args: { mode: 'panel', icons: allIcons, searchable: true, columns: 8, renderIcon: renderBoxIcon, onSelect: () => {} },
};

export const PanelWithCategories: Story = {
  args: {
    mode: 'panel', icons: allIcons, searchable: true, renderIcon: renderBoxIcon,
    categories: ['shapes', 'dev', 'weather', 'media', 'logos'], columns: 6, onSelect: () => {},
  },
};

export const PanelPreselected: Story = {
  args: { mode: 'panel', icons: sampleIcons, value: 'bxs-heart', columns: 8, renderIcon: renderBoxIcon, onSelect: () => {} },
};
