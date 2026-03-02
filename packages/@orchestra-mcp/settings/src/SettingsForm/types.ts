/**
 * Settings type definitions matching Go backend structure.
 * Used by SettingsForm to auto-generate form inputs.
 */
import type { ReactNode } from 'react';

export type SettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'color'
  | 'range'
  | 'date'
  | 'timezone'
  | 'key-value'
  | 'repeater'
  | 'code'
  | 'markdown';

export type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>
  | RepeaterRow[];

export interface RepeaterRow {
  id: string;
  [key: string]: string;
}

export interface SettingOption {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface Setting {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: SettingType;
  default: SettingValue;
  value?: SettingValue;
  group: string;
  order: number;
  options?: SettingOption[];
  validation?: SettingValidation;
  disabled?: boolean;
  hidden?: boolean;
  plugin_id: string;
  /** Column definitions for repeater fields */
  repeaterColumns?: { key: string; label: string; placeholder?: string }[];
}

export interface SettingGroup {
  id: string;
  label: string;
  description?: string;
  order: number;
  icon?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface SettingsState {
  groups: SettingGroup[];
  settings: Setting[];
}
