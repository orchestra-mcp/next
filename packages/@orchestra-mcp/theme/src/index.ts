/**
 * @orchestra-mcp/theme
 *
 * Two independent systems:
 * 1. Color Themes (26 themes) - Set via setColorTheme(id)
 * 2. Component Variants (3 variants) - Set via setComponentVariant(variant)
 *
 * Built on Tailwind CSS v4 Oxide engine with CSS custom properties
 */

// ── Color Themes ───────────────────────────────────────────
export type {
  Theme,
  ThemeColors,
  SyntaxColors,
  ThemeSource,
  ThemeAuthor,
} from './themes';

export {
  THEMES,
  THEME_GROUPS,
  getThemeById,
  getThemesByGroup,
  toCssVariables,
} from './themes';

// ── Component Variants ─────────────────────────────────────
export type {
  ComponentVariant,
  VariantDefinition,
} from './variants';

export {
  VARIANTS,
  COMPONENT_VARIANTS,
  getVariantById,
  isValidVariant,
} from './variants';

// ── ThemePicker Component ─────────────────────────────
export { ThemePicker } from './ThemePicker';
export type { ThemePickerProps } from './ThemePicker';

// ── Theme Management ───────────────────────────────────────
export {
  // Color theme API
  getColorTheme,
  setColorTheme,
  onColorThemeChange,

  // Component variant API
  getComponentVariant,
  setComponentVariant,
  toggleComponentVariant,
  onVariantChange,

  // Initialization
  initTheme,

  // Legacy API (deprecated)
  getTheme,
  setTheme,
  toggleTheme,
  onThemeChange,

  // Legacy types
  type ThemeVariant,
} from './theme-switcher';

/**
 * Usage:
 *
 * 1. Import base styles in your app entry:
 *    import '@orchestra-mcp/theme/styles';
 *
 * 2. Initialize theme on app load:
 *    import { initTheme } from '@orchestra-mcp/theme';
 *    initTheme();
 *
 * 3. Set color theme:
 *    import { setColorTheme } from '@orchestra-mcp/theme';
 *    setColorTheme('dracula');
 *
 * 4. Set component variant:
 *    import { setComponentVariant } from '@orchestra-mcp/theme';
 *    setComponentVariant('compact');
 *
 * 5. Listen to changes:
 *    import { onColorThemeChange, onVariantChange } from '@orchestra-mcp/theme';
 *    onColorThemeChange((theme) => console.log('Color theme:', theme));
 *    onVariantChange((variant) => console.log('Variant:', variant));
 *
 * 6. Get all available themes:
 *    import { THEMES, THEME_GROUPS } from '@orchestra-mcp/theme';
 *    console.log('All themes:', THEMES);
 *    console.log('Groups:', THEME_GROUPS);
 */
