import type { FC } from 'react';
import './ChatThinkingToggle.css';

export interface ChatThinkingToggleProps {
  /** Whether thinking mode is enabled */
  enabled: boolean;
  /** Fires when the toggle is flipped */
  onChange: (enabled: boolean) => void;
  /** Label text next to the toggle */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

export const ChatThinkingToggle: FC<ChatThinkingToggleProps> = ({
  enabled,
  onChange,
  label = 'Thinking',
  className,
}) => {
  const handleClick = () => onChange(!enabled);

  return (
    <label
      className={`thinking-toggle${className ? ` ${className}` : ''}`}
      data-testid="thinking-toggle"
    >
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        className={`thinking-toggle__track${enabled ? ' thinking-toggle__track--on' : ''}`}
        onClick={handleClick}
        data-testid="thinking-toggle-track"
      >
        <span className="thinking-toggle__knob" />
      </button>
      <span className="thinking-toggle__label">{label}</span>
    </label>
  );
};
