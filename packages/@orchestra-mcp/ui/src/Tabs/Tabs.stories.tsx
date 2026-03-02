import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { useState } from 'react';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicTabs = [
  {
    id: 'overview',
    label: 'Overview',
    content: (
      <div>
        <h3>Overview</h3>
        <p>This is the overview tab content.</p>
        <p>It contains general information about the topic.</p>
      </div>
    ),
  },
  {
    id: 'details',
    label: 'Details',
    content: (
      <div>
        <h3>Details</h3>
        <p>This tab shows detailed information.</p>
        <ul>
          <li>Detail item 1</li>
          <li>Detail item 2</li>
          <li>Detail item 3</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    content: (
      <div>
        <h3>Settings</h3>
        <p>Configure your settings here.</p>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" /> Enable notifications
        </label>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input type="checkbox" /> Auto-save
        </label>
      </div>
    ),
  },
];

export const Basic: Story = {
  args: {
    tabs: basicTabs,
  },
};

export const WithDefaultTab: Story = {
  args: {
    tabs: basicTabs,
    defaultActiveId: 'details',
  },
};

export const WithIcons: Story = {
  args: {
    tabs: [
      {
        id: 'home',
        label: 'Home',
        icon: <span>🏠</span>,
        content: <div><h3>Home</h3><p>Welcome to the home tab!</p></div>,
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <span>👤</span>,
        content: <div><h3>Profile</h3><p>View your profile information.</p></div>,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <span>🔔</span>,
        content: <div><h3>Notifications</h3><p>You have 3 new notifications.</p></div>,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <span>⚙️</span>,
        content: <div><h3>Settings</h3><p>Manage your settings here.</p></div>,
      },
    ],
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      {
        id: 'tab1',
        label: 'Enabled Tab',
        content: <div><p>This tab is enabled and clickable.</p></div>,
      },
      {
        id: 'tab2',
        label: 'Disabled Tab',
        content: <div><p>This content won't be shown.</p></div>,
        disabled: true,
      },
      {
        id: 'tab3',
        label: 'Another Tab',
        content: <div><p>This is another enabled tab.</p></div>,
      },
    ],
  },
};

export const Vertical: Story = {
  args: {
    tabs: basicTabs,
    orientation: 'vertical',
  },
};

export const VerticalWithIcons: Story = {
  args: {
    tabs: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <span>📊</span>,
        content: (
          <div>
            <h2>Dashboard</h2>
            <p>View your dashboard statistics and insights.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>124</div>
                <div style={{ fontSize: '14px', color: 'var(--color-fg-muted)' }}>Total Users</div>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>42</div>
                <div style={{ fontSize: '14px', color: 'var(--color-fg-muted)' }}>Active Now</div>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>89%</div>
                <div style={{ fontSize: '14px', color: 'var(--color-fg-muted)' }}>Satisfaction</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <span>📈</span>,
        content: <div><h2>Analytics</h2><p>Detailed analytics and charts will be displayed here.</p></div>,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <span>📄</span>,
        content: <div><h2>Reports</h2><p>Generate and view reports.</p></div>,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <span>⚙️</span>,
        content: <div><h2>Settings</h2><p>Configure your application settings.</p></div>,
      },
    ],
    orientation: 'vertical',
  },
};

export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <div>
        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'var(--color-bg-alt)', borderRadius: '8px' }}>
          <p style={{ margin: 0, marginBottom: '8px' }}>
            <strong>Current active tab:</strong> {activeTab}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setActiveTab('tab1')} style={{ padding: '4px 12px', borderRadius: '4px' }}>
              Go to Tab 1
            </button>
            <button onClick={() => setActiveTab('tab2')} style={{ padding: '4px 12px', borderRadius: '4px' }}>
              Go to Tab 2
            </button>
            <button onClick={() => setActiveTab('tab3')} style={{ padding: '4px 12px', borderRadius: '4px' }}>
              Go to Tab 3
            </button>
          </div>
        </div>
        <Tabs
          tabs={[
            { id: 'tab1', label: 'Tab 1', content: <div>Content for tab 1</div> },
            { id: 'tab2', label: 'Tab 2', content: <div>Content for tab 2</div> },
            { id: 'tab3', label: 'Tab 3', content: <div>Content for tab 3</div> },
          ]}
          activeId={activeTab}
          onTabChange={(id) => setActiveTab(id)}
        />
      </div>
    );
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: Array.from({ length: 10 }, (_, i) => ({
      id: `tab${i + 1}`,
      label: `Tab ${i + 1}`,
      content: <div><p>Content for tab {i + 1}</p></div>,
    })),
  },
};

export const FormExample: Story = {
  args: {
    tabs: [
      {
        id: 'personal',
        label: 'Personal Info',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>First Name</label>
              <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Last Name</label>
              <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
              <input type="email" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
        ),
      },
      {
        id: 'address',
        label: 'Address',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Street Address</label>
              <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>City</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Zip Code</label>
                <input type="text" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'preferences',
        label: 'Preferences',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" />
              Email notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" />
              SMS notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" />
              Newsletter subscription
            </label>
          </div>
        ),
      },
    ],
  },
};
