import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Avatar } from './Avatar';

/**
 * Avatar component for displaying user profile images or initials.
 * - Circular with optional status dot (bottom-right)
 * - Three sizes: small (24px), medium (32px), large (48px)
 * - Falls back to initials when no image source is provided
 * - Supports compact and modern component variants
 */
const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Avatar size',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Status indicator',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=avatar-story',
    alt: 'User avatar',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    await expect(img).toBeInTheDocument();
  },
};

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('JD')).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  args: { name: 'AB' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar name="Alice Brown" size="small" />
      <Avatar name="Alice Brown" size="medium" />
      <Avatar name="Alice Brown" size="large" />
    </div>
  ),
};

export const WithStatus: Story = {
  args: { name: 'CD' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Avatar name="Online User" size="large" status="online" />
      <Avatar name="Offline User" size="large" status="offline" />
      <Avatar name="Busy User" size="large" status="busy" />
      <Avatar name="Away User" size="large" status="away" />
    </div>
  ),
};

export const Clickable: Story = {
  args: {
    name: 'Click Me',
    size: 'large',
    onClick: () => alert('Avatar clicked!'),
  },
};

export const NoImageNoName: Story = {
  args: {
    size: 'medium',
  },
};
