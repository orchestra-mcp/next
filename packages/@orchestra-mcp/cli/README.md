# @orchestra-mcp/cli

Interactive CLI with rich Terminal UI (TUI) for Orchestra MCP.

## Features

- 🎨 **Beautiful TUI** - Rich terminal UI built with React/Ink
- 🔌 **Plugin Browser** - Visual plugin management with keyboard navigation
- 🎨 **Theme Switcher** - Live preview and switch between 26 color themes
- 📚 **Storybook Integration** - Quick access to component documentation
- ⌨️  **Keyboard Shortcuts** - Vim-like navigation (↑↓, q to quit, ESC to exit)
- 🎭 **ASCII Art Branding** - Beautiful welcome screen

## Installation

```bash
pnpm add @orchestra-mcp/cli
```

## Usage

### Interactive Welcome Screen

```bash
orchestra
# or
orchestra welcome
```

### Plugin Browser (TUI)

```bash
orchestra plugin
```

Browse, enable, disable, and manage Orchestra plugins with an interactive terminal UI.

### Theme Switcher (TUI)

```bash
orchestra theme
```

Preview and switch between 26 color themes with live preview.

### Storybook

```bash
orchestra storybook
# Custom port
orchestra storybook --port 8080
# Don't open browser
orchestra storybook --no-open
```

## Commands

| Command | Description |
|---------|-------------|
| `orchestra` | Show welcome screen |
| `orchestra plugin` | Browse and manage plugins (TUI) |
| `orchestra theme` | Switch color themes (TUI) |
| `orchestra storybook` | Start Storybook server |

## Keyboard Shortcuts

- `↑` / `k` - Navigate up
- `↓` / `j` - Navigate down
- `Enter` - Select item
- `q` / `ESC` - Quit/Exit
- `?` - Show help (context-aware)

## Development

```bash
# Build the package
pnpm run build

# Watch mode
pnpm run dev

# Clean build artifacts
pnpm run clean
```

## Dependencies

- **commander** - CLI framework
- **ink** - React for terminal UIs
- **chalk** - Terminal colors
- **ora** - Elegant terminal spinners
- **enquirer** - Interactive prompts

## License

MIT
