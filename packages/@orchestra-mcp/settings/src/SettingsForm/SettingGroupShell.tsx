import type { ReactNode } from 'react';
import type { SettingGroup } from './types';

export interface SettingGroupShellProps {
  group: SettingGroup;
  children: ReactNode;
}

export const SettingGroupShell = ({ group, children }: SettingGroupShellProps) => {
  return (
    <div className="settings-group">
      <div className="settings-group__header">
        {group.icon && <span className="settings-group__icon">{group.icon}</span>}
        <div className="settings-group__header-text">
          <h3 className="settings-group__title">{group.label}</h3>
          {group.description && (
            <p className="settings-group__description">{group.description}</p>
          )}
        </div>
      </div>
      <div className="settings-group__body">
        {children}
      </div>
    </div>
  );
};
