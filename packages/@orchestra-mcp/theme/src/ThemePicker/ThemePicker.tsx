'use client';

import React, { useState, useEffect } from 'react';
import type { Theme, ThemeColors } from '../themes';
import type { ComponentVariant } from '../variants';
import { THEMES, THEME_GROUPS } from '../themes';
import { VARIANTS } from '../variants';
import {
  getColorTheme,
  setColorTheme,
  getComponentVariant,
  setComponentVariant,
  onColorThemeChange,
  onVariantChange,
} from '../theme-switcher';

export interface ThemePickerProps {
  onThemeChange?: (themeId: string) => void;
  onVariantChange?: (variant: ComponentVariant) => void;
  showVariants?: boolean;
  searchQuery?: string;
}

export function ThemePicker({
  onThemeChange,
  onVariantChange: onVariantChangeProp,
  showVariants = true,
  searchQuery = '',
}: ThemePickerProps) {
  const [activeTheme, setActiveTheme] = useState(getColorTheme());
  const [activeVariant, setActiveVariant] = useState(getComponentVariant());

  useEffect(() => {
    const unsubTheme = onColorThemeChange((id) => setActiveTheme(id));
    const unsubVariant = onVariantChange((v) => setActiveVariant(v));
    return () => { unsubTheme(); unsubVariant(); };
  }, []);

  const handleThemeSelect = (id: string) => {
    setColorTheme(id);
    onThemeChange?.(id);
  };

  const handleVariantSelect = (v: ComponentVariant) => {
    setComponentVariant(v);
    onVariantChangeProp?.(v);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {showVariants && (
        <VariantSelector active={activeVariant} onSelect={handleVariantSelect} />
      )}
      <ThemeGrid activeTheme={activeTheme} onSelect={handleThemeSelect} searchQuery={searchQuery} />
    </div>
  );
}

/* ── Variant Selector ────────────────────────────────────── */

function VariantSelector({
  active,
  onSelect,
}: {
  active: ComponentVariant;
  onSelect: (v: ComponentVariant) => void;
}) {
  return (
    <div>
      <SectionLabel>Component Variant</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '2px solid',
              borderColor: active === v.id ? 'var(--color-accent)' : 'var(--color-border)',
              backgroundColor: active === v.id ? 'var(--color-bg-active)' : 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-fg-bright)' }}>
              {v.label}
            </div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'var(--color-fg-muted)' }}>
              {v.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Theme Grid ──────────────────────────────────────────── */

function ThemeGrid({
  activeTheme,
  onSelect,
  searchQuery = '',
}: {
  activeTheme: string;
  onSelect: (id: string) => void;
  searchQuery?: string;
}) {
  const q = searchQuery.toLowerCase();
  return (
    <div>
      <SectionLabel>Color Theme</SectionLabel>
      <p style={{ fontSize: 14, marginBottom: 16, color: 'var(--color-fg-muted)' }}>
        Choose a theme for the application
      </p>
      {THEME_GROUPS.map((group) => {
        const themes = THEMES.filter((t) => t.group === group && (!q || t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || group.toLowerCase().includes(q)));
        if (themes.length === 0) return null;
        return (
          <div key={group} style={{ marginBottom: 24 }}>
            <GroupLabel>{group}</GroupLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={activeTheme === theme.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Theme Card ──────────────────────────────────────────── */

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: Theme;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      style={{
        position: 'relative',
        borderRadius: 8,
        border: '2px solid',
        borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
        backgroundColor: theme.colors.bg,
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <ThemePreview colors={theme.colors} />
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: theme.colors.fg }}>
          {theme.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {theme.isLight && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: theme.colors.bgActive,
                color: theme.colors.fgBright,
              }}
            >
              Light
            </span>
          )}
          {isActive && <CheckIcon color="var(--color-accent)" />}
        </div>
      </div>
    </button>
  );
}

/* ── Theme Preview (mini code mockup) ────────────────────── */

function ThemePreview({ colors }: { colors: ThemeColors }) {
  return (
    <div style={{ padding: '12px 12px 8px', backgroundColor: colors.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ height: 6, borderRadius: 3, width: 48, backgroundColor: colors.fgMuted }} />
          <div style={{ height: 6, borderRadius: 3, width: 32, backgroundColor: colors.accent }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ height: 6, borderRadius: 3, width: 64, backgroundColor: colors.fgDim }} />
          <div style={{ height: 6, borderRadius: 3, width: 24, backgroundColor: colors.fgMuted }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ height: 6, borderRadius: 3, width: 40, backgroundColor: colors.fgMuted }} />
        </div>
      </div>
    </div>
  );
}

/* ── Small Helpers ────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-fg-bright)' }}>
      {children}
    </h3>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, color: 'var(--color-fg-muted)' }}>
      {children}
    </h4>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={color}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}
