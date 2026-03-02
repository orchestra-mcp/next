import './Input.css';

export interface InputProps {
  /**
   * Input type variant
   */
  variant?: 'text' | 'password' | 'email' | 'number' | 'search';
  /**
   * Input size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Input label text
   */
  label?: string;
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Input value
   */
  value?: string;
  /**
   * Is input disabled?
   */
  disabled?: boolean;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below input
   */
  helperText?: string;
  /**
   * Optional change handler
   */
  onChange?: (value: string) => void;
  /**
   * Optional blur handler
   */
  onBlur?: () => void;
  /**
   * Optional focus handler
   */
  onFocus?: () => void;
}

export const Input = ({
  variant = 'text',
  size = 'medium',
  label,
  placeholder,
  value,
  disabled = false,
  error,
  helperText,
  onChange,
  onBlur,
  onFocus,
}: InputProps) => {
  // Generate unique ID for label association
  const inputId = label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  const inputClasses = [
    'input',
    `input--${size}`,
    error ? 'input--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={variant}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && (
        <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};
