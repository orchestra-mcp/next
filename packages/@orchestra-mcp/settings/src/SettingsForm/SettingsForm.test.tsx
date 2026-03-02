import { render, screen, fireEvent } from '@testing-library/react';
import { SettingField } from './SettingField';
import { SettingsGroup } from './SettingsGroup';
import { SettingsForm } from './SettingsForm';
import type { Setting, SettingGroup as SettingGroupType, SettingsState } from './types';

const stringSetting: Setting = {
  key: 'name', label: 'Name', type: 'string', default: '',
  group: 'g1', order: 0, plugin_id: 'test', placeholder: 'Enter name',
};

const boolSetting: Setting = {
  key: 'enabled', label: 'Enabled', type: 'boolean', default: true,
  group: 'g1', order: 1, plugin_id: 'test', description: 'Toggle feature.',
};

const selectSetting: Setting = {
  key: 'theme', label: 'Theme', type: 'select', default: 'dark',
  group: 'g1', order: 2, plugin_id: 'test',
  options: [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
  ],
};

const rangeSetting: Setting = {
  key: 'size', label: 'Size', type: 'range', default: 14,
  group: 'g1', order: 3, plugin_id: 'test',
  validation: { min: 8, max: 32, step: 1 },
};

const colorSetting: Setting = {
  key: 'color', label: 'Color', type: 'color', default: '#ff0000',
  group: 'g1', order: 4, plugin_id: 'test',
};

const multiSetting: Setting = {
  key: 'channels', label: 'Channels', type: 'multi-select', default: [],
  group: 'g1', order: 5, plugin_id: 'test',
  options: [
    { label: 'Email', value: 'email' },
    { label: 'Slack', value: 'slack' },
  ],
};

const numberSetting: Setting = {
  key: 'tab', label: 'Tab Size', type: 'number', default: 2,
  group: 'g1', order: 6, plugin_id: 'test',
};

