import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

/**
 * Switch component for toggling boolean values:
 * - 25 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - Small, medium, and large sizes
 * - Accessible with keyboard and screen readers
 */
const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Switch size',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is on',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable switch interaction',
    },
    label: {
      control: 'text',
      description: 'Label text next to the switch',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive wrapper to demonstrate toggle behavior */
const InteractiveSwitch = (props: React.ComponentProps<typeof Switch>) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
};

export const Default: Story = {
  args: { size: 'medium' },
  render: (args) => <InteractiveSwitch {...args} />,
};

export const Checked: Story = {
  args: { checked: true, size: 'medium' },
  render: (args) => <InteractiveSwitch {...args} />,
};

export const WithLabel: Story = {
  args: { label: 'Dark mode', size: 'medium' },
  render: (args) => <InteractiveSwitch {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Unavailable', size: 'medium' },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, label: 'Locked on', size: 'medium' },
};

/**
 * All switch sizes side by side
 */
export const AllSizes: Story = {
  args: { size: 'medium' },
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <InteractiveSwitch size="small" label="Small" />
      <InteractiveSwitch size="medium" label="Medium" />
      <InteractiveSwitch size="large" label="Large" />
    </div>
  ),
};
