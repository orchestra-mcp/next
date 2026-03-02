# @orchestra-mcp/theme

Theme system with 26 color themes and 3 component variants using Tailwind CSS v4 Oxide engine.

## Two Independent Systems

This package provides **two independent theming systems** that work together:

### 1. Color Themes (26 themes)

Color schemes that define all colors in your app. Examples: `dracula`, `github-dark`, `deep-ocean`, `matrix`, etc.

- 26 professionally crafted themes
- Organized into 4 groups: Orchestra, Material, Popular, Classic
- Both light and dark themes available
- Applied via `data-color-theme` attribute

### 2. Component Variants (3 variants)

Layout and spacing styles independent of colors. All variants use generic descriptive names:

- **default** - Orchestra brand default styling with professional spacing and modern aesthetic
- **compact** - Code-focused interface with tight spacing (inspired by modern IDE aesthetics)
- **modern** - Clean launcher-style interface with smooth interactions (inspired by modern app launchers)
- Applied via `data-variant` attribute

**Note:** Variant names use generic style descriptors, not branded product names, while maintaining visual inspiration from popular developer tools.

## Installation

```bash
pnpm add @orchestra-mcp/theme
```

## Usage

### 1. Import base styles in your app entry

```typescript
import '@orchestra-mcp/theme/styles';
```

### 2. Initialize theme on app load

```typescript
import { initTheme } from '@orchestra-mcp/theme';

initTheme();
```

### 3. Set color theme

```typescript
import { setColorTheme } from '@orchestra-mcp/theme';

setColorTheme('dracula'); // Any of 26 themes
```

### 4. Set component variant

```typescript
import { setComponentVariant } from '@orchestra-mcp/theme';

setComponentVariant('compact'); // 'compact' | 'modern' | 'default'
```

## Available Color Themes

### Orchestra (1 theme)
- `orchestra` - Default Orchestra brand theme

### Material (11 themes)
- `deep-ocean`, `darker`, `oceanic`, `palenight`, `jetbrains`, `lighter`, `forest`, `sky-blue`, `sandy-beach`, `volcano`, `space`

### Popular (11 themes)
- `monokai-pro`, `dracula`, `github-light`, `github-dark`, `one-dark`, `one-light`, `night-owl`, `light-owl`, `moonlight`, `synthwave-84`, `matrix`

### Classic (3 themes)
- `arc-dark`, `solarized-dark`, `solarized-light`

## API Reference

See full documentation in package source.

## License

MIT
