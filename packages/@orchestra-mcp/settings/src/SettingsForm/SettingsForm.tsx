import { useMemo } from 'react';
import './SettingsForm.css';
import type { SettingsState, SettingValue } from './types';
import { SettingsGroup } from './SettingsGroup';

export interface SettingsFormProps {
  state: SettingsState;
  values: Record<string, SettingValue>;
  onChange: (key: string, value: SettingValue) => void;
  /** Filter settings by group ID. Show all groups if not set. */
  activeGroup?: string;
  disabled?: boolean;
  className?: string;
  /** Custom empty state content */
  emptyState?: React.ReactNode;
}

export const SettingsForm = ({
  state,
  values,
  onChange,
  activeGroup,
  disabled,
  className,
  emptyState,
}: SettingsFormProps) => {
  const visibleGroups = useMemo(() => {
    const sorted = [...state.groups].sort((a, b) => a.order - b.order);
    if (activeGroup) {
      return sorted.filter((g) => g.id === activeGroup);
    }
    return sorted;
  }, [state.groups, activeGroup]);

  const settingsByGroup = useMemo(() => {
    const map: Record<string, typeof state.settings> = {};
    for (const setting of state.settings) {
      if (setting.hidden) continue;
      if (!map[setting.group]) {
        map[setting.group] = [];
      }
      map[setting.group].push(setting);
    }
    return map;
  }, [state.settings]);

  const formClasses = ['settings-form', className].filter(Boolean).join(' ');

  const hasVisibleSettings = visibleGroups.some(
    (g) => settingsByGroup[g.id] && settingsByGroup[g.id].length > 0,
  );

  if (!hasVisibleSettings) {
    return (
      <div className={formClasses}>
        {emptyState ?? (
          <div className="settings-form__empty">
            <svg className="settings-form__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p className="settings-form__empty-title">No settings available</p>
            <p className="settings-form__empty-desc">There are no configurable settings for this section.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={formClasses}>
      {visibleGroups.map((group) => {
        const groupSettings = settingsByGroup[group.id];
        if (!groupSettings || groupSettings.length === 0) return null;
        return (
          <SettingsGroup
            key={group.id}
            group={group}
            settings={groupSettings}
            values={values}
            onChange={onChange}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
