import type { Meta, StoryObj } from '@storybook/react';
import type { SidebarView } from './Sidebar';
import { Sidebar } from './Sidebar';

const MOCK_VIEWS: SidebarView[] = [
  { id: 'files', title: 'Files', icon: 'files', route: '/panels/files' },
  { id: 'search', title: 'Search', icon: 'search', route: '/panels/search' },
  { id: 'git', title: 'Git', icon: 'git', route: '/panels/git' },
  { id: 'extensions', title: 'Extensions', icon: 'extensions', route: '/panels/extensions' },
  { id: 'debug', title: 'Debug', icon: 'debug', route: '/panels/debug' },
];

const BADGE_VIEWS: SidebarView[] = [
  { id: 'files', title: 'Files', icon: 'files', route: '/panels/files' },
  { id: 'search', title: 'Search', icon: 'search', route: '/panels/search', badge: '12' },
  { id: 'git', title: 'Git', icon: 'git', route: '/panels/git', badge: '3' },
  { id: 'extensions', title: 'Extensions', icon: 'extensions', route: '/panels/extensions' },
  { id: 'debug', title: 'Debug', icon: 'debug', route: '/panels/debug', badge: '!' },
];

const meta = {
  title: 'Desktop/Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty sidebar, no views registered */
export const Default: Story = {
  args: { views: [] },
};

/** Sidebar with five views */
export const WithViews: Story = {
  args: { views: MOCK_VIEWS },
};

/** Sidebar with badge indicators */
export const WithBadges: Story = {
  args: { views: BADGE_VIEWS },
};

/** Sidebar with active route highlighted */
export const WithActiveRoute: Story = {
  args: {
    views: MOCK_VIEWS,
    activeRoute: '/panels/git',
  },
};
