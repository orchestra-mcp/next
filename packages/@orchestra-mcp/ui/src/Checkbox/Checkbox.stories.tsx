import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Checkbox, CheckboxCard, TreeCheckbox } from './Checkbox';
import type { CheckboxColor, TreeCheckboxNode } from './Checkbox';

/* Stateful wrapper so every single-checkbox story toggles on click */
function StatefulCheckbox(props: React.ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  const [indeterminate, setIndeterminate] = useState(props.indeterminate ?? false);
  return (
    <Checkbox
      {...props}
      checked={checked}
      indeterminate={indeterminate}
      onChange={(val) => {
        setChecked(val);
        setIndeterminate(false);
        props.onChange?.(val);
      }}
    />
  );
}

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  render: (args) => <StatefulCheckbox key={JSON.stringify(args)} {...args} />,
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    error: { control: 'text' },
    color: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Click me to toggle' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('checkbox');
    await expect(input).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: { checked: true, label: 'Checked checkbox' },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Indeterminate state' },
};

export const WithLabel: Story = {
  args: { label: 'Accept terms and conditions' },
};

export const WithError: Story = {
  args: {
    label: 'I agree to the terms',
    error: 'You must accept the terms to continue',
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled checkbox', disabled: true },
};

/* Interactive checkboxes with state management */
function InteractiveCheckbox({ label, color }: { label: string; color?: CheckboxColor }) {
  const [checked, setChecked] = useState(false);
  return <Checkbox checked={checked} onChange={setChecked} label={label} color={color} />;
}

export const Interactive: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <InteractiveCheckbox label="Click me to toggle" />
      <InteractiveCheckbox label="Primary" color="primary" />
      <InteractiveCheckbox label="Success" color="success" />
      <InteractiveCheckbox label="Warning" color="warning" />
      <InteractiveCheckbox label="Danger" color="danger" />
      <InteractiveCheckbox label="Info" color="info" />
    </div>
  ),
};

export const AllStates: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <InteractiveCheckbox label="Unchecked" />
      <Checkbox label="Checked" checked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" checked disabled />
      <Checkbox label="With error" error="This field is required" />
    </div>
  ),
};

/* Color variants — all colors checked */
export const Colors: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <InteractiveCheckbox label="Default (accent)" />
      <InteractiveCheckbox label="Primary" color="primary" />
      <InteractiveCheckbox label="Success" color="success" />
      <InteractiveCheckbox label="Warning" color="warning" />
      <InteractiveCheckbox label="Danger" color="danger" />
      <InteractiveCheckbox label="Info" color="info" />
    </div>
  ),
};

/* ── CheckboxCard stories ──────────────────────── */

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function InteractiveCards() {
  const [autosave, setAutosave] = useState(true);
  const [notifs, setNotifs] = useState(false);
  const [security, setSecurity] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: 360 }}>
      <CheckboxCard
        title="Auto-save"
        description="Save files automatically when focus changes"
        icon={<GearIcon />}
        checked={autosave}
        onChange={setAutosave}
        color="primary"
      />
      <CheckboxCard
        title="Notifications"
        description="Show desktop notifications for events"
        icon={<BellIcon />}
        checked={notifs}
        onChange={setNotifs}
        color="info"
      />
      <CheckboxCard
        title="Security"
        description="Enable two-factor authentication"
        icon={<ShieldIcon />}
        checked={security}
        onChange={setSecurity}
        color="success"
      />
      <CheckboxCard
        title="Disabled option"
        description="This setting is managed by your admin"
        icon={<ShieldIcon />}
        disabled
      />
    </div>
  );
}

export const SettingsCards: Story = {
  args: {},
  render: () => <InteractiveCards />,
};

/* ── TreeCheckbox stories ──────────────────────── */

const sampleTree: TreeCheckboxNode[] = [
  {
    id: 'permissions',
    label: 'Permissions',
    children: [
      {
        id: 'files',
        label: 'File System',
        children: [
          { id: 'files-read', label: 'Read files' },
          { id: 'files-write', label: 'Write files' },
          { id: 'files-delete', label: 'Delete files' },
        ],
      },
      {
        id: 'network',
        label: 'Network',
        children: [
          { id: 'net-http', label: 'HTTP requests' },
          { id: 'net-ws', label: 'WebSocket connections' },
        ],
      },
      { id: 'clipboard', label: 'Clipboard access' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    children: [
      { id: 'ai', label: 'AI Assistant' },
      { id: 'sync', label: 'Cloud Sync' },
      { id: 'extensions', label: 'Extension Marketplace' },
    ],
  },
];

function InteractiveTree({ color }: { color?: CheckboxColor }) {
  const [selected, setSelected] = useState<string[]>(['files-read', 'net-http', 'ai']);
  return (
    <div style={{ width: 320 }}>
      <TreeCheckbox nodes={sampleTree} selected={selected} onChange={setSelected} color={color} />
    </div>
  );
}

export const Tree: Story = {
  args: {},
  render: () => <InteractiveTree />,
};

export const TreeWithColors: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '40px' }}>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--color-fg-bright)' }}>Primary</div>
        <InteractiveTree color="primary" />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--color-fg-bright)' }}>Success</div>
        <InteractiveTree color="success" />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--color-fg-bright)' }}>Danger</div>
        <InteractiveTree color="danger" />
      </div>
    </div>
  ),
};
