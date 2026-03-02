import type { FC } from 'react';
import type { ChatMode } from '../types/models';
import { CHAT_MODES } from '../types/models';
import './ChatModeSelector.css';

export interface ChatModeSelectorProps {
  /** Currently active mode */
  mode: ChatMode;
  /** Fires when a mode segment is clicked */
  onChange: (mode: ChatMode) => void;
  /** Disable all segments */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const ChatModeSelector: FC<ChatModeSelectorProps> = ({
  mode,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <div
      className={`mode-sel${className ? ` ${className}` : ''}`}
      role="radiogroup"
      aria-label="Chat mode"
      data-testid="mode-selector"
    >
      {CHAT_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={m.id === mode}
          className={`mode-sel__segment${m.id === mode ? ' mode-sel__segment--active' : ''}`}
          onClick={() => onChange(m.id)}
          disabled={disabled}
          title={m.description}
          data-testid={`mode-${m.id}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
};
