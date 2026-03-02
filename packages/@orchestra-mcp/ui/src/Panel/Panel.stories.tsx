import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';

const meta = {
  title: 'UI/Panel',
  component: Panel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: 'Basic Panel',
    children: (
      <div>
        <p>This is a basic panel with some content.</p>
        <p>Panels are useful for grouping related content together.</p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Panel with Footer',
    children: (
      <div>
        <p>This panel has a footer section at the bottom.</p>
        <p>The footer can contain actions, metadata, or additional information.</p>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Last updated: 2 hours ago</span>
        <button style={{ padding: '4px 12px', borderRadius: '4px' }}>Save</button>
      </div>
    ),
  },
};

export const WithHeaderActions: Story = {
  args: {
    title: 'Panel with Actions',
    children: (
      <div>
        <p>This panel has action buttons in the header.</p>
        <p>Click the buttons to perform actions without affecting the panel state.</p>
      </div>
    ),
    headerActions: (
      <>
        <button style={{ padding: '4px 8px', borderRadius: '4px', marginRight: '4px' }}>
          Edit
        </button>
        <button style={{ padding: '4px 8px', borderRadius: '4px' }}>Delete</button>
      </>
    ),
  },
};

export const Collapsible: Story = {
  args: {
    title: 'Collapsible Panel',
    collapsible: true,
    children: (
      <div>
        <p>This panel can be collapsed by clicking the header.</p>
        <p>Notice the arrow icon that indicates the collapse state.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    ),
  },
};

export const DefaultCollapsed: Story = {
  args: {
    title: 'Initially Collapsed Panel',
    collapsible: true,
    defaultCollapsed: true,
    children: (
      <div>
        <p>This panel starts in a collapsed state.</p>
        <p>Click the header to expand and see the content.</p>
      </div>
    ),
  },
};

export const CollapsibleWithFooter: Story = {
  args: {
    title: 'Collapsible with Footer',
    collapsible: true,
    children: (
      <div>
        <p>When collapsed, both content and footer are hidden.</p>
      </div>
    ),
    footer: <div>Footer content hidden when collapsed</div>,
  },
};

export const WithoutTitle: Story = {
  args: {
    children: (
      <div>
        <h4 style={{ marginTop: 0 }}>Panel without header</h4>
        <p>This panel has no title or header section.</p>
        <p>It's just a simple container with borders.</p>
      </div>
    ),
  },
};

export const NestedPanels: Story = {
  render: () => (
    <Panel title="Parent Panel" collapsible>
      <p>This is the parent panel content.</p>
      <Panel title="Child Panel 1" collapsible>
        <p>This is a nested panel inside the parent.</p>
      </Panel>
      <Panel title="Child Panel 2" collapsible defaultCollapsed>
        <p>This is another nested panel, initially collapsed.</p>
      </Panel>
    </Panel>
  ),
};

export const WithCustomContent: Story = {
  args: {
    title: 'Settings Panel',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter email"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" />
            <span>Enable notifications</span>
          </label>
        </div>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button style={{ padding: '6px 16px', borderRadius: '4px' }}>Cancel</button>
        <button
          style={{
            padding: '6px 16px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
          }}
        >
          Save Changes
        </button>
      </div>
    ),
  },
};
