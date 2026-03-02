import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SettingsForm } from './SettingsForm';
import type { SettingsState, SettingValue } from './types';

/* ── Group Icons ───────────────────────────────── */

const GeneralIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const editorState: SettingsState = {
  groups: [
    { id: 'general', label: 'General', description: 'App-wide preferences', order: 0, icon: <GeneralIcon /> },
    { id: 'editor', label: 'Editor', description: 'Code editing preferences', order: 1, icon: <EditorIcon /> },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Configure alerts and sounds',
      order: 2,
      collapsible: true,
      icon: <BellIcon />,
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Power user options',
      order: 3,
      collapsible: true,
      collapsed: true,
      icon: <WrenchIcon />,
    },
  ],
  settings: [
    {
      key: 'theme', label: 'Theme', type: 'select', default: 'dark',
      group: 'general', order: 0, plugin_id: 'core',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      key: 'language', label: 'Language', type: 'select', default: 'en',
      group: 'general', order: 1, plugin_id: 'core',
      options: [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    {
      key: 'username', label: 'Username', type: 'string', default: '',
      group: 'general', order: 2, plugin_id: 'core',
      placeholder: 'Enter your username',
      validation: { required: true, minLength: 3, maxLength: 32 },
    },
    {
      key: 'fontSize', label: 'Font Size', type: 'range', default: 14,
      group: 'editor', order: 0, plugin_id: 'core',
      validation: { min: 10, max: 32, step: 1 },
      description: 'Controls the font size in pixels.',
    },
    {
      key: 'tabSize', label: 'Tab Size', type: 'number', default: 2,
      group: 'editor', order: 1, plugin_id: 'core',
      validation: { min: 1, max: 8 },
    },
    {
      key: 'wordWrap', label: 'Word Wrap', type: 'boolean', default: true,
      group: 'editor', order: 2, plugin_id: 'core',
      description: 'Wrap lines at the edge of the editor.',
    },
    {
      key: 'minimap', label: 'Minimap', type: 'boolean', default: true,
      group: 'editor', order: 3, plugin_id: 'core',
      description: 'Show code minimap on the right side.',
    },
    {
      key: 'accentColor', label: 'Accent Color', type: 'color', default: '#7c3aed',
      group: 'editor', order: 4, plugin_id: 'core',
    },
    {
      key: 'notifications.enabled', label: 'Enable Notifications', type: 'boolean',
      default: true, group: 'notifications', order: 0, plugin_id: 'notifications',
    },
    {
      key: 'notifications.sound', label: 'Sound', type: 'boolean',
      default: true, group: 'notifications', order: 1, plugin_id: 'notifications',
      description: 'Play a sound when notifications arrive.',
    },
    {
      key: 'notifications.types', label: 'Notification Types', type: 'multi-select',
      default: ['errors', 'warnings'], group: 'notifications', order: 2, plugin_id: 'notifications',
      options: [
        { label: 'Errors', value: 'errors', description: 'Build and runtime errors' },
        { label: 'Warnings', value: 'warnings', description: 'Linting warnings' },
        { label: 'Info', value: 'info', description: 'General information' },
        { label: 'Git', value: 'git', description: 'Git push/pull status' },
      ],
    },
    {
      key: 'telemetry', label: 'Telemetry Level', type: 'select', default: 'error',
      group: 'advanced', order: 0, plugin_id: 'core',
      options: [
        { label: 'Off', value: 'off' },
        { label: 'Error', value: 'error' },
        { label: 'All', value: 'all' },
      ],
      description: 'Controls how much data is sent for crash reporting.',
    },
    {
      key: 'experimental', label: 'Experimental Features', type: 'boolean',
      default: false, group: 'advanced', order: 1, plugin_id: 'core',
      description: 'Enable unstable features. May cause issues.',
    },
  ],
};

const meta = {
  title: 'Settings/SettingsForm',
  component: SettingsForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── Interactive (stateful) ────────────────────── */

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, SettingValue>>({});
    return (
      <div style={{ maxWidth: 600 }}>
        <SettingsForm
          state={editorState}
          values={values}
          onChange={(key, val) => setValues((p) => ({ ...p, [key]: val }))}
        />
      </div>
    );
  },
};