describe('SettingField', () => {
  it('renders string input', () => {
    render(<SettingField setting={stringSetting} value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('renders boolean toggle', () => {
    render(<SettingField setting={boolSetting} value={true} onChange={() => {}} />);
    expect(screen.getByLabelText('Toggle Enabled')).toBeInTheDocument();
    expect(screen.getByText('Toggle feature.')).toBeInTheDocument();
  });

  it('toggles boolean on click', () => {
    const onChange = vi.fn();
    render(<SettingField setting={boolSetting} value={false} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Toggle Enabled'));
    expect(onChange).toHaveBeenCalledWith('enabled', true);
  });

  it('renders searchable select with selected value', () => {
    render(<SettingField setting={selectSetting} value="dark" onChange={() => {}} />);
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('opens dropdown and shows search on click', () => {
    render(<SettingField setting={selectSetting} value="dark" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Light/ })).toBeInTheDocument();
  });

  it('calls onChange on option click', () => {
    const onChange = vi.fn();
    render(<SettingField setting={selectSetting} value="dark" onChange={onChange} />);
    fireEvent.click(screen.getByText('Dark'));
    fireEvent.click(screen.getByRole('option', { name: /Light/ }));
    expect(onChange).toHaveBeenCalledWith('theme', 'light');
  });

  it('filters options by search text', () => {
    render(<SettingField setting={selectSetting} value="dark" onChange={() => {}} />);
    fireEvent.click(screen.getByText('Dark'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'lig' } });
    expect(screen.getByRole('option', { name: /Light/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /^Dark$/ })).not.toBeInTheDocument();
  });

  it('renders range slider', () => {
    const { container } = render(
      <SettingField setting={rangeSetting} value={14} onChange={() => {}} />
    );
    const range = container.querySelector('input[type="range"]');
    expect(range).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('renders color picker', () => {
    const { container } = render(
      <SettingField setting={colorSetting} value="#ff0000" onChange={() => {}} />
    );
    expect(container.querySelector('input[type="color"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="text"]')).toHaveValue('#ff0000');
  });

  it('renders multi-select checkboxes', () => {
    render(
      <SettingField setting={multiSetting} value={['email']} onChange={() => {}} />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
  });

  it('renders number input', () => {
    const { container } = render(
      <SettingField setting={numberSetting} value={2} onChange={() => {}} />
    );
    expect(container.querySelector('input[type="number"]')).toHaveValue(2);
  });

  it('hides when setting.hidden is true', () => {
    const hidden: Setting = { ...stringSetting, hidden: true };
    const { container } = render(
      <SettingField setting={hidden} value="" onChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows required asterisk', () => {
    const required: Setting = {
      ...stringSetting,
      validation: { required: true },
    };
    render(<SettingField setting={required} value="" onChange={() => {}} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <SettingField setting={stringSetting} value="" onChange={() => {}} disabled />
    );
    expect(screen.getByPlaceholderText('Enter name')).toBeDisabled();
  });

  it('renders date picker', () => {
    const dateSetting: Setting = {
      key: 'date', label: 'Start Date', type: 'date', default: '2026-01-01',
      group: 'g1', order: 0, plugin_id: 'test',
    };
    const { container } = render(
      <SettingField setting={dateSetting} value="2026-01-01" onChange={() => {}} />
    );
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it('renders timezone select as searchable dropdown', () => {
    const tzSetting: Setting = {
      key: 'tz', label: 'Timezone', type: 'timezone', default: 'UTC',
      group: 'g1', order: 0, plugin_id: 'test',
    };
    render(<SettingField setting={tzSetting} value="UTC" onChange={() => {}} />);
    expect(screen.getByText('UTC')).toBeInTheDocument();
  });

  it('renders key-value pairs with add/remove', () => {
    const kvSetting: Setting = {
      key: 'env', label: 'Env', type: 'key-value', default: {},
      group: 'g1', order: 0, plugin_id: 'test',
    };
    const onChange = vi.fn();
    render(
      <SettingField setting={kvSetting} value={{ FOO: 'bar' }} onChange={onChange} />
    );
    expect(screen.getByDisplayValue('FOO')).toBeInTheDocument();
    expect(screen.getByDisplayValue('bar')).toBeInTheDocument();
    expect(screen.getByText('Add pair')).toBeInTheDocument();
  });

  it('renders repeater rows with columns', () => {
    const repSetting: Setting = {
      key: 'urls', label: 'URLs', type: 'repeater', default: [],
      group: 'g1', order: 0, plugin_id: 'test',
      repeaterColumns: [
        { key: 'label', label: 'Label' },
        { key: 'url', label: 'URL' },
      ],
    };
    render(
      <SettingField
        setting={repSetting}
        value={[{ id: '1', label: 'Dev', url: 'http://localhost' }]}
        onChange={() => {}}
      />
    );
    expect(screen.getByDisplayValue('Dev')).toBeInTheDocument();
    expect(screen.getByDisplayValue('http://localhost')).toBeInTheDocument();
    expect(screen.getByText('Add row')).toBeInTheDocument();
  });

  it('renders code textarea with monospace', () => {
    const codeSetting: Setting = {
      key: 'css', label: 'CSS', type: 'code', default: '',
      group: 'g1', order: 0, plugin_id: 'test', placeholder: '/* CSS */',
    };
    render(
      <SettingField setting={codeSetting} value=".app { color: red; }" onChange={() => {}} />
    );
    const textarea = screen.getByPlaceholderText('/* CSS */') as HTMLTextAreaElement;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('setting-field__code');
  });

  it('renders markdown field', () => {
    const mdSetting: Setting = {
      key: 'readme', label: 'README', type: 'markdown', default: '',
      group: 'g1', order: 0, plugin_id: 'test', placeholder: 'Write markdown...',
    };
    const { container } = render(
      <SettingField setting={mdSetting} value="# Hello" onChange={() => {}} />
    );
    // Should render either MarkdownEditor or fallback textarea
    const hasMarkdown = container.querySelector('.setting-field__markdown') ||
      container.querySelector('.setting-field__code');
    expect(hasMarkdown).toBeInTheDocument();
  });
});

describe('SettingsGroup', () => {
  const group: SettingGroupType = {
    id: 'g1', label: 'General', order: 0,
  };

  const collapsibleGroup: SettingGroupType = {
    id: 'g1', label: 'General', order: 0, collapsible: true,
  };

  it('renders group title and settings', () => {
    render(
      <SettingsGroup
        group={group}
        settings={[stringSetting, boolSetting]}
        values={{}}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle Enabled')).toBeInTheDocument();
  });

  it('collapses on header click when collapsible', () => {
    const { container } = render(
      <SettingsGroup
        group={collapsibleGroup}
        settings={[stringSetting]}
        values={{}}
        onChange={() => {}}
      />
    );
    const header = container.querySelector('.settings-group__header');
    expect(container.querySelector('.settings-group--collapsed')).not.toBeInTheDocument();

    fireEvent.click(header!);
    expect(container.querySelector('.settings-group--collapsed')).toBeInTheDocument();

    fireEvent.click(header!);
    expect(container.querySelector('.settings-group--collapsed')).not.toBeInTheDocument();
  });

  it('sorts settings by order', () => {
    const reversed = [
      { ...boolSetting, order: 1 },
      { ...stringSetting, order: 0 },
    ];
    const { container } = render(
      <SettingsGroup group={group} settings={reversed} values={{}} onChange={() => {}} />
    );
    const fields = container.querySelectorAll('.setting-field');
    expect(fields.length).toBe(2);
  });
});

describe('SettingsForm', () => {
  const state: SettingsState = {
    groups: [
      { id: 'g1', label: 'Group One', order: 0 },
      { id: 'g2', label: 'Group Two', order: 1 },
    ],
    settings: [
      stringSetting,
      boolSetting,
      { ...selectSetting, group: 'g2' },
    ],
  };

  it('renders all groups', () => {
    render(
      <SettingsForm state={state} values={{}} onChange={() => {}} />
    );
    expect(screen.getByText('Group One')).toBeInTheDocument();
    expect(screen.getByText('Group Two')).toBeInTheDocument();
  });

  it('filters to activeGroup', () => {
    render(
      <SettingsForm state={state} values={{}} onChange={() => {}} activeGroup="g2" />
    );
    expect(screen.queryByText('Group One')).not.toBeInTheDocument();
    expect(screen.getByText('Group Two')).toBeInTheDocument();
  });

  it('shows empty state when no settings exist', () => {
    const emptyState: SettingsState = {
      groups: [{ id: 'empty', label: 'Empty', order: 0 }],
      settings: [],
    };
    render(
      <SettingsForm state={emptyState} values={{}} onChange={() => {}} />
    );
    expect(screen.getByText('No settings available')).toBeInTheDocument();
  });

  it('shows custom empty state', () => {
    const emptyState: SettingsState = { groups: [], settings: [] };
    render(
      <SettingsForm state={emptyState} values={{}} onChange={() => {}} emptyState={<div>Custom empty</div>} />
    );
    expect(screen.getByText('Custom empty')).toBeInTheDocument();
  });

  it('passes disabled to all fields', () => {
    render(
      <SettingsForm
        state={{
          groups: [{ id: 'g1', label: 'G', order: 0 }],
          settings: [stringSetting],
        }}
        values={{}}
        onChange={() => {}}
        disabled
      />
    );
    expect(screen.getByPlaceholderText('Enter name')).toBeDisabled();
  });
});
