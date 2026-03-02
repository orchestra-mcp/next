import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Shimmer, ShimmerGroup } from './Shimmer';

/**
 * Shimmer skeleton loading component for placeholder UI.
 * Supports line, circle, rect, and card shapes.
 * Responds to theme color variables and component variants.
 */
const meta = {
  title: 'UI/Shimmer',
  component: Shimmer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: ['line', 'circle', 'rect', 'card'],
    },
    animate: { control: 'boolean' },
    width: { control: 'text' },
    height: { control: 'text' },
    borderRadius: { control: 'text' },
  },
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: { shape: 'line' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('shimmer-line');
    await expect(el).toBeInTheDocument();
    await expect(el).toHaveClass('shimmer--animate');
  },
};

export const Circle: Story = {
  args: { shape: 'circle' },
};

export const Rect: Story = {
  args: { shape: 'rect' },
};

export const Card: Story = {
  args: { shape: 'card' },
};

export const CardLayout: Story = {
  args: { shape: 'line' },
  render: () => (
    <ShimmerGroup gap="16px">
      <Shimmer shape="card" height="160px" />
      <Shimmer shape="line" width="60%" />
      <Shimmer shape="line" width="80%" />
      <Shimmer shape="line" width="40%" />
    </ShimmerGroup>
  ),
};

export const ListLayout: Story = {
  args: { shape: 'line' },
  render: () => (
    <ShimmerGroup gap="12px">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shimmer shape="circle" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Shimmer shape="line" width="70%" />
            <Shimmer shape="line" width="40%" height="12px" />
          </div>
        </div>
      ))}
    </ShimmerGroup>
  ),
};

export const ArticleLayout: Story = {
  args: { shape: 'line' },
  render: () => (
    <ShimmerGroup gap="16px">
      <Shimmer shape="rect" height="180px" />
      <Shimmer shape="line" width="50%" height="24px" />
      <Shimmer shape="line" />
      <Shimmer shape="line" />
      <Shimmer shape="line" width="85%" />
    </ShimmerGroup>
  ),
};
