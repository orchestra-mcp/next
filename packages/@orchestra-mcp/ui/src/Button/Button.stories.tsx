import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Button } from './Button';

const PlusIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5V19" /><path d="M5 12H19" />
  </svg>
);

const SearchIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21L16.65 16.65" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18L15 12L9 6" />
  </svg>
);

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['filled', 'soft', 'outlined', 'ghost'] },
    color: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'gray'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Button', variant: 'filled', color: 'primary', size: 'md' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: /button/i })).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  args: { label: 'Button' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'success', 'warning', 'danger', 'info', 'gray'] as const).map((c) => (
        <div key={c} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button label="Filled" color={c} variant="filled" />
          <Button label="Soft" color={c} variant="soft" />
          <Button label="Outlined" color={c} variant="outlined" />
          <Button label="Ghost" color={c} variant="ghost" />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  args: { label: 'Size' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <Button label="XS" size="xs" />
      <Button label="Small" size="sm" />
      <Button label="Medium" size="md" />
      <Button label="Large" size="lg" />
    </div>
  ),
};

export const WithIcons: Story = {
  args: { label: 'Icon' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Add Item" iconLeft={<PlusIcon />} color="primary" />
      <Button label="Search" iconLeft={<SearchIcon />} color="info" variant="soft" />
      <Button label="Settings" iconLeft={<SettingsIcon />} color="gray" variant="outlined" />
      <Button label="Next" iconRight={<ChevronIcon />} color="success" />
    </div>
  ),
};

export const IconOnly: Story = {
  args: { label: 'Add' },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button label="Add" iconLeft={<PlusIcon />} iconOnly variant="ghost" color="gray" size="sm" />
      <Button label="Search" iconLeft={<SearchIcon />} iconOnly variant="ghost" color="gray" size="sm" />
      <Button label="Settings" iconLeft={<SettingsIcon />} iconOnly variant="ghost" color="gray" size="sm" />
      <Button label="Add" iconLeft={<PlusIcon />} iconOnly variant="filled" color="primary" size="sm" />
      <Button label="Delete" iconLeft={<PlusIcon />} iconOnly variant="soft" color="danger" size="sm" />
    </div>
  ),
};

export const ChromeSidebarActions: Story = {
  args: { label: 'Action' },
  render: () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 8px', backgroundColor: 'var(--color-bg-alt)',
      borderRadius: '6px', width: '300px',
    }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-fg)' }}>Orchestra</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        <Button label="Add" iconLeft={<PlusIcon />} iconOnly variant="ghost" color="gray" size="xs" />
        <Button label="Search" iconLeft={<SearchIcon />} iconOnly variant="ghost" color="gray" size="xs" />
        <Button label="Settings" iconLeft={<SettingsIcon />} iconOnly variant="ghost" color="gray" size="xs" />
      </div>
    </div>
  ),
};

export const DesktopToolbar: Story = {
  args: { label: 'Action' },
  render: () => (
    <div style={{
      display: 'flex', gap: '8px', padding: '8px 12px',
      backgroundColor: 'var(--color-bg-alt)', borderRadius: '8px',
    }}>
      <Button label="New File" iconLeft={<PlusIcon />} variant="filled" color="primary" size="sm" />
      <Button label="Find" iconLeft={<SearchIcon />} variant="soft" color="info" size="sm" />
      <Button label="Settings" iconLeft={<SettingsIcon />} variant="ghost" color="gray" size="sm" />
    </div>
  ),
};

export const Loading: Story = {
  args: { label: 'Saving...', loading: true, color: 'primary' },
};

export const FullWidth: Story = {
  args: { label: 'Continue' },
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Button label="Sign In" fullWidth color="primary" />
      <Button label="Create Account" fullWidth variant="outlined" color="gray" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true, color: 'gray' },
};

export const FilledColors: Story = {
  args: { label: 'Color' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <Button label="Primary" color="primary" />
      <Button label="Success" color="success" />
      <Button label="Warning" color="warning" />
      <Button label="Danger" color="danger" />
      <Button label="Info" color="info" />
      <Button label="Gray" color="gray" />
    </div>
  ),
};
