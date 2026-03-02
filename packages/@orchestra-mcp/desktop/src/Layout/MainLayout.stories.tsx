import type { Meta, StoryObj } from '@storybook/react';
import type { SidebarView } from './Sidebar';
import { MainLayout } from './MainLayout';

const MOCK_VIEWS: SidebarView[] = [
  { id: 'files', title: 'Files', icon: 'files', route: '/panels/files' },
  { id: 'search', title: 'Search', icon: 'search', route: '/panels/search' },
  { id: 'git', title: 'Git', icon: 'git', route: '/panels/git' },
  { id: 'extensions', title: 'Extensions', icon: 'extensions', route: '/panels/extensions' },
];

const meta = {
  title: 'Desktop/Layout/MainLayout',
  component: MainLayout,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 800, height: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full layout with sidebar views populated */
export const Default: Story = {
  args: {
    breadcrumb: 'Orchestra / Home',
    pluginCount: 4,
    sidebarViews: MOCK_VIEWS,
  },
};

/** Empty shell: no views, no plugins */
export const Empty: Story = {
  args: {
    breadcrumb: 'Orchestra',
    pluginCount: 0,
    sidebarViews: [],
  },
};

/** Full layout with content panel */
export const WithContent: Story = {
  args: {
    breadcrumb: 'Orchestra / Dashboard',
    pluginCount: 5,
    sidebarViews: MOCK_VIEWS,
    children: (
      <div style={{ color: 'var(--color-fg)', padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Dashboard</h2>
        <p style={{ color: 'var(--color-fg-muted)', marginBottom: 16 }}>
          Welcome to Orchestra. Select a view from the sidebar to begin.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['Projects', 'Tasks', 'Activity', 'Settings'].map((label) => (
            <div
              key={label}
              style={{
                padding: 16,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-alt)',
              }}
            >
              <div style={{ fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 4 }}>
                Click to open
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};
