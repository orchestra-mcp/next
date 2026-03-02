# @orchestra-mcp/ui

Shared UI component library for Orchestra Framework. Provides consistent, reusable components across desktop, chrome, web, and mobile platforms.

## Installation

```bash
pnpm add @orchestra-mcp/ui
```

## Features

- 🎨 Three component variants: compact, modern, default
- 🎭 26 color themes via @orchestra-mcp/theme
- ♿ Accessibility-first with ARIA support
- 📱 Cross-platform: Desktop, Chrome, Web, Mobile
- 🎯 TypeScript support with full type definitions
- 🔧 Tree-shakeable exports

## Components

All 16 components are cross-platform verified with tests and Storybook stories:

| Component | Tests | Stories | Variants | Notes |
|-----------|-------|---------|----------|-------|
| Button | 8 | 6 | compact/modern/default | Primary, secondary, ghost, danger |
| Input | 19 | 5 | compact/modern/default | Text, password, search, with icons |
| Modal | 18 | 5 | compact/modern/default | Sizes, nested, keyboard dismiss |
| Sidebar | 10 | 4 | compact/modern/default | Left/right, overlay, responsive |
| Panel | 11 | 5 | compact/modern/default | Collapsible, header actions, SVG icon |
| Tabs | 14 | 4 | compact/modern/default | Horizontal/vertical, closable |
| Menu | 15 | 4 | compact/modern/default | Nested, keyboard nav, icons |
| Notification | 10 | 8 | compact/modern/default | 4 types, 6 positions, auto-dismiss |
| SettingsNav | 8 | 5 | compact/modern/default | Search, active state, icons |
| SettingsForm | 19 | 14 | compact/modern/default | Auto-generates form from setting types |
| CodeBlock | 16 | 12 | compact/modern/default | Syntax highlight, copy, export-to-image |
| DataTable | 10 | 9 | compact/modern/default | Sortable, CSV export, export-to-image |
| MarkdownRenderer | 12 | 9 | - | Headings, code, tables, task lists |
| MarkdownEditor | 10 | 5 | - | Split-pane, toolbar, word count |

## Usage

```tsx
import { Button, Input, Modal } from '@orchestra-mcp/ui';

function MyApp() {
  return (
    <div>
      <Button variant="primary" size="md">
        Click me
      </Button>
    </div>
  );
}
```

## Component Variants & Themes

This package works with `@orchestra-mcp/theme` to provide a flexible theming system:

### Component Variants (Layout Styles)
All components support three layout variants via `data-variant` attribute:

- `compact` - Code-focused interface with tight spacing (inspired by modern IDE aesthetics)
- `modern` - Clean launcher-style interface with smooth interactions (inspired by modern app launchers)
- `default` - Orchestra brand default styling with professional spacing

### Color Themes
26 color themes available via `@orchestra-mcp/theme`:
- Orchestra, Material (11 themes), Popular (11 themes), Classic (3 themes)

**Note:** Variant names use generic style descriptors, not branded product names.

## Development

```bash
# Build the package
pnpm run build

# Watch mode
pnpm run dev

# Clean build artifacts
pnpm run clean
```

## License

MIT
