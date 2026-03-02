import type { Meta, StoryObj } from '@storybook/react';
import { BoxIcon } from './BoxIcon';

const meta = {
  title: 'Icons/BoxIcon',
  component: BoxIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Boxicon name (bx-*, bxs-*, bxl-*)',
    },
    size: {
      control: { type: 'number', min: 12, max: 64 },
      description: 'Icon size in pixels',
    },
    color: {
      control: 'color',
      description: 'Icon color (inherits from CSS color)',
    },
  },
} satisfies Meta<typeof BoxIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {
  args: {
    name: 'bx-home',
    size: 24,
  },
};

export const Solid: Story = {
  args: {
    name: 'bxs-star',
    size: 24,
    color: '#f59e0b',
  },
};

export const Logo: Story = {
  args: {
    name: 'bxl-github',
    size: 32,
  },
};

export const AllSizes: Story = {
  args: { name: 'bx-home' },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BoxIcon name="bx-home" size={16} />
      <BoxIcon name="bx-home" size={24} />
      <BoxIcon name="bx-home" size={32} />
      <BoxIcon name="bx-home" size={48} />
    </div>
  ),
};

export const CommonIcons: Story = {
  args: { name: 'bx-home' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <BoxIcon name="bx-home" size={24} />
      <BoxIcon name="bx-search" size={24} />
      <BoxIcon name="bx-cog" size={24} />
      <BoxIcon name="bx-user" size={24} />
      <BoxIcon name="bx-bell" size={24} />
      <BoxIcon name="bx-folder" size={24} />
      <BoxIcon name="bx-file" size={24} />
      <BoxIcon name="bx-terminal" size={24} />
      <BoxIcon name="bx-code-alt" size={24} />
      <BoxIcon name="bx-git-branch" size={24} />
      <BoxIcon name="bxs-heart" size={24} color="#ef4444" />
      <BoxIcon name="bxl-react" size={24} color="#61dafb" />
    </div>
  ),
};
