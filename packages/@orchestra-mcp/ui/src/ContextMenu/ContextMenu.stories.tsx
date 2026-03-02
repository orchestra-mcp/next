import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuItem } from './ContextMenu';
import {
  FileIcon,
  FolderIcon,
  SettingsIcon,
  SearchIcon,
  TerminalIcon,
  GitIcon,
  CloseIcon,
  AddIcon,
} from '@orchestra-mcp/icons/code';
import {
  CopyIcon,
  PasteIcon,
  TrashIcon,
  ClipboardIcon,
  RefreshIcon,
  DownloadIcon,
} from '@orchestra-mcp/icons/launcher';

const meta = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    searchable: { control: 'boolean' },
    searchPlaceholder: { control: 'text' },
  },
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const Target = ({ text = 'Right-click here' }) => (
  <div
    style={{
      padding: '40px 60px',
      border: '1px dashed var(--color-border)',
      borderRadius: 8,
      color: 'var(--color-fg)',
      userSelect: 'none',
    }}
  >
    {text}
  </div>
);

const basicItems: ContextMenuItem[] = [
  { id: 'cut', label: 'Cut' },
  { id: 'copy', label: 'Copy' },
  { id: 'paste', label: 'Paste' },
  { id: 'delete', label: 'Delete' },
];

export const Basic: Story = {
  args: { items: basicItems, children: <Target /> },
};

export const WithIcons: Story = {
  args: {
    items: [
      { id: 'copy', label: 'Copy', icon: <CopyIcon size={16} />, color: 'primary' },
      { id: 'paste', label: 'Paste', icon: <PasteIcon size={16} /> },
      { id: 'clipboard', label: 'Clipboard', icon: <ClipboardIcon size={16} />, color: 'info' },
      { id: 'sep1', label: '', separator: true },
      { id: 'delete', label: 'Delete', icon: <TrashIcon size={16} />, color: 'danger' },
    ],
    children: <Target text="Right-click (icons)" />,
  },
};

