import type { Meta, StoryObj } from '@storybook/react';
import { ChatMarkdown } from './ChatMarkdown';

const meta = {
  title: 'AI/ChatMarkdown',
  component: ChatMarkdown,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const richContent = [
  '# Refactoring Guide',
  '',
  '## Overview',
  '',
  'This guide covers how to refactor your React components to use **TypeScript generics** for improved type safety.',
  '',
  '### Key Benefits',
  '',
  '- Better type inference at call sites',
  '- Compile-time error detection',
  '- Improved developer experience with autocomplete',
  '',
  '## Code Example',
  '',
  '```tsx',
  'interface TableProps<T> {',
  '  data: T[];',
  '  columns: Column<T>[];',
  '  onRowClick?: (row: T) => void;',
  '}',
  '',
  'export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {',
  '  return (',
  '    <table>',
  '      <thead>',
  '        <tr>{columns.map(col => <th key={col.key}>{col.header}</th>)}</tr>',
  '      </thead>',
  '      <tbody>',
  '        {data.map((row, i) => (',
  '          <tr key={i} onClick={() => onRowClick?.(row)}>',
  '            {columns.map(col => <td key={col.key}>{col.render(row)}</td>)}',
  '          </tr>',
  '        ))}',
  '      </tbody>',
  '    </table>',
  '  );',
  '}',
  '```',
  '',
  '## Migration Steps',
  '',
  '| Step | Action | Status |',
  '|------|--------|--------|',
  '| 1 | Add generic type parameter | Done |',
  '| 2 | Update props interface | Done |',
  '| 3 | Update consumers | In Progress |',
  '| 4 | Remove old `any` types | Pending |',
  '',
  '> **Note:** Always run the full test suite after each step to catch regressions.',
  '',
  'For more details, see the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html).',
].join('\n');

export const Default: Story = {
  args: {
    content: richContent,
  },
};

export const Simple: Story = {
  args: {
    content: 'This is a simple paragraph of text without any special markdown formatting. It demonstrates how plain text renders within the ChatMarkdown component.',
  },
};
