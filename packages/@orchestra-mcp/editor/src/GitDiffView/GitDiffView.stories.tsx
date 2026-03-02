import type { Meta, StoryObj } from '@storybook/react';
import { GitDiffView } from './GitDiffView';

const originalTS = `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`;

const modifiedTS = `import { useState, useCallback } from 'react';

function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}

export default Counter;`;

const meta = {
  title: 'Editor/GitDiffView',
  component: GitDiffView,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['inline', 'side-by-side'] },
    lineNumbers: { control: 'boolean' },
  },
} satisfies Meta<typeof GitDiffView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    original: originalTS,
    modified: modifiedTS,
    fileName: 'Counter.tsx',
    language: 'typescript',
    mode: 'inline',
  },
};

export const SideBySide: Story = {
  args: {
    original: originalTS,
    modified: modifiedTS,
    fileName: 'Counter.tsx',
    language: 'typescript',
    mode: 'side-by-side',
  },
};

export const NoChanges: Story = {
  args: {
    original: 'const x = 1;',
    modified: 'const x = 1;',
    fileName: 'unchanged.ts',
  },
};

export const NoLineNumbers: Story = {
  args: {
    original: originalTS,
    modified: modifiedTS,
    lineNumbers: false,
  },
};

export const PureAddition: Story = {
  args: {
    original: '',
    modified: 'console.log("new file");\nexport default {};',
    fileName: 'newFile.ts',
    language: 'typescript',
  },
};

export const PureDeletion: Story = {
  args: {
    original: 'console.log("old file");\nexport default {};',
    modified: '',
    fileName: 'deletedFile.ts',
    language: 'typescript',
  },
};
