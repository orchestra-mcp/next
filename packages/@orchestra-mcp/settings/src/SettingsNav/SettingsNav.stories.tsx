import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SettingsNav } from './SettingsNav';

const defaultItems = [
  { id: 'general', label: 'General' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'keybindings', label: 'Keybindings' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'sync', label: 'Sync & Backup' },
  { id: 'ai', label: 'AI Assistant' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'about', label: 'About' },
];

const meta = {
  title: 'Settings/SettingsNav',
  component: SettingsNav,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    showSearch: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260, border: '1px solid var(--color-border)', borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [activeId, setActiveId] = useState('general');
    return <SettingsNav {...args} activeId={activeId} onSelect={setActiveId} />;
  },
  args: {
    items: defaultItems,
  },
};

export const WithSearch: Story = {
  render: (args) => {
    const [activeId, setActiveId] = useState('general');
    const [search, setSearch] = useState('');
    const filtered = defaultItems.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <SettingsNav
        {...args}
        items={filtered}
        activeId={activeId}
        onSelect={setActiveId}
        searchQuery={search}
        onSearchChange={setSearch}
        showSearch
      />
    );
  },
  args: {
    items: defaultItems,
  },
};

export const NoSearch: Story = {
  args: {
    items: defaultItems,
    activeId: 'appearance',
    onSelect: () => {},
    showSearch: false,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Preferences',
    subtitle: 'Configure your editor',
    items: defaultItems.slice(0, 4),
    activeId: 'general',
    onSelect: () => {},
  },
};

export const FewItems: Story = {
  args: {
    items: [
      { id: 'profile', label: 'Profile' },
      { id: 'account', label: 'Account' },
    ],
    activeId: 'profile',
    onSelect: () => {},
    showSearch: false,
  },
};
