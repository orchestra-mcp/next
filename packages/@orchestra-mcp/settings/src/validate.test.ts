import { validateSetting } from './validate';

describe('validateSetting', () => {
  it('returns null when no validation', () => {
    expect(validateSetting('test')).toBeNull();
  });

  it('validates required fields', () => {
    expect(validateSetting('', { required: true })).toBe('This field is required');
    expect(validateSetting(undefined, { required: true })).toBe('This field is required');
    expect(validateSetting(null, { required: true })).toBe('This field is required');
  });

  it('passes required when value present', () => {
    expect(validateSetting('hello', { required: true })).toBeNull();
  });

  it('validates string min length', () => {
    expect(validateSetting('ab', { min: 3 })).toBe('Must be at least 3 characters');
    expect(validateSetting('abc', { min: 3 })).toBeNull();
  });

  it('validates string max length', () => {
    expect(validateSetting('abcde', { max: 3 })).toBe('Must be at most 3 characters');
    expect(validateSetting('abc', { max: 3 })).toBeNull();
  });

  it('validates string pattern', () => {
    expect(validateSetting('abc', { pattern: '^[0-9]+$' })).toBe('Invalid format');
    expect(validateSetting('123', { pattern: '^[0-9]+$' })).toBeNull();
  });

  it('validates number min', () => {
    expect(validateSetting(2, { min: 5 })).toBe('Must be at least 5');
    expect(validateSetting(5, { min: 5 })).toBeNull();
  });

  it('validates number max', () => {
    expect(validateSetting(10, { max: 5 })).toBe('Must be at most 5');
    expect(validateSetting(3, { max: 5 })).toBeNull();
  });

  it('uses custom message', () => {
    expect(validateSetting('', { required: true, message: 'Please fill' })).toBe('Please fill');
  });
});
