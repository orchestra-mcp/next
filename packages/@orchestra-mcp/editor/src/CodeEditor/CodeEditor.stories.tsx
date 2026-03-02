import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeEditor } from './CodeEditor';

const sampleTS = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`;

const sampleGo = `package main

import "fmt"

func main() {
\tfmt.Println("Hello, Orchestra!")
}`;

const sampleRust = `use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Alice", 100);
    scores.insert("Bob", 85);

    for (name, score) in &scores {
        println!("{name}: {score}");
    }
}`;

const meta = {
  title: 'Editor/CodeEditor',
  component: CodeEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'go', 'python', 'rust', 'css', 'json', 'html', 'sql'],
    },
    readOnly: { control: 'boolean' },
    lineNumbers: { control: 'boolean' },
    minimap: { control: 'boolean' },
    wordWrap: { control: 'select', options: ['off', 'on', 'wordWrapColumn', 'bounded'] },
    fontSize: { control: { type: 'range', min: 10, max: 24 } },
    height: { control: { type: 'range', min: 200, max: 800 } },
    keymap: { control: 'select', options: ['default', 'jetbrains'] },
    useLegacy: { control: 'boolean' },
  },
} satisfies Meta<typeof CodeEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: sampleTS,
    language: 'typescript',
    fileName: 'Counter.tsx',
    height: 400,
  },
};

export const GoCode: Story = {
  args: {
    value: sampleGo,
    language: 'go',
    fileName: 'main.go',
    height: 300,
  },
};

export const RustCode: Story = {
  args: {
    value: sampleRust,
    language: 'rust',
    fileName: 'main.rs',
    height: 350,
  },
};

export const ReadOnly: Story = {
  args: {
    value: sampleTS,
    language: 'typescript',
    readOnly: true,
    fileName: 'readonly.tsx',
  },
};

export const WithMinimap: Story = {
  args: {
    value: sampleTS,
    language: 'typescript',
    minimap: true,
    fileName: 'minimap.tsx',
    height: 500,
  },
};

export const JetBrainsKeymap: Story = {
  args: {
    value: sampleTS,
    language: 'typescript',
    keymap: 'jetbrains',
    fileName: 'jetbrains.tsx',
    height: 400,
  },
};

export const LegacyFallback: Story = {
  args: {
    value: sampleTS,
    language: 'typescript',
    useLegacy: true,
    fileName: 'legacy.tsx',
    height: 300,
  },
};

export const NoLineNumbers: Story = {
  args: {
    value: sampleGo,
    language: 'go',
    lineNumbers: false,
    height: 250,
  },
};

export const Interactive: Story = {
  render: () => {
    const [code, setCode] = useState(sampleTS);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <CodeEditor
          value={code}
          onChange={setCode}
          language="typescript"
          fileName="interactive.tsx"
          height={400}
          keymap="jetbrains"
        />
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          Characters: {code.length} | Lines: {code.split('\n').length}
        </p>
      </div>
    );
  },
};