export const WithShortcuts: Story = {
  args: {
    items: [
      { id: 'copy', label: 'Copy', icon: <CopyIcon size={16} />, shortcut: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', icon: <PasteIcon size={16} />, shortcut: 'Ctrl+V' },
      { id: 'delete', label: 'Delete', icon: <TrashIcon size={16} />, shortcut: 'Del' },
      { id: 'sep1', label: '', separator: true },
      { id: 'refresh', label: 'Refresh', icon: <RefreshIcon size={16} />, shortcut: 'F5' },
      { id: 'download', label: 'Download', icon: <DownloadIcon size={16} />, shortcut: 'Ctrl+S' },
    ],
    children: <Target text="Right-click (shortcuts)" />,
  },
};

export const Nested: Story = {
  args: {
    items: [
      { id: 'new-file', label: 'New File', icon: <FileIcon size={16} />, color: 'primary' },
      { id: 'new-folder', label: 'New Folder', icon: <FolderIcon size={16} />, color: 'success' },
      {
        id: 'refactor',
        label: 'Refactor',
        icon: <GitIcon size={16} />,
        color: 'info',
        children: [
          { id: 'rename', label: 'Rename', color: 'warning' },
          { id: 'extract', label: 'Extract Method' },
          { id: 'inline', label: 'Inline Variable' },
        ],
      },
      { id: 'sep', label: '', separator: true },
      { id: 'terminal', label: 'Open Terminal', icon: <TerminalIcon size={16} /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
    ],
    children: <Target text="Right-click (nested)" />,
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { id: 'copy', label: 'Copy', icon: <CopyIcon size={16} /> },
      { id: 'paste', label: 'Paste', icon: <PasteIcon size={16} />, disabled: true },
      { id: 'delete', label: 'Delete', icon: <TrashIcon size={16} />, disabled: true },
    ],
    children: <Target text="Right-click (disabled)" />,
  },
};

export const WithSeparators: Story = {
  args: {
    items: [
      { id: 'copy', label: 'Copy', icon: <CopyIcon size={16} />, shortcut: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', icon: <PasteIcon size={16} />, shortcut: 'Ctrl+V' },
      { id: 'sep1', label: '', separator: true },
      { id: 'find', label: 'Find', icon: <SearchIcon size={16} />, shortcut: 'Ctrl+F' },
      { id: 'sep2', label: '', separator: true },
      { id: 'close', label: 'Close', icon: <CloseIcon size={16} /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
    ],
    children: <Target text="Right-click (separators)" />,
  },
};

/* ── Colored items ───────────────────────────────── */

export const WithColors: Story = {
  args: {
    items: [
      { id: 'new', label: 'New File', icon: <AddIcon size={16} />, color: 'primary' },
      { id: 'save', label: 'Save', icon: <DownloadIcon size={16} />, color: 'success' },
      { id: 'warn', label: 'Unsaved Changes', icon: <ClipboardIcon size={16} />, color: 'warning' },
      { id: 'sep1', label: '', separator: true },
      { id: 'delete', label: 'Delete File', icon: <TrashIcon size={16} />, color: 'danger' },
      { id: 'info', label: 'File Info', icon: <SearchIcon size={16} />, color: 'info' },
      { id: 'sep2', label: '', separator: true },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
      { id: 'terminal', label: 'Terminal', icon: <TerminalIcon size={16} /> },
    ],
    children: <Target text="Right-click (colored items)" />,
  },
};

/* ── Searchable: New File with many file types ───── */

const fileTypeItems: ContextMenuItem[] = [
  { id: 'js', label: 'JavaScript (.js)', icon: <FileIcon size={16} /> },
  { id: 'ts', label: 'TypeScript (.ts)', icon: <FileIcon size={16} /> },
  { id: 'tsx', label: 'TypeScript React (.tsx)', icon: <FileIcon size={16} /> },
  { id: 'jsx', label: 'JavaScript React (.jsx)', icon: <FileIcon size={16} /> },
  { id: 'css', label: 'CSS (.css)', icon: <FileIcon size={16} /> },
  { id: 'html', label: 'HTML (.html)', icon: <FileIcon size={16} /> },
  { id: 'json', label: 'JSON (.json)', icon: <FileIcon size={16} /> },
  { id: 'md', label: 'Markdown (.md)', icon: <FileIcon size={16} /> },
  { id: 'py', label: 'Python (.py)', icon: <FileIcon size={16} /> },
  { id: 'go', label: 'Go (.go)', icon: <FileIcon size={16} /> },
  { id: 'rs', label: 'Rust (.rs)', icon: <FileIcon size={16} /> },
  { id: 'yaml', label: 'YAML (.yaml)', icon: <FileIcon size={16} /> },
  { id: 'toml', label: 'TOML (.toml)', icon: <FileIcon size={16} /> },
  { id: 'sql', label: 'SQL (.sql)', icon: <FileIcon size={16} /> },
  { id: 'proto', label: 'Protobuf (.proto)', icon: <FileIcon size={16} /> },
  { id: 'sh', label: 'Shell Script (.sh)', icon: <TerminalIcon size={16} /> },
  { id: 'dockerfile', label: 'Dockerfile', icon: <FileIcon size={16} /> },
  { id: 'env', label: 'Environment (.env)', icon: <FileIcon size={16} /> },
  { id: 'gitignore', label: '.gitignore', icon: <GitIcon size={16} /> },
  { id: 'folder', label: 'New Folder', icon: <FolderIcon size={16} /> },
];

export const SearchableNewFile: Story = {
  args: {
    items: fileTypeItems,
    searchable: true,
    searchPlaceholder: 'Search file type...',
    children: <Target text="Right-click (searchable new file)" />,
  },
};

/* ── Searchable: Command Palette style ───────────── */

const commandItems: ContextMenuItem[] = [
  { id: 'new-file', label: 'New File', icon: <AddIcon size={16} />, shortcut: 'Ctrl+N' },
  { id: 'new-folder', label: 'New Folder', icon: <FolderIcon size={16} /> },
  { id: 'open-terminal', label: 'Open Terminal', icon: <TerminalIcon size={16} />, shortcut: 'Ctrl+`' },
  { id: 'find-file', label: 'Find in Files', icon: <SearchIcon size={16} />, shortcut: 'Ctrl+Shift+F' },
  { id: 'git-commit', label: 'Git: Commit', icon: <GitIcon size={16} /> },
  { id: 'git-push', label: 'Git: Push', icon: <GitIcon size={16} /> },
  { id: 'settings', label: 'Open Settings', icon: <SettingsIcon size={16} />, shortcut: 'Ctrl+,' },
  { id: 'refresh', label: 'Refresh', icon: <RefreshIcon size={16} />, shortcut: 'F5' },
  { id: 'download', label: 'Download', icon: <DownloadIcon size={16} /> },
  { id: 'close-all', label: 'Close All Tabs', icon: <CloseIcon size={16} /> },
];

export const SearchableCommands: Story = {
  args: {
    items: commandItems,
    searchable: true,
    searchPlaceholder: 'Type a command...',
    children: <Target text="Right-click (searchable commands)" />,
  },
};
