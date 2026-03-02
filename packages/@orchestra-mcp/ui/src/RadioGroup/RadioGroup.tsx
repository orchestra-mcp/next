import './RadioGroup.css';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  name?: string;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup = ({
  options,
  value,
  name = 'radio-group',
  direction = 'vertical',
  disabled = false,
  error,
  onChange,
  className,
}: RadioGroupProps) => {
  return (
    <div
      className={`radio-group radio-group--${direction}${className ? ` ${className}` : ''}`}
      role="radiogroup"
    >
      {options.map((option) => {
        const isDisabled = disabled || option.disabled;
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            className={`radio-group__option${isDisabled ? ' radio-group__option--disabled' : ''}${isSelected ? ' radio-group__option--selected' : ''}`}
          >
            <input
              type="radio"
              className="radio-group__input"
              name={name}
              value={option.value}
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => { if (!isDisabled) onChange?.(option.value); }}
            />
            <span className="radio-group__circle" />
            <span className="radio-group__text">
              <span className="radio-group__label">{option.label}</span>
              {option.description && (
                <span className="radio-group__description">{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
      {error && <span className="radio-group__error">{error}</span>}
    </div>
  );
};
