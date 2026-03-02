"use client";

import { ReactNode, useState } from 'react';
import './Tabs.css';

export interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Optional icon */
  icon?: ReactNode;
}

export interface TabsProps {
  /** Array of tabs */
  tabs: Tab[];
  /** Default active tab ID */
  defaultActiveId?: string;
  /** Controlled active tab ID */
  activeId?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Custom className */
  className?: string;
  /** Orientation of tabs */
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs = ({
  tabs,
  defaultActiveId,
  activeId: controlledActiveId,
  onTabChange,
  className = '',
  orientation = 'horizontal',
}: TabsProps) => {
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId || tabs[0]?.id
  );

  const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.disabled) return;

    if (controlledActiveId === undefined) {
      setInternalActiveId(tabId);
    }

    onTabChange?.(tabId);
  };

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={`tabs tabs--${orientation} ${className}`}>
      <div className="tabs-list" role="tablist" aria-orientation={orientation}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            aria-disabled={tab.disabled}
            className={`tab ${tab.id === activeId ? 'tab--active' : ''} ${
              tab.disabled ? 'tab--disabled' : ''
            }`}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  );
};
