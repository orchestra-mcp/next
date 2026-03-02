# @orchestra-mcp/icons

React SVG icon components for Orchestra MCP.

## Installation

```bash
pnpm add @orchestra-mcp/icons
```

## Usage

```tsx
import { OrchestraLogo, FileIcon, SearchIcon, CommandIcon } from '@orchestra-mcp/icons';

function MyComponent() {
  return (
    <>
      {/* Default size (24px) */}
      <OrchestraLogo />

      {/* Custom size */}
      <FileIcon size={32} />

      {/* Custom color */}
      <SearchIcon color="#ff0000" />

      {/* Using className */}
      <CommandIcon className="my-icon" />

      {/* Combining props */}
      <FileIcon size={48} color="blue" className="custom-class" />
    </>
  );
}
```

## Icon Sets

### Code Editor Icons (20 icons)
Code-focused icons inspired by modern IDE aesthetics:

- `FileIcon` - File representation
- `FolderIcon` - Folder representation
- `SettingsIcon` - Settings/configuration
- `SearchIcon` - Search functionality
- `ExtensionsIcon` - Extensions/plugins
- `DebugIcon` - Debug mode
- `GitIcon` - Git version control
- `TerminalIcon` - Terminal/command line
- `OutputIcon` - Output panel
- `ProblemsIcon` - Problems/issues
- `RunIcon` - Run/play action
- `StopIcon` - Stop action
- `AddIcon` - Add/create action
- `CloseIcon` - Close/dismiss action
- `MenuIcon` - Menu/hamburger
- `ChevronRightIcon` - Navigate right
- `ChevronDownIcon` - Navigate down
- `CheckIcon` - Success/confirmation
- `WarningIcon` - Warning state
- `ErrorIcon` - Error state

### Launcher Icons (15 icons)
Quick-action icons inspired by modern launcher aesthetics:

- `CommandIcon` - Command palette
- `LauncherSearchIcon` - Search (launcher style)
- `CalendarIcon` - Calendar/dates
- `CalculatorIcon` - Calculator/math
- `ClipboardIcon` - Clipboard/copy
- `StarIcon` - Favorite/star
- `HeartIcon` - Like/love
- `TrashIcon` - Delete/remove
- `DownloadIcon` - Download action
- `UploadIcon` - Upload action
- `ShareIcon` - Share/export
- `CopyIcon` - Copy action
- `PasteIcon` - Paste action
- `RefreshIcon` - Refresh/reload
- `FilterIcon` - Filter/sort

### Brand

- `OrchestraLogo` - Orchestra MCP brand logo

## Props

All icon components accept the following props:

```typescript
interface IconProps {
  size?: number | string;  // Default: 24
  color?: string;          // Default: 'currentColor'
  className?: string;      // Default: ''
}
```

## Features

- All icons use `currentColor` by default (inherit color from parent)
- Fully typed with TypeScript
- SVG-based for crisp scaling
- Tree-shakeable (only import what you use)
- Consistent 24px default size
- Customizable via props
- **Boxicons Integration**: Access 2000+ icons from Boxicons
- **Icon Generation**: SVG to PNG conversion for tray icons

## Icon Generation

This package includes scripts to generate PNG icons from SVG sources:

### Generate Boxicons Data

```bash
pnpm generate:boxicons
```

Renders Boxicons SVGs as base64-encoded 16x16 PNGs for use in tray menus and native contexts.

### Generate Tray Icons

```bash
pnpm generate:tray
```

Renders the Orchestra logo as tray icons at multiple resolutions (1x, 2x, 3x) for macOS/Windows/Linux system trays.

### Generate All

```bash
pnpm generate
```

Runs both generation scripts.

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch mode
pnpm dev

# Generate icon data
pnpm generate
```

## License

MIT
