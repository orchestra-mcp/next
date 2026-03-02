"use client";

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import './PINInput.css';

export interface PINInputProps {
  /** Number of PIN digits */
  length?: 4 | 6 | 8;
  /** Show dots instead of digits */
  masked?: boolean;
  /** Show error styling */
  error?: boolean;
  /** Error message displayed below inputs */
  errorMessage?: string;
  /** Fires when all digits are entered */
  onComplete?: (pin: string) => void;
  /** Fires on every value change */
  onChange?: (value: string) => void;
  /** Disable all inputs */
  disabled?: boolean;
  /** Auto-focus first input on mount */
  autoFocus?: boolean;
}

export const PINInput = ({
  length = 4,
  masked = false,
  error = false,
  errorMessage,
  onComplete,
  onChange,
  disabled = false,
  autoFocus = true,
}: PINInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const getPin = useCallback(() => {
    return inputsRef.current.slice(0, length).map((el) => el?.value ?? '').join('');
  }, [length]);

  const isFilled = useCallback(() => {
    return inputsRef.current.slice(0, length).every((el) => el?.value);
  }, [length]);

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus();
  }, []);

  const handleInput = useCallback(
    (index: number, digit: string) => {
      const input = inputsRef.current[index];
      if (!input) return;

      // Only allow single digit
      const cleaned = digit.replace(/\D/g, '').slice(0, 1);
      input.value = cleaned;

      const pin = getPin();
      onChange?.(pin);

      if (cleaned && index < length - 1) {
        focusInput(index + 1);
      }

      if (isFilled()) {
        onComplete?.(pin);
      }
    },
    [length, onChange, onComplete, getPin, isFilled, focusInput],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const input = inputsRef.current[index];
        if (input && input.value) {
          input.value = '';
          onChange?.(getPin());
        } else if (index > 0) {
          const prev = inputsRef.current[index - 1];
          if (prev) {
            prev.value = '';
            prev.focus();
            onChange?.(getPin());
          }
        }
        e.preventDefault();
      }
    },
    [onChange, getPin],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

      pasted.split('').forEach((digit, i) => {
        const input = inputsRef.current[i];
        if (input) input.value = digit;
      });

      const pin = getPin();
      onChange?.(pin);

      if (isFilled()) {
        onComplete?.(pin);
        focusInput(length - 1);
      } else {
        focusInput(pasted.length);
      }
    },
    [length, onChange, onComplete, getPin, isFilled, focusInput],
  );

  const boxClass = ['pin-input__box', error ? 'pin-input__box--error' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="pin-input" role="group" aria-label="PIN input">
      <div className="pin-input__boxes">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            className={boxClass}
            type={masked ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={1}
            pattern="[0-9]"
            aria-label={`Digit ${i + 1}`}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            onInput={(e) => handleInput(i, (e.target as HTMLInputElement).value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      {error && errorMessage && (
        <span className="pin-input__error">{errorMessage}</span>
      )}
    </div>
  );
};
