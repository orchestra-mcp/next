import './Select.css';

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option display label */
  label: string;
  /** Is option disabled? */
  disabled?: boolean;
}

export interface SelectProps {
  /** List of options to display */
  options: SelectOption[];
  /** Currently selected value */
  value?: string;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Is select disabled? */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Change handler receiving selected value */
  onChange?: (value: string) => void;
  /** Additional CSS class names */
  className?: string;
}

export const Select = ({
  options,
  value,
  placeholder,
  disabled = false,
  error,
  onChange,
  className,
}: SelectProps) => {
  const wrapperClasses = [
    'select',
    disabled ? 'select--disabled' : '',
    error ? 'select--error' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <select
        className="select__native"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="select__chevron" aria-hidden="true" />
      {error && <span className="select__error">{error}</span>}
    </div>
  );
};
