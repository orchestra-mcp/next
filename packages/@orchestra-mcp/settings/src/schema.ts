export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'file' | 'json';

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  message?: string;
}

export interface SchemaField {
  key: string;
  type: SettingType;
  label: string;
  description?: string;
  defaultValue?: unknown;
  validation?: SettingValidation;
  group?: string;
}

export interface SettingsSchema {
  version: string;
  fields: SchemaField[];
}
