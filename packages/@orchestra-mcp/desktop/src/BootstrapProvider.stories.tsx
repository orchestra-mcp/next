import type { Meta, StoryObj } from '@storybook/react';
import { BootstrapProvider } from './BootstrapProvider';

/**
 * BootstrapProvider wraps the app and loads the UI manifest from the Go backend.
 * When not ready it shows a loading screen; once ready it renders children.
 *
 * In Storybook, useBootstrap is mocked via module mocks or the story decorator
 * to simulate the two states.
 */
const meta = {
  title: 'Desktop/Providers/BootstrapProvider',
  component: BootstrapProvider,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BootstrapProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simulates the loading state shown while plugins are being loaded.
 * The real component shows this screen until useBootstrap returns ready=true.
 */
export const LoadingState: Story = {
  args: {
    children: (
      <div style={{ padding: 24, color: 'var(--color-fg)' }}>
        <h1>App Content</h1>
        <p style={{ color: 'var(--color-fg-muted)' }}>
          This content is hidden until bootstrap completes.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'The loading screen is rendered when useBootstrap returns ready=false. In a real app this resolves within milliseconds after Wails IPC is available.',
      },
    },
  },
};

/**
 * Simulates the ready state where children are rendered.
 * In production this is the normal running state.
 */
export const ReadyState: Story = {
  args: {
    children: (
      <div
        style={{
          padding: 24,
          color: 'var(--color-fg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Orchestra Desktop</h1>
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 14 }}>
          Bootstrap complete — plugins loaded successfully.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When bootstrap is complete the BootstrapContext provides ready=true and children are rendered normally.',
      },
    },
  },
};
