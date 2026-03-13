import { useState, useCallback, useRef, useEffect } from 'react';
import type { Setting, SettingValue, RepeaterRow } from './types';
import { TIMEZONE_OPTIONS } from './timezones';

export interface SettingFieldProps {
  setting: Setting;
  value: SettingValue;
  onChange: (key: string, value: SettingValue) => void;
  disabled?: boolean;
}

export const SettingField = ({
  setting,
  value,
  onChange,
  disabled,
}: SettingFieldProps) => {
  const isDisabled = disabled || setting.disabled;

  const handleChange = useCallback(
    (newValue: SettingValue) => {
      onChange(setting.key, newValue);
    },
    [onChange, setting.key],
  );

  if (setting.hidden) {
    return null;
  }

  // Boolean renders its own inline label layout
  if (setting.type === 'boolean') {
    return (
      <BooleanField
        setting={setting}
        value={value as boolean}
        onChange={handleChange}
        disabled={isDisabled}
      />
    );
  }

  return (
    <div className="setting-field">
      <label className="setting-field__label">
        {setting.label}
        {setting.validation?.required && (
          <span className="setting-field__required">*</span>
        )}
      </label>
      <FieldInput
        setting={setting}
        value={value}
        onChange={handleChange}
        disabled={isDisabled}
      />
      {setting.description && (
        <p className="setting-field__description">{setting.description}</p>
      )}
    </div>
  );
};

/* ── Field Input Renderer ───────────────────────── */

interface FieldInputProps {
  setting: Setting;
  value: SettingValue;
  onChange: (value: SettingValue) => void;
  disabled?: boolean;
}

