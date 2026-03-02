import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchSpotlight } from './SearchSpotlight';
import type { SearchResult, SearchCategory } from './SearchSpotlight';

const sampleResults: SearchResult[] = [
  { id: '1', title: 'Open File', description: 'Open a file from workspace', category: 'actions', shortcut: 'Cmd+O' },
  { id: '2', title: 'Settings', description: 'Open app settings', category: 'actions', shortcut: 'Cmd+,' },
  { id: '3', title: 'README.md', description: 'Project readme', category: 'files' },
  { id: '4', title: 'package.json', description: 'Node config', category: 'files' },
];

const sampleCategories: SearchCategory[] = [
  { id: 'actions', label: 'Actions' },
  { id: 'files', label: 'Files' },
];

/**
 * SearchSpotlight is a Raycast/Spotlight-style search overlay.
 * - 25 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern)
 * - Keyboard navigation with ArrowUp/Down, Enter, Escape
 */
const meta = {
  title: 'Search/SearchSpotlight',
  component: SearchSpotlight,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    loading: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof SearchSpotlight>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args: React.ComponentProps<typeof SearchSpotlight>) => {
  const [open, setOpen] = useState(args.open);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Spotlight</button>
      <SearchSpotlight {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: [],
    onSelect: () => {},
    placeholder: 'Search...',
  },
  render: (args) => <Template {...args} />,
};

export const WithResults: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: sampleResults,
    onSelect: () => {},
  },
  render: (args) => <Template {...args} />,
};

export const WithCategories: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: sampleResults,
    onSelect: () => {},
    categories: sampleCategories,
  },
  render: (args) => <Template {...args} />,
};

export const Loading: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: [],
    onSelect: () => {},
    loading: true,
  },
  render: (args) => <Template {...args} />,
};

export const RecentSearches: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: [],
    onSelect: () => {},
    recentSearches: ['react hooks', 'typescript generics', 'zustand store'],
  },
  render: (args) => <Template {...args} />,
};

export const Empty: Story = {
  args: {
    open: true,
    onClose: () => {},
    onSearch: () => {},
    results: [],
    onSelect: () => {},
    placeholder: 'Type to search...',
  },
  render: (args) => <Template {...args} />,
};
