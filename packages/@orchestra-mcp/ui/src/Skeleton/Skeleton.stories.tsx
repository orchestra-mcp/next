import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

/**
 * Skeleton component provides content loading placeholders:
 * - Text, circular, and rectangular variants
 * - Multi-line support with last line shorter
 * - Shimmer animation (toggleable)
 * - Theme-aware via CSS custom properties
 */
const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: 'number' },
    gap: { control: 'number' },
    animate: { control: 'boolean' },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: 'text', width: 240 },
};

export const Circular: Story = {
  args: { variant: 'circular', width: 48 },
};

export const Rectangular: Story = {
  args: { variant: 'rectangular', width: 200, height: 120 },
};

export const MultipleLines: Story = {
  args: { variant: 'text', lines: 4, width: 300, gap: 8 },
};

export const NoAnimation: Story = {
  args: { variant: 'text', width: 240, animate: false },
};

/** Composed skeleton mimicking a card layout */
export const CardSkeleton: Story = {
  args: { variant: 'text' },
  render: () => (
    <div style={{ width: 300, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton variant="rectangular" width="100%" height={140} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" lines={3} gap={6} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Skeleton variant="circular" width={32} />
        <Skeleton variant="text" width={120} />
      </div>
    </div>
  ),
};
