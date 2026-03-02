import type { SettingValidation } from './schema';

export function validateSetting(value: unknown, validation?: SettingValidation): string | null {
  if (!validation) return null;

  if (validation.required && (value === undefined || value === null || value === '')) {
    return validation.message ?? 'This field is required';
  }

  if (typeof value === 'string') {
    if (validation.min !== undefined && value.length < validation.min) {
      return validation.message ?? `Must be at least ${validation.min} characters`;
    }
    if (validation.max !== undefined && value.length > validation.max) {
      return validation.message ?? `Must be at most ${validation.max} characters`;
    }
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return validation.message ?? 'Invalid format';
    }
  }

  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return validation.message ?? `Must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return validation.message ?? `Must be at most ${validation.max}`;
    }
  }

  return null;
}
