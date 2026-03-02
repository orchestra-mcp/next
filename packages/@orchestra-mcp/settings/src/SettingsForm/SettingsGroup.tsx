import { useState, useMemo } from 'react';
import type { Setting, SettingGroup as SettingGroupType, SettingValue } from './types';
import { SettingField } from './SettingField';

export interface SettingsGroupProps {
  group: SettingGroupType;
  settings: Setting[];
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
  disabled?: boolean;
}

export const SettingsGroup = ({
  group,
  settings,
  values,
  onChange,
  disabled,
}: SettingsGroupProps) => {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  const sortedSettings = useMemo(
    () => [...settings].sort((a, b) => a.order - b.order),
    [settings],
  );

  const groupClasses = [
    'settings-group',
    collapsed ? 'settings-group--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headerClasses = [
    'settings-group__header',
    group.collapsible ? 'settings-group__header--collapsible' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleHeaderClick = () => {
    if (group.collapsible) {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={groupClasses}>
      <div
        className={headerClasses}
        onClick={handleHeaderClick}
        role={group.collapsible ? 'button' : undefined}
        tabIndex={group.collapsible ? 0 : undefined}
        onKeyDown={
          group.collapsible
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleHeaderClick();
                }
              }
            : undefined
        }
      >
        {group.icon && <span className="settings-group__icon">{group.icon}</span>}
        <div className="settings-group__header-text">
          <h3 className="settings-group__title">{group.label}</h3>
          {group.description && (
            <p className="settings-group__description">{group.description}</p>
          )}
        </div>
        {group.collapsible && (
          <ChevronIcon collapsed={collapsed} />
        )}
      </div>

      <div className="settings-group__body">
        {sortedSettings.map((setting) => (
          <SettingField
            key={setting.key}
            setting={setting}
            value={values[setting.key] ?? setting.default}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Chevron Icon ───────────────────────────────── */

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`settings-group__chevron ${collapsed ? 'settings-group__chevron--collapsed' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