const FieldInput = ({ setting, value, onChange, disabled }: FieldInputProps) => {
  switch (setting.type) {
    case 'string':
      return (
        <StringField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'number':
      return (
        <NumberField
          setting={setting}
          value={value as number}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'select':
      return (
        <SelectField
          setting={setting}
          value={value as string | number}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'multi-select':
      return (
        <MultiSelectField
          setting={setting}
          value={value as string[]}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'color':
      return (
        <ColorField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'range':
      return (
        <RangeField
          setting={setting}
          value={value as number}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'date':
      return (
        <DateField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'timezone':
      return (
        <TimezoneField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'key-value':
      return (
        <KeyValueField
          setting={setting}
          value={value as Record<string, string>}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'repeater':
      return (
        <RepeaterField
          setting={setting}
          value={value as RepeaterRow[]}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'code':
      return (
        <CodeField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'markdown':
      return (
        <MarkdownSettingField
          setting={setting}
          value={value as string}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};

/* ── String ─────────────────────────────────────── */

interface StringFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const StringField = ({ setting, value, onChange, disabled }: StringFieldProps) => (
  <input
    type="text"
    className="setting-field__input"
    value={value ?? ''}
    placeholder={setting.placeholder}
    disabled={disabled}
    minLength={setting.validation?.minLength}
    maxLength={setting.validation?.maxLength}
    pattern={setting.validation?.pattern}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ── Number ─────────────────────────────────────── */

interface NumberFieldProps {
  setting: Setting;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const NumberField = ({ setting, value, onChange, disabled }: NumberFieldProps) => (
  <input
    type="number"
    className="setting-field__input"
    value={value ?? ''}
    placeholder={setting.placeholder}
    disabled={disabled}
    min={setting.validation?.min}
    max={setting.validation?.max}
    step={setting.validation?.step}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

/* ── Boolean Toggle ─────────────────────────────── */

interface BooleanFieldProps {
  setting: Setting;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const BooleanField = ({ setting, value, onChange, disabled }: BooleanFieldProps) => {
  const isOn = Boolean(value);
  return (
    <div className="setting-field">
      <div className="setting-field__toggle-row">
        <div className="setting-field__toggle-text">
          <span className="setting-field__toggle-label">
            {setting.label}
            {setting.validation?.required && (
              <span className="setting-field__required">*</span>
            )}
          </span>
          {setting.description && (
            <p className="setting-field__toggle-desc">{setting.description}</p>
          )}
        </div>
        <button
          type="button"
          className={`setting-field__toggle ${isOn ? 'setting-field__toggle--on' : 'setting-field__toggle--off'}`}
          disabled={disabled}
          onClick={() => onChange(!isOn)}
          aria-label={`Toggle ${setting.label}`}
        >
          <span
            className={`setting-field__toggle-knob ${isOn ? 'setting-field__toggle-knob--on' : 'setting-field__toggle-knob--off'}`}
          />
        </button>
      </div>
    </div>
  );
};

/* ── Select (Searchable Dropdown) ──────────────── */

interface SelectFieldProps {
  setting: Setting;
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

const SelectField = ({ setting, value, onChange, disabled }: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = setting.options ?? [];
  const selected = options.find((o) => String(o.value) === String(value));
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  return (
    <div className="setting-field__select-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`setting-field__select-trigger ${open ? 'setting-field__select-trigger--open' : ''}`}
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'setting-field__select-placeholder'}>
          {selected?.label || setting.placeholder || 'Select...'}
        </span>
        <SelectChevron />
      </button>

      {open && (
        <div className="setting-field__select-dropdown" role="listbox" onKeyDown={handleKeyDown}>
          <div className="setting-field__select-search-box">
            <input
              ref={inputRef}
              type="text"
              className="setting-field__select-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="setting-field__select-options">
            {filtered.length === 0 && (
              <div className="setting-field__select-empty">No results</div>
            )}
            {filtered.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                className={`setting-field__select-option ${String(opt.value) === String(value) ? 'setting-field__select-option--active' : ''}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={String(opt.value) === String(value)}
              >
                {opt.label}
                {opt.description && (
                  <span className="setting-field__select-option-desc">{opt.description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectChevron = () => (
  <svg className="setting-field__select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* ── Multi-Select ───────────────────────────────── */

interface MultiSelectFieldProps {
  setting: Setting;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const MultiSelectField = ({
  setting,
  value,
  onChange,
  disabled,
}: MultiSelectFieldProps) => {
  const selected = value ?? [];

  const toggle = (optValue: string) => {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next);
  };

  return (
    <div className="setting-field__checkbox-group">
      {setting.options?.map((opt) => {
        const optStr = String(opt.value);
        return (
          <label
            key={optStr}
            className={`setting-field__checkbox-card${disabled ? ' setting-field__checkbox-card--disabled' : ''}${selected.includes(optStr) ? ' setting-field__checkbox-card--checked' : ''}`}
          >
            <input
              type="checkbox"
              className="setting-field__checkbox"
              checked={selected.includes(optStr)}
              disabled={disabled}
              onChange={() => toggle(optStr)}
            />
            {opt.icon && (
              <span className="setting-field__checkbox-icon">{opt.icon}</span>
            )}
            <span className="setting-field__checkbox-text">
              <span className="setting-field__checkbox-title">{opt.label}</span>
              {opt.description && (
                <span className="setting-field__checkbox-desc">{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
};

/* ── Color ──────────────────────────────────────── */

interface ColorFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ColorField = ({ setting, value, onChange, disabled }: ColorFieldProps) => {
  const swatches = setting.options ?? [];
  const isGradient = (v: string) => v.includes('gradient') || v.includes(',');

  return (
    <div className="setting-field__color-wrapper">
      <div className="setting-field__color-row">
        <input
          type="color"
          className="setting-field__color-picker"
          value={isGradient(value || '') ? '#000000' : (value || '#000000')}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className="setting-field__input setting-field__color-text"
          value={value ?? ''}
          placeholder={setting.placeholder || '#000000'}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {swatches.length > 0 && (
        <div className="setting-field__color-swatches">
          {swatches.map((swatch) => {
            const swatchVal = String(swatch.value);
            const active = swatchVal === value;
            const gradient = isGradient(swatchVal);
            return (
              <button
                key={swatchVal}
                type="button"
                className={`setting-field__color-swatch${active ? ' setting-field__color-swatch--active' : ''}`}
                style={{
                  background: gradient ? swatchVal : swatchVal,
                }}
                disabled={disabled}
                onClick={() => onChange(swatchVal)}
                aria-label={swatch.label}
                title={swatch.label}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Range ──────────────────────────────────────── */

interface RangeFieldProps {
  setting: Setting;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const RangeField = ({ setting, value, onChange, disabled }: RangeFieldProps) => (
  <div className="setting-field__range-row">
    <input
      type="range"
      className="setting-field__range"
      value={value ?? setting.validation?.min ?? 0}
      min={setting.validation?.min ?? 0}
      max={setting.validation?.max ?? 100}
      step={setting.validation?.step ?? 1}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className="setting-field__range-value">
      {value ?? setting.validation?.min ?? 0}
    </span>
  </div>
);

/* ── Date Picker ───────────────────────────────── */

interface DateFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const DateField = ({ setting, value, onChange, disabled }: DateFieldProps) => (
  <input
    type="date"
    className="setting-field__input setting-field__date"
    value={value ?? ''}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ── Timezone Select (Searchable) ──────────────── */

interface TimezoneFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TimezoneField = ({ setting, value, onChange, disabled }: TimezoneFieldProps) => {
  const tzSetting: Setting = {
    ...setting,
    type: 'select',
    options: TIMEZONE_OPTIONS,
    placeholder: setting.placeholder || 'Select timezone...',
  };
  return (
    <SelectField
      setting={tzSetting}
      value={value}
      onChange={(v) => onChange(String(v))}
      disabled={disabled}
    />
  );
};

/* ── Key-Value Pairs ───────────────────────────── */

interface KeyValueFieldProps {
  setting: Setting;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled?: boolean;
}

const KeyValueField = ({ setting, value, onChange, disabled }: KeyValueFieldProps) => {
  const pairs = value ?? {};
  const entries = Object.entries(pairs);

  const updateKey = (oldKey: string, newKey: string) => {
    const next: Record<string, string> = {};
    for (const [k, v] of entries) {
      next[k === oldKey ? newKey : k] = v;
    }
    onChange(next);
  };

  const updateValue = (key: string, newVal: string) => {
    onChange({ ...pairs, [key]: newVal });
  };

  const addPair = () => {
    onChange({ ...pairs, '': '' });
  };

  const removePair = (key: string) => {
    const next = { ...pairs };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="setting-field__kv">
      {entries.map(([k, v], i) => (
        <div key={i} className="setting-field__kv-row">
          <input
            type="text"
            className="setting-field__input setting-field__kv-key"
            value={k}
            placeholder="Key"
            disabled={disabled}
            onChange={(e) => updateKey(k, e.target.value)}
          />
          <input
            type="text"
            className="setting-field__input setting-field__kv-value"
            value={v}
            placeholder="Value"
            disabled={disabled}
            onChange={(e) => updateValue(k, e.target.value)}
          />
          <button
            type="button"
            className="setting-field__kv-remove"
            disabled={disabled}
            onClick={() => removePair(k)}
            aria-label="Remove pair"
          >
            <RemoveIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="setting-field__kv-add"
        disabled={disabled}
        onClick={addPair}
      >
        <AddIcon /> Add pair
      </button>
    </div>
  );
};

/* ── Repeater ──────────────────────────────────── */

interface RepeaterFieldProps {
  setting: Setting;
  value: RepeaterRow[];
  onChange: (value: RepeaterRow[]) => void;
  disabled?: boolean;
}

const RepeaterField = ({ setting, value, onChange, disabled }: RepeaterFieldProps) => {
  const rows = value ?? [];
  const columns = setting.repeaterColumns ?? [{ key: 'value', label: 'Value' }];

  const addRow = () => {
    const newRow: RepeaterRow = { id: crypto.randomUUID() };
    for (const col of columns) newRow[col.key] = '';
    onChange([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateCell = (id: string, colKey: string, val: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [colKey]: val } : r)));
  };

  return (
    <div className="setting-field__repeater">
      {columns.length > 1 && (
        <div className="setting-field__repeater-header">
          {columns.map((col) => (
            <span key={col.key} className="setting-field__repeater-col-label">
              {col.label}
            </span>
          ))}
          <span className="setting-field__repeater-col-action" />
        </div>
      )}
      {rows.map((row) => (
        <div key={row.id} className="setting-field__repeater-row">
          {columns.map((col) => (
            <input
              key={col.key}
              type="text"
              className="setting-field__input setting-field__repeater-cell"
              value={row[col.key] ?? ''}
              placeholder={col.placeholder || col.label}
              disabled={disabled}
              onChange={(e) => updateCell(row.id, col.key, e.target.value)}
            />
          ))}
          <button
            type="button"
            className="setting-field__repeater-remove"
            disabled={disabled}
            onClick={() => removeRow(row.id)}
            aria-label="Remove row"
          >
            <RemoveIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="setting-field__repeater-add"
        disabled={disabled}
        onClick={addRow}
      >
        <AddIcon /> Add row
      </button>
    </div>
  );
};

/* ── Code Input ────────────────────────────────── */

interface CodeFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CodeField = ({ setting, value, onChange, disabled }: CodeFieldProps) => (
  <textarea
    className="setting-field__input setting-field__code"
    value={value ?? ''}
    placeholder={setting.placeholder}
    disabled={disabled}
    rows={8}
    spellCheck={false}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ── Markdown Input ────────────────────────────── */

interface MarkdownSettingFieldProps {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MarkdownSettingField = ({ setting, value, onChange, disabled }: MarkdownSettingFieldProps) => {
  // Use a plain textarea for markdown settings. The @orchestra-mcp/editor
  // MarkdownEditor is not a declared dependency of this package and importing
  // it via require() causes build-time "Module not found" errors in Next.js.
  return (
    <textarea
      className="setting-field__input setting-field__code"
      value={value ?? ''}
      placeholder={setting.placeholder || 'Write markdown...'}
      disabled={disabled}
      rows={8}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

/* ── Shared Icons ──────────────────────────────── */

const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const RemoveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
