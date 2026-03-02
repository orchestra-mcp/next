import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DetailPanel } from './DetailPanel';
import type { DetailField } from './DetailPanel';

const meta: Meta<typeof DetailPanel> = {
  title: 'Tasks/DetailPanel',
  component: DetailPanel,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof DetailPanel>;

const fields: DetailField[] = [
  { label: 'Status', value: 'In Progress', color: '#8b5cf6' },
  { label: 'Type', value: 'task' },
  { label: 'Priority', value: 'high' },
  { label: 'Created', value: '2026-02-15' },
];

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Design Explorer plugin architecture and manifest',
    subtitle: 'OF-206',
    fields,
    children: (
      <div>
        <p>Create plugins/explorer/ directory structure following plugin conventions.</p>
        <p>Design manifest.json with: name, version, description, icon, services, UI contributions, permissions, dependencies.</p>
        <p>Define plugin lifecycle hooks (Load, Boot, Register, Shutdown).</p>
      </div>
    ),
  },
};

export const NoDescription: Story = {
  args: {
    isOpen: true,
    title: 'Rewrite import paths and rebuild binaries',
    subtitle: 'OF-346',
    fields: [
      { label: 'Status', value: 'Backlog', color: '#6b7280' },
      { label: 'Type', value: 'task' },
      { label: 'Priority', value: 'high' },
    ],
    children: <p style={{ color: 'var(--color-fg-muted)' }}>No description available.</p>,
  },
};

export const WithMarkdown: Story = {
  args: {
    isOpen: true,
    title: 'Implement message passing to content scripts',
    subtitle: 'OF-178',
    fields,
    children: (
      <div>
        <h3>Overview</h3>
        <p>Build the messaging bridge between the background service worker and content scripts.</p>
        <h3>Requirements</h3>
        <ul>
          <li>Support one-way messages (background → content)</li>
          <li>Support request/response pattern</li>
          <li>Handle tab-specific targeting</li>
          <li>Timeout handling for unresponsive scripts</li>
        </ul>
        <blockquote>This is critical for the extension to communicate with injected page scripts.</blockquote>
        <pre><code>{`chrome.tabs.sendMessage(tabId, { type: 'INJECT', payload });`}</code></pre>
      </div>
    ),
  },
};

const InteractiveTemplate = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => setIsOpen(true)}>Open Panel</button>
      <DetailPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Interactive Detail Panel"
        subtitle="DEMO-1"
        fields={fields}
      >
        <p>Click outside or press ESC to close.</p>
      </DetailPanel>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};
