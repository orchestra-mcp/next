import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SettingField } from './SettingField';
import type { Setting, SettingValue } from './types';
import './SettingsForm.css';

const meta = {
  title: 'Settings/SettingField',
  component: SettingField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ maxWidth: 500 }}><Story /></div>],
} satisfies Meta<typeof SettingField>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Helper: wraps SettingField with local state */
function StatefulField({ setting }: { setting: Setting }) {
  const [value, setValue] = useState<SettingValue>(setting.value ?? setting.default);
  return (
    <SettingField
      setting={setting}
      value={value}
      onChange={(_, v) => setValue(v)}
    />
  );
}

export const StringInput: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'name', label: 'Display Name', type: 'string', default: '',
        group: 'general', order: 0, plugin_id: 'core',
        placeholder: 'Enter your name',
        validation: { required: true, minLength: 2, maxLength: 50 },
        description: 'This name is shown in the UI.',
      }}
    />
  ),
};

export const NumberInput: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'tabSize', label: 'Tab Size', type: 'number', default: 2,
        group: 'editor', order: 0, plugin_id: 'core',
        validation: { min: 1, max: 8, step: 1 },
        description: 'Number of spaces per tab.',
      }}
    />
  ),
};

export const BooleanToggle: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'wordWrap', label: 'Word Wrap', type: 'boolean', default: true,
        group: 'editor', order: 0, plugin_id: 'core',
        description: 'Wrap lines at the edge of the editor viewport.',
      }}
    />
  ),
};

export const SelectDropdown: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'theme', label: 'Color Theme', type: 'select', default: 'material-ocean',
        group: 'general', order: 0, plugin_id: 'core',
        placeholder: 'Choose a theme...',
        description: 'Searchable dropdown — type to filter options.',
        options: [
          { label: 'Material Ocean', value: 'material-ocean' },
          { label: 'Material Palenight', value: 'material-palenight' },
          { label: 'Dracula', value: 'dracula' },
          { label: 'One Dark Pro', value: 'one-dark-pro' },
          { label: 'Nord', value: 'nord' },
          { label: 'Catppuccin Mocha', value: 'catppuccin-mocha' },
          { label: 'Tokyo Night', value: 'tokyo-night' },
          { label: 'Gruvbox Dark', value: 'gruvbox-dark' },
          { label: 'Solarized Dark', value: 'solarized-dark' },
          { label: 'GitHub Dark', value: 'github-dark' },
        ],
      }}
    />
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'channels', label: 'Notification Channels', type: 'multi-select',
        default: ['email'], group: 'notifications', order: 0, plugin_id: 'core',
        options: [
          { label: 'Email', value: 'email', description: 'Send email notifications' },
          { label: 'Desktop', value: 'desktop', description: 'System notification popups' },
          { label: 'Slack', value: 'slack', description: 'Post to Slack channel' },
          { label: 'Discord', value: 'discord', description: 'Post to Discord webhook' },
        ],
      }}
    />
  ),
};

export const ColorPicker: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'accent', label: 'Accent Color', type: 'color', default: '#7c3aed',
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Pick a color or choose from the swatches below.',
        options: [
          { label: 'Purple', value: '#7c3aed' },
          { label: 'Blue', value: '#3b82f6' },
          { label: 'Teal', value: '#14b8a6' },
          { label: 'Green', value: '#22c55e' },
          { label: 'Yellow', value: '#eab308' },
          { label: 'Orange', value: '#f97316' },
          { label: 'Red', value: '#ef4444' },
          { label: 'Pink', value: '#ec4899' },
          { label: 'Sunset', value: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
          { label: 'Ocean', value: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
          { label: 'Aurora', value: 'linear-gradient(135deg, #7c3aed, #ec4899)' },
          { label: 'Forest', value: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
        ],
      }}
    />
  ),
};

export const ColorPickerNoSwatches: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'bg', label: 'Background Color', type: 'color', default: '#1e1e2e',
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Color picker without preset swatches.',
      }}
    />
  ),
};

export const RangeSlider: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'fontSize', label: 'Font Size', type: 'range', default: 14,
        group: 'editor', order: 0, plugin_id: 'core',
        validation: { min: 8, max: 32, step: 1 },
        description: 'Controls the editor font size in pixels.',
      }}
    />
  ),
};

export const DisabledField: Story = {
  args: {
    setting: {
      key: 'locked', label: 'Locked Setting', type: 'string', default: 'read-only',
      group: 'general', order: 0, plugin_id: 'core',
      disabled: true,
      description: 'This setting is managed by your organization.',
    },
    value: 'read-only',
    onChange: () => {},
    disabled: true,
  },
};

export const RequiredField: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'email', label: 'Email Address', type: 'string', default: '',
        group: 'general', order: 0, plugin_id: 'core',
        placeholder: 'you@example.com',
        validation: { required: true, pattern: '.*@.*' },
      }}
    />
  ),
};

export const DatePicker: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'startDate', label: 'Start Date', type: 'date', default: '2026-01-01',
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Select the project start date.',
      }}
    />
  ),
};

export const TimezoneSelect: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'timezone', label: 'Timezone', type: 'timezone', default: 'America/New_York',
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Searchable timezone selector with IANA timezones.',
      }}
    />
  ),
};

export const KeyValuePairs: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'envVars', label: 'Environment Variables', type: 'key-value',
        default: { NODE_ENV: 'development', PORT: '3000' },
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Key-value pairs for environment configuration.',
      }}
    />
  ),
};

export const Repeater: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'allowedOrigins', label: 'Allowed Origins', type: 'repeater',
        default: [
          { id: '1', url: 'https://localhost:3000', label: 'Dev' },
          { id: '2', url: 'https://app.example.com', label: 'Production' },
        ],
        group: 'general', order: 0, plugin_id: 'core',
        description: 'Configure CORS allowed origins.',
        repeaterColumns: [
          { key: 'label', label: 'Label', placeholder: 'Environment name' },
          { key: 'url', label: 'URL', placeholder: 'https://...' },
        ],
      }}
    />
  ),
};

export const CodeInput: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'customCSS', label: 'Custom CSS', type: 'code',
        default: '/* Custom styles */\n.my-class {\n  color: red;\n}',
        group: 'general', order: 0, plugin_id: 'core',
        placeholder: '/* Enter CSS here */',
        description: 'Add custom CSS to override default styles.',
      }}
    />
  ),
};

export const MarkdownInput: Story = {
  render: () => (
    <StatefulField
      setting={{
        key: 'readme', label: 'Project README', type: 'markdown',
        default: '# My Project\n\nDescribe your project here.',
        group: 'general', order: 0, plugin_id: 'core',
        placeholder: 'Write markdown...',
        description: 'Markdown editor with live preview.',
      }}
    />
  ),
};
