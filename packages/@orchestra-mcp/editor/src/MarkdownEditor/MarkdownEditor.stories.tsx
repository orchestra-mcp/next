import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownEditor } from './MarkdownEditor';

const defaultContent = `# Getting Started

Welcome to the **Markdown Editor**. Try the toolbar buttons above or use keyboard shortcuts:

- **Ctrl+B** for bold
- **Ctrl+I** for italic
- **Ctrl+K** for link

## Example Code

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Task List

- [x] Setup editor
- [ ] Add more features
`;

const meta = {
  title: 'Editor/MarkdownEditor',
  component: MarkdownEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive editor with live preview */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(defaultContent);
    return <MarkdownEditor {...args} value={value} onChange={setValue} />;
  },
  args: {},
};

/** Empty editor with placeholder text */
export const EmptyWithPlaceholder: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <MarkdownEditor {...args} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: 'Start writing markdown...',
  },
};

/** Read-only mode disables editing and toolbar */
export const ReadOnly: Story = {
  args: {
    value: defaultContent,
    onChange: () => {},
    readOnly: true,
  },
};

/** Long content to test scrolling behavior */
export const LongContent: Story = {
  render: (args) => {
    const longContent = Array.from({ length: 20 }, (_, i) =>
      `## Section ${i + 1}\n\nThis is paragraph ${i + 1} with **bold** and *italic* text.\n\n- Item A\n- Item B\n- Item C\n`
    ).join('\n');
    const [value, setValue] = useState(longContent);
    return <MarkdownEditor {...args} value={value} onChange={setValue} />;
  },
  args: {},
};

/** Minimal content to show word count */
export const MinimalContent: Story = {
  render: (args) => {
    const [value, setValue] = useState('Hello world.');
    return <MarkdownEditor {...args} value={value} onChange={setValue} />;
  },
  args: {},
};
