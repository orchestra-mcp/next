import type { Meta, StoryObj } from '@storybook/react';
import { CardBase } from './CardBase';

const meta = {
  title: 'AI/Cards/CardBase',
  component: CardBase,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    children: 'This is the card body content. It can contain any React nodes.',
  },
};

export const WithBadge: Story = {
  args: {
    title: 'TypeScript Module',
    badge: 'TypeScript',
    badgeColor: 'info',
    children: 'Card content with a language badge displayed in the header.',
  },
};

export const Collapsed: Story = {
  args: {
    title: 'Collapsed by Default',
    defaultCollapsed: true,
    children: 'This content is hidden until the header is clicked.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'With Custom Icon',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    children: 'Card with a clock icon in the header.',
  },
};

export const WithTimestamp: Story = {
  args: {
    title: 'Timestamped Card',
    timestamp: '12:34:56',
    badge: 'success',
    badgeColor: 'success',
    children: 'Card content with a timestamp shown in the header.',
  },
};
