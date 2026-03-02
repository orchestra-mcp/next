import type { Meta, StoryObj } from '@storybook/react';
import type { PanelRegistration } from './PanelContainer';
import { PanelContainer } from './PanelContainer';

function MockSettingsPanel() {
  return (
    <div style={{ padding: 24, color: 'var(--color-fg)' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Settings</h2>
      <p style={{ color: 'var(--color-fg-muted)' }}>Settings panel content.</p>
    </div>
  );
}

function MockDashboardPanel() {
  return (
    <div style={{ padding: 24, color: 'var(--color-fg)' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Dashboard</h2>
      <p style={{ color: 'var(--color-fg-muted)' }}>Dashboard overview.</p>
    </div>
  );
}

const MOCK_PANELS: PanelRegistration[] = [
  { route: '/panels/settings', component: MockSettingsPanel, title: 'Settings' },
  { route: '/panels/dashboard', component: MockDashboardPanel, title: 'Dashboard' },
];

const meta = {
  title: 'Desktop/Panels/PanelContainer',
  component: PanelContainer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Renders the settings panel */
export const MatchedRoute: Story = {
  args: {
    route: '/panels/settings',
    panels: MOCK_PANELS,
  },
};

/** Route with no matching panel shows PanelNotFound */
export const UnmatchedRoute: Story = {
  args: {
    route: '/panels/unknown',
    panels: MOCK_PANELS,
  },
};
