"use client";

import { useCallback, useId } from 'react';
import './Switch.css';

export interface SwitchProps {
  /**
   * Whether the switch is on
   */
  checked?: boolean;
  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;
  /**
   * Label text displayed next to the switch
   */
  label?: string;
  /**
   * Switch size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Called when the switch is toggled
   */
  onChange?: (checked: boolean) => void;
  /**
   * Additional CSS class name
   */
  className?: string;
}

export const Switch = ({
  checked = false,
  disabled = false,
  label,
  size = 'medium',
  onChange,
  className,
}: SwitchProps) => {
  const id = useId();

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onChange?.(!checked);
    }
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  const classes = [
    'switch',
    `switch--${size}`,
    checked && 'switch--checked',
    disabled && 'switch--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? id : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className="switch__track"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
      >
        <div className="switch__thumb" />
      </div>
      {label && (
        <label id={id} className="switch__label" onClick={handleToggle}>
          {label}
        </label>
      )}
    </div>
  );
};
