import type { Meta, StoryObj } from '@storybook/react';
import { PanelLayout } from './PanelLayout';

const meta = {
  title: 'Desktop/Panels/PanelLayout',
  component: PanelLayout,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof PanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Settings',
    children: (
      <div style={{ padding: 24, color: 'var(--color-fg)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>General</h2>
        <p style={{ color: 'var(--color-fg-muted)' }}>Panel content goes here.</p>
      </div>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    title: 'Appearance',
    description: 'Customize colors, fonts, and layout options',
    children: (
      <div style={{ padding: 24, color: 'var(--color-fg)' }}>
        <p>Theme settings content.</p>
      </div>
    ),
  },
};

export const WithSidebar: Story = {
  args: {
    title: 'Settings',
    description: 'Manage your preferences',
    showSidebar: true,
    sidebar: (
      <nav style={{ padding: 12 }}>
        {['General', 'Appearance', 'Extensions', 'Keybindings'].map((label) => (
          <div
            key={label}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              color: 'var(--color-fg)',
              cursor: 'pointer',
            }}
          >
            {label}
          </div>
        ))}
      </nav>
    ),
    children: (
      <div style={{ padding: 24, color: 'var(--color-fg)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>General</h2>
        <p style={{ color: 'var(--color-fg-muted)' }}>Settings content area.</p>
      </div>
    ),
  },
};