export const SingleGroup: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, SettingValue>>({});
    return (
      <div style={{ maxWidth: 600 }}>
        <SettingsForm
          state={editorState}
          values={values}
          onChange={(key, val) => setValues((p) => ({ ...p, [key]: val }))}
          activeGroup="editor"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    state: editorState,
    values: {},
    onChange: () => {},
    disabled: true,
  },
  decorators: [(Story) => <div style={{ maxWidth: 600 }}><Story /></div>],
};

export const NotificationsGroup: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, SettingValue>>({
      'notifications.types': ['errors', 'warnings'],
    });
    return (
      <div style={{ maxWidth: 600 }}>
        <SettingsForm
          state={editorState}
          values={values}
          onChange={(key, val) => setValues((p) => ({ ...p, [key]: val }))}
          activeGroup="notifications"
        />
      </div>
    );
  },
};

export const EmptyState: Story = {
  args: {
    state: { groups: [], settings: [] },
    values: {},
    onChange: () => {},
  },
};

export const AllFieldTypes: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, SettingValue>>({});
    const allTypesState: SettingsState = {
      groups: [
        { id: 'fields', label: 'All Field Types', description: 'Showcases every supported input type', order: 0, icon: <GeneralIcon /> },
      ],
      settings: [
        { key: 'name', label: 'Name', type: 'string', default: '', group: 'fields', order: 0, plugin_id: 'core', placeholder: 'Enter name' },
        { key: 'count', label: 'Count', type: 'number', default: 5, group: 'fields', order: 1, plugin_id: 'core', validation: { min: 0, max: 100 } },
        { key: 'enabled', label: 'Enabled', type: 'boolean', default: true, group: 'fields', order: 2, plugin_id: 'core', description: 'Toggle this feature on or off.' },
        {
          key: 'theme', label: 'Theme', type: 'select', default: 'dark', group: 'fields', order: 3, plugin_id: 'core',
          options: [{ label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }, { label: 'System', value: 'system' }],
        },
        {
          key: 'tags', label: 'Tags', type: 'multi-select', default: ['react'], group: 'fields', order: 4, plugin_id: 'core',
          options: [{ label: 'React', value: 'react' }, { label: 'Vue', value: 'vue' }, { label: 'Svelte', value: 'svelte' }],
        },
        { key: 'color', label: 'Color', type: 'color', default: '#7c3aed', group: 'fields', order: 5, plugin_id: 'core' },
        { key: 'volume', label: 'Volume', type: 'range', default: 75, group: 'fields', order: 6, plugin_id: 'core', validation: { min: 0, max: 100 } },
        { key: 'startDate', label: 'Start Date', type: 'date', default: '2026-01-01', group: 'fields', order: 7, plugin_id: 'core' },
        { key: 'tz', label: 'Timezone', type: 'timezone', default: 'UTC', group: 'fields', order: 8, plugin_id: 'core', description: 'Select your timezone.' },
        {
          key: 'envVars', label: 'Environment Variables', type: 'key-value',
          default: { NODE_ENV: 'production', DEBUG: 'false' }, group: 'fields', order: 9, plugin_id: 'core',
          description: 'Add key-value pairs.',
        },
        {
          key: 'urls', label: 'Allowed URLs', type: 'repeater',
          default: [{ id: '1', url: 'https://example.com', label: 'Main' }],
          group: 'fields', order: 10, plugin_id: 'core',
          repeaterColumns: [{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL', placeholder: 'https://...' }],
        },
        {
          key: 'customCSS', label: 'Custom CSS', type: 'code',
          default: '.app {\n  background: #1a1a2e;\n}', group: 'fields', order: 11, plugin_id: 'core',
        },
        {
          key: 'readme', label: 'README', type: 'markdown',
          default: '# Hello\n\nWrite something...', group: 'fields', order: 12, plugin_id: 'core',
        },
      ],
    };
    return (
      <SettingsForm
        state={allTypesState}
        values={values}
        onChange={(key, val) => setValues((p) => ({ ...p, [key]: val }))}
      />
    );
  },
};
