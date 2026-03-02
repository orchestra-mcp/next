/**
 * Theme Switcher Utility
 * Manages both color themes and component variants independently
 */

import type { ComponentVariant } from './variants';
import { getThemeById, toCssVariables } from './themes';
import { isValidVariant } from './variants';

// Storage keys
const COLOR_THEME_STORAGE_KEY = 'orchestra-color-theme';
const VARIANT_STORAGE_KEY = 'orchestra-component-variant';

// Data attributes
const COLOR_THEME_ATTRIBUTE = 'data-color-theme';
const VARIANT_ATTRIBUTE = 'data-variant';

// Legacy support (old API used 'data-theme')
const LEGACY_THEME_ATTRIBUTE = 'data-theme';
const LEGACY_STORAGE_KEY = 'orchestra-theme';

// ── Color Theme Management ─────────────────────────────────

export function getColorTheme(): string {
  if (typeof document === 'undefined') {
    return 'orchestra';
  }

  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  const current = document.documentElement.getAttribute(COLOR_THEME_ATTRIBUTE);

  return stored || current || 'orchestra';
}

export function setColorTheme(themeId: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const theme = getThemeById(themeId);
  if (!theme) {
    console.warn(`[Theme] Unknown color theme: ${themeId}`);
    return;
  }

  // Set data attribute
  document.documentElement.setAttribute(COLOR_THEME_ATTRIBUTE, themeId);

  // Apply CSS variables directly to :root
  const cssVars = toCssVariables(theme);
  Object.entries(cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Persist to localStorage
  localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeId);

  // Emit custom event
  window.dispatchEvent(
    new CustomEvent('orchestra-color-theme-change', { detail: { theme: themeId } })
  );
}

export function onColorThemeChange(callback: (themeId: string) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ theme: string }>;
    callback(customEvent.detail.theme);
  };

  window.addEventListener('orchestra-color-theme-change', handler);

  return () => {
    window.removeEventListener('orchestra-color-theme-change', handler);
  };
}

// ── Component Variant Management ───────────────────────────

export function getComponentVariant(): ComponentVariant {
  if (typeof document === 'undefined') {
    return 'default';
  }

  const stored = localStorage.getItem(VARIANT_STORAGE_KEY) as ComponentVariant | null;
  const current = document.documentElement.getAttribute(VARIANT_ATTRIBUTE) as ComponentVariant | null;

  return stored || current || 'default';
}

export function setComponentVariant(variant: ComponentVariant): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (!isValidVariant(variant)) {
    console.warn(`[Theme] Invalid component variant: ${variant}`);
    return;
  }

  document.documentElement.setAttribute(VARIANT_ATTRIBUTE, variant);
  localStorage.setItem(VARIANT_STORAGE_KEY, variant);

  // Emit custom event
  window.dispatchEvent(
    new CustomEvent('orchestra-variant-change', { detail: { variant } })
  );
}

export function toggleComponentVariant(): ComponentVariant {
  const current = getComponentVariant();
  const variants: ComponentVariant[] = ['default', 'compact', 'modern'];
  const currentIndex = variants.indexOf(current);
  const nextVariant = variants[(currentIndex + 1) % variants.length];

  setComponentVariant(nextVariant);
  return nextVariant;
}

export function onVariantChange(callback: (variant: ComponentVariant) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ variant: ComponentVariant }>;
    callback(customEvent.detail.variant);
  };

  window.addEventListener('orchestra-variant-change', handler);

  return () => {
    window.removeEventListener('orchestra-variant-change', handler);
  };
}

// ── Initialization ─────────────────────────────────────────

export function initTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Migrate legacy theme setting if present
  migrateLegacyTheme();

  // Initialize color theme
  const storedColorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  if (storedColorTheme) {
    setColorTheme(storedColorTheme);
  }

  // Initialize component variant
  const storedVariant = localStorage.getItem(VARIANT_STORAGE_KEY) as ComponentVariant | null;
  if (storedVariant && isValidVariant(storedVariant)) {
    setComponentVariant(storedVariant);
  }
}

function migrateLegacyTheme(): void {
  const legacyTheme = localStorage.getItem(LEGACY_STORAGE_KEY);
  const legacyAttr = document.documentElement.getAttribute(LEGACY_THEME_ATTRIBUTE);

  if (legacyTheme || legacyAttr) {
    const value = legacyTheme || legacyAttr;

    // Old API: compact/modern/default were treated as "themes"
    // Now: they are component variants
    if (value && isValidVariant(value)) {
      setComponentVariant(value);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      document.documentElement.removeAttribute(LEGACY_THEME_ATTRIBUTE);
    }
  }
}

// ── Legacy API (Backward Compatibility) ────────────────────

/**
 * @deprecated Use getComponentVariant() instead
 */
export function getTheme(): ComponentVariant {
  return getComponentVariant();
}

/**
 * @deprecated Use setComponentVariant() instead
 */
export function setTheme(variant: ComponentVariant): void {
  setComponentVariant(variant);
}

/**
 * @deprecated Use toggleComponentVariant() instead
 */
export function toggleTheme(): ComponentVariant {
  return toggleComponentVariant();
}

/**
 * @deprecated Use onVariantChange() instead
 */
export function onThemeChange(callback: (variant: ComponentVariant) => void): () => void {
  return onVariantChange(callback);
}

export type { ComponentVariant };
export type ThemeVariant = ComponentVariant; // Legacy type alias
