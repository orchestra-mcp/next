import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Breadcrumbs } from './Breadcrumbs';

/**
 * Breadcrumbs provide a navigation trail showing the user's
 * current location within the app hierarchy.
 * - 25 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - Supports icons, truncation, and custom separators
 */
const meta = {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    separator: {
      control: 'text',
      description: 'Separator character between items',
    },
    maxItems: {
      control: 'number',
      description: 'Maximum visible items before truncation',
    },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: /breadcrumb/i });
    await expect(nav).toBeInTheDocument();
    await expect(canvas.getByText('Widget')).toHaveAttribute('aria-current', 'page');
  },
};

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Root', href: '/', icon: <FolderIcon /> },
      { label: 'Documents', href: '/docs', icon: <FolderIcon /> },
      { label: 'Report.pdf', icon: <FolderIcon /> },
    ],
  },
};

export const Truncated: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/cat' },
      { label: 'Subcategory', href: '/sub' },
      { label: 'Section', href: '/sec' },
      { label: 'Current Page' },
    ],
    maxItems: 3,
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ],
    separator: '>',
  },
};
