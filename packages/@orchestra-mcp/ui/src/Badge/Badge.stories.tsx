import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Badge } from './Badge';

const ArrowIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'soft'] },
    color: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'gray'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'New', color: 'primary', size: 'md' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('New')).toBeInTheDocument();
  },
};

/* ── All 3 variants side-by-side per color ── */
export const AllVariants: Story = {
  args: { label: 'Badge' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'success', 'warning', 'danger', 'info', 'gray'] as const).map((c) => (
        <div key={c} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Badge label="Filled" color={c} variant="filled" />
          <Badge label="Soft" color={c} variant="soft" />
          <Badge label="Outlined" color={c} variant="outlined" />
        </div>
      ))}
    </div>
  ),
};

export const FilledColors: Story = {
  args: { label: 'Color' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge label="Primary" color="primary" variant="filled" />
      <Badge label="Success" color="success" variant="filled" />
      <Badge label="Warning" color="warning" variant="filled" />
      <Badge label="Danger" color="danger" variant="filled" />
      <Badge label="Info" color="info" variant="filled" />
      <Badge label="Gray" color="gray" variant="filled" />
    </div>
  ),
};

export const SoftColors: Story = {
  args: { label: 'Color' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge label="Primary" color="primary" variant="soft" />
      <Badge label="Success" color="success" variant="soft" />
      <Badge label="Warning" color="warning" variant="soft" />
      <Badge label="Danger" color="danger" variant="soft" />
      <Badge label="Info" color="info" variant="soft" />
      <Badge label="Gray" color="gray" variant="soft" />
    </div>
  ),
};

export const OutlinedColors: Story = {
  args: { label: 'Color' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge label="Primary" color="primary" variant="outlined" />
      <Badge label="Success" color="success" variant="outlined" />
      <Badge label="Warning" color="warning" variant="outlined" />
      <Badge label="Danger" color="danger" variant="outlined" />
      <Badge label="Info" color="info" variant="outlined" />
      <Badge label="Gray" color="gray" variant="outlined" />
    </div>
  ),
};

export const WithDot: Story = {
  args: { label: 'Dot' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge label="Active" color="success" variant="soft" dot />
      <Badge label="Pending" color="warning" variant="soft" dot />
      <Badge label="Error" color="danger" variant="soft" dot />
      <Badge label="Info" color="info" variant="filled" dot />
      <Badge label="Draft" color="gray" variant="outlined" dot />
    </div>
  ),
};

export const WithIcons: Story = {
  args: { label: 'Icon' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge label="Medium" color="info" icon={<ArrowIcon />} variant="outlined" />
      <Badge label="Positive" color="success" icon={<ArrowIcon />} variant="soft" />
      <Badge label="High" color="warning" icon={<ArrowIcon />} variant="filled" />
      <Badge label="Open" color="primary" icon={<ArrowIcon />} variant="soft" />
    </div>
  ),
};

export const Sizes: Story = {
  args: { label: 'Size' },
  render: () => (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <Badge label="XS" size="xs" variant="filled" />
      <Badge label="Small" size="sm" variant="filled" />
      <Badge label="Medium" size="md" variant="filled" />
      <Badge label="Large" size="lg" variant="filled" />
    </div>
  ),
};

export const WithCount: Story = {
  args: { count: 7, variant: 'filled', color: 'danger' },
};

export const CountOverflow: Story = {
  args: { count: 150, variant: 'filled', color: 'danger' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('99+')).toBeInTheDocument();
  },
};

export const Removable: Story = {
  args: { label: 'Removable', color: 'primary', variant: 'soft', removable: true },
};

export const Disabled: Story = {
  args: { label: 'Disabled', color: 'gray', disabled: true },
};
