import { useState, useCallback, useRef } from 'react';
import { mcpCall } from '../mcp/client';
import './LabelsSection.css';

export interface LabelsSectionProps {
  labels: string[];
  project: string;
  epicId: string;
  storyId: string;
  taskId: string;
  onUpdate?: () => void;
}

export function LabelsSection({ labels, project, epicId, storyId, taskId, onUpdate }: LabelsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [removingLabel, setRemovingLabel] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const removeLabel = useCallback(async (label: string) => {
    setRemovingLabel(label);
    try {
      await mcpCall('remove_labels', {
        project,
        epic_id: epicId,
        story_id: storyId,
        task_id: taskId,
        labels: [label],
      });
      onUpdate?.();
    } catch { /* silently fail, next refresh will restore */ }
    setRemovingLabel(null);
  }, [project, epicId, storyId, taskId, onUpdate]);

  const addLabel = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    try {
      await mcpCall('add_labels', {
        project,
        epic_id: epicId,
        story_id: storyId,
        task_id: taskId,
        labels: [trimmed],
      });
      onUpdate?.();
    } catch { /* silently fail */ }
    setAdding(false);
  }, [project, epicId, storyId, taskId, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setAdding(false);
    }
  }, [addLabel]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim();
    if (value) {
      addLabel(value);
    } else {
      setAdding(false);
    }
  }, [addLabel]);

  const handleAddClick = useCallback(() => {
    setAdding(true);
    // Focus input on next tick after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  return (
    <section className="labels-section">
      <h3 className="task-detail__section-title">Labels</h3>
      <div className="labels-section__list">
        {labels.length === 0 && !adding && (
          <span className="labels-section__empty">
            No labels
            <button
              className="labels-section__add"
              onClick={handleAddClick}
              aria-label="Add label"
            >
              +
            </button>
          </span>
        )}
        {labels.map((label) => (
          <span
            key={label}
            className={`labels-section__pill${removingLabel === label ? ' labels-section__pill--removing' : ''}`}
          >
            {label}
            <button
              className="labels-section__remove"
              onClick={() => removeLabel(label)}
              aria-label={`Remove ${label}`}
            >
              ×
            </button>
          </span>
        ))}
        {labels.length > 0 && !adding && (
          <button
            className="labels-section__add"
            onClick={handleAddClick}
            aria-label="Add label"
          >
            +
          </button>
        )}
        {adding && (
          <input
            ref={inputRef}
            className="labels-section__input"
            type="text"
            placeholder="Label..."
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
          />
        )}
      </div>
    </section>
  );
}
