import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { FileTree } from './FileTree';
import type { FileNode } from './FileTree';

const sampleItems: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'index', name: 'index.ts', type: 'file' },
      { id: 'app', name: 'App.tsx', type: 'file', modified: true },
      {
        id: 'components',
        name: 'components',
        type: 'folder',
        children: [
          { id: 'button', name: 'Button.tsx', type: 'file' },
          { id: 'modal', name: 'Modal.tsx', type: 'file', modified: true },
        ],
      },
    ],
  },
  { id: 'package', name: 'package.json', type: 'file' },
  { id: 'readme', name: 'README.md', type: 'file' },
];

/**
 * FileTree component displays a VS Code-style file explorer.
 * - Supports expand/collapse folders, single selection, modified indicators
 * - Adapts to compact/modern/default variants via toolbar
 */
const meta = {
  title: 'Explorer/FileTree',
  component: FileTree,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    selectedId: { control: 'text', description: 'ID of selected node' },
  },
} satisfies Meta<typeof FileTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
    defaultExpanded: ['src'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('src')).toBeInTheDocument();
    await expect(canvas.getByText('index.ts')).toBeInTheDocument();
  },
};

export const DeepNesting: Story = {
  args: {
    items: [
      {
        id: 'a', name: 'level-1', type: 'folder', children: [
          {
            id: 'b', name: 'level-2', type: 'folder', children: [
              {
                id: 'c', name: 'level-3', type: 'folder', children: [
                  { id: 'd', name: 'deep-file.ts', type: 'file' },
                ],
              },
            ],
          },
        ],
      },
    ],
    defaultExpanded: ['a', 'b', 'c'],
  },
};

export const WithModifiedFiles: Story = {
  args: {
    items: [
      { id: 'f1', name: 'changed.ts', type: 'file', modified: true },
      { id: 'f2', name: 'clean.ts', type: 'file' },
      { id: 'f3', name: 'edited.css', type: 'file', modified: true },
    ],
  },
};

export const SingleFile: Story = {
  args: {
    items: [{ id: 'solo', name: 'main.ts', type: 'file' }],
  },
};

export const LargeTree: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => ({
      id: `file-${i}`,
      name: `file-${i}.ts`,
      type: 'file' as const,
    })),
  },
};
