import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ProgressBar } from './ProgressBar';

/**
 * ProgressBar component with determinate/indeterminate modes,
 * multiple sizes, colors, striped animation, and accessibility.
 */
const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['determinate', 'indeterminate'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'select', options: ['primary', 'success', 'warning', 'danger'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
    striped: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Determinate: Story = {
  args: { value: 65, mode: 'determinate', size: 'md', color: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar');
    await expect(bar).toBeInTheDocument();
    await expect(bar).toHaveAttribute('aria-valuenow', '65');
  },
};

export const Indeterminate: Story = {
  args: { mode: 'indeterminate', size: 'md', color: 'primary' },
};

export const Small: Story = {
  args: { value: 40, size: 'sm', color: 'primary' },
};

export const Medium: Story = {
  args: { value: 60, size: 'md', color: 'primary' },
};

export const Large: Story = {
  args: { value: 80, size: 'lg', color: 'primary' },
};

export const Colors: Story = {
  args: { value: 50 },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ProgressBar value={70} color="primary" label="Primary" showValue />
      <ProgressBar value={70} color="success" label="Success" showValue />
      <ProgressBar value={70} color="warning" label="Warning" showValue />
      <ProgressBar value={70} color="danger" label="Danger" showValue />
    </div>
  ),
};

export const WithLabel: Story = {
  args: { value: 72, label: 'Uploading files...', showValue: true },
};

export const Striped: Story = {
  args: { value: 55, striped: true, color: 'success', size: 'lg' },
};

export const AllVariants: Story = {
  args: { value: 50 },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ProgressBar value={30} size="sm" label="Small" showValue />
      <ProgressBar value={55} size="md" label="Medium" showValue />
      <ProgressBar value={80} size="lg" label="Large" showValue />
      <ProgressBar value={65} size="lg" striped color="warning" label="Striped" showValue />
      <ProgressBar mode="indeterminate" size="md" label="Indeterminate" />
    </div>
  ),
};
