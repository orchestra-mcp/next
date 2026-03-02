"use client";

import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import type { AIModel } from '../types/models';
import './ChatModelSelector.css';

export interface ChatModelSelectorProps {
  /** Available models */
  models: AIModel[];
  /** Currently selected model ID */
  selectedModelId: string;
  /** Fires when a model is selected */
  onChange: (modelId: string) => void;
  /** Disable the selector */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const ChatModelSelector: FC<ChatModelSelectorProps> = ({
  models,
  selectedModelId,
  onChange,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = models.find((m) => m.id === selectedModelId);

  /* Group models by provider */
  const grouped = models.reduce<Record<string, AIModel[]>>((acc, model) => {
    const key = model.provider;
    if (!acc[key]) acc[key] = [];
    acc[key].push(model);
    return acc;
  }, {});

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`model-sel${className ? ` ${className}` : ''}`}
      data-testid="model-selector"
    >
      <button
        type="button"
        className="model-sel__trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="model-sel__trigger-label">
          {selected?.name ?? 'Select model'}
        </span>
        <span className="model-sel__chevron" aria-hidden="true">&#9662;</span>
      </button>

      {open && (
        <div className="model-sel__dropdown" role="listbox" data-testid="model-dropdown">
          {Object.entries(grouped).map(([provider, items]) => (
            <div key={provider} className="model-sel__group">
              <div className="model-sel__group-label">{provider}</div>
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={m.id === selectedModelId}
                  className={`model-sel__option${m.id === selectedModelId ? ' model-sel__option--active' : ''}`}
                  onClick={() => handleSelect(m.id)}
                  data-testid={`model-option-${m.id}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
