import React, { useState, useMemo, useCallback } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { getAllProviders } from '../registry/SessionRegistry';
import type { DevSession } from '../types';
import './NewSessionPicker.css';

export interface NewSessionPickerProps {
  onClose: () => void;
  onCreate: (session: DevSession) => void;
  /** Active workspace path — injected into connectionConfig as work_dir/root_dir */
  workspace?: string;
}

export const NewSessionPicker: React.FC<NewSessionPickerProps> = ({
  onClose,
  onCreate,
  workspace,
}) => {
  const [search, setSearch] = useState('');
  const providers = getAllProviders();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [providers, search]);

  const handleSelect = useCallback(
    (provider: (typeof providers)[0]) => {
      const connectionConfig: Record<string, unknown> = {};
      if (workspace) {
        connectionConfig.work_dir = workspace;
        connectionConfig.root_dir = workspace;
      }

      const session: DevSession = {
        id: crypto.randomUUID(),
        name: provider.name,
        type: provider.type,
        icon: provider.icon,
        state: 'idle',
        connectionConfig,
        sortOrder: Date.now(),
        createdAt: new Date().toISOString(),
      };
      onCreate(session);
      onClose();
    },
    [onCreate, onClose, workspace],
  );

  return (
    <div className="new-session-picker__overlay" onClick={onClose}>
      <div
        className="new-session-picker"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="New session"
      >
        <div className="new-session-picker__header">
          <h3 className="new-session-picker__title">New Session</h3>
          <button
            type="button"
            className="new-session-picker__close"
            onClick={onClose}
            aria-label="Close"
          >
            <BoxIcon name="bx-x" size={18} />
          </button>
        </div>

        <div className="new-session-picker__search-wrap">
          <span className="new-session-picker__search-icon">
            <BoxIcon name="bx-search" size={16} />
          </span>
          <input
            type="text"
            className="new-session-picker__search"
            placeholder="Search session types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="new-session-picker__list">
          {filtered.length > 0 ? (
            filtered.map((provider) => (
              <button
                key={provider.type}
                type="button"
                className="new-session-picker__item"
                onClick={() => handleSelect(provider)}
              >
                <span className="new-session-picker__item-icon">
                  <BoxIcon name={provider.icon} size={20} />
                </span>
                <div className="new-session-picker__item-info">
                  <span className="new-session-picker__item-name">{provider.name}</span>
                  <span className="new-session-picker__item-desc">
                    {provider.description}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="new-session-picker__empty">
              <BoxIcon name="bx-search-alt" size={24} />
              <span>No session types match your search.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
