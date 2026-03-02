/**
 * Component Variants
 * Layout and spacing styles independent of color themes
 */

export type ComponentVariant = 'compact' | 'modern' | 'default';

export const COMPONENT_VARIANTS: ComponentVariant[] = ['compact', 'modern', 'default'];

export interface VariantDefinition {
  id: ComponentVariant;
  label: string;
  description: string;
}

export const VARIANTS: VariantDefinition[] = [
  {
    id: 'default',
    label: 'Orchestra',
    description: 'Orchestra brand default styling with modern spacing and professional aesthetic',
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'Code-focused compact interface inspired by VS Code with tight spacing',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean launcher-style interface inspired by Raycast with smooth interactions',
  },
];

export function getVariantById(id: ComponentVariant): VariantDefinition | undefined {
  return VARIANTS.find((variant) => variant.id === id);
}

export function isValidVariant(value: string): value is ComponentVariant {
  return COMPONENT_VARIANTS.includes(value as ComponentVariant);
}
