import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Widget } from './Widget';

/**
 * Widget component for dashboard cards with header controls:
 * - Collapsible body section
 * - Action buttons in header
 * - Loading shimmer overlay
 * - Error state with retry
 * - 3 sizes (small/medium/large)
 * - Adapts to compact/modern variants
 */
const meta = {
  title: 'Widgets/Widget',
  component: Widget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Widget padding size',
    },
    collapsible: {
      control: 'boolean',
      description: 'Allow collapsing the body',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading shimmer overlay',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Recent Activity',
    size: 'medium',
    children: 'Widget body content goes here.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Recent Activity')).toBeInTheDocument();
    await expect(canvas.getByText('Widget body content goes here.')).toBeInTheDocument();
  },
};

export const WithActions: Story = {
  args: {
    title: 'Stats',
    children: 'Some dashboard statistics.',
    actions: [
      { id: 'edit', label: 'Edit', onClick: () => {} },
      { id: 'delete', label: 'Delete', onClick: () => {} },
    ],
  },
};

export const Collapsed: Story = {
  args: {
    title: 'Collapsed Widget',
    children: 'You should not see this initially.',
    collapsible: true,
    defaultCollapsed: true,
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Data',
    children: 'Content behind the shimmer.',
    loading: true,
  },
};

export const Error: Story = {
  args: {
    title: 'Failed Widget',
    children: 'This content is hidden by error.',
    error: 'Unable to fetch data. Please try again.',
    onRefresh: () => {},
  },
};

export const AllSizes: Story = {
  args: {
    title: 'Widget',
    children: 'Content',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Widget title="Small Widget" size="small">
        Small padding content.
      </Widget>
      <Widget title="Medium Widget" size="medium">
        Medium padding content.
      </Widget>
      <Widget title="Large Widget" size="large">
        Large padding content.
      </Widget>
    </div>
  ),
};
