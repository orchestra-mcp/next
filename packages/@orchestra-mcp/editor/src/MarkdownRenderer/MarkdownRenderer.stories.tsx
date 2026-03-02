import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownRenderer } from './MarkdownRenderer';

const fullDemo = `# Orchestra MCP Documentation

Welcome to the **Orchestra MCP** platform. This renderer supports all common markdown elements.

## Features

- **Bold text** and *italic text*
- Inline \`code snippets\`
- [Links](https://example.com) to external resources

### Code Blocks

\`\`\`typescript
import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
\`\`\`

### Tables

| Component | Status | Tests |
| --- | --- | --- |
| Button | Done | 12 |
| Input | Done | 8 |
| Modal | Done | 6 |

### Task Lists

- [x] Setup project structure
- [x] Build component library
- [ ] Write documentation
- [ ] Deploy to production

### Blockquotes

> This is an important note about the architecture.
> It can span multiple lines.

---

## Ordered Lists

1. Install dependencies
2. Configure the environment
3. Run the development server

That's all for now!`;

const meta = {
  title: 'Editor/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    onLinkClick: { action: 'linkClicked' },
  },
} satisfies Meta<typeof MarkdownRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullDemo: Story = {
  args: {
    content: fullDemo,
  },
};

export const Headings: Story = {
  args: {
    content: '# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6',
  },
};

export const CodeBlock: Story = {
  args: {
    content: '```go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n```',
  },
};

export const Table: Story = {
  args: {
    content: '| Name | Age | City |\n| --- | --- | --- |\n| Alice | 30 | New York |\n| Bob | 25 | London |\n| Charlie | 35 | Paris |',
  },
};

export const TaskList: Story = {
  args: {
    content: '- [x] Completed task\n- [x] Another completed task\n- [ ] Pending task\n- [ ] Another pending task',
  },
};

export const InlineFormatting: Story = {
  args: {
    content: 'This has **bold**, *italic*, `inline code`, and a [link](https://example.com).\n\n![Image alt](https://via.placeholder.com/300x100)',
  },
};

export const Blockquote: Story = {
  args: {
    content: '> This is a blockquote.\n> It can span multiple lines.\n\nNormal paragraph after the quote.',
  },
};

export const Lists: Story = {
  args: {
    content: '## Unordered\n\n- First item\n- Second item\n- Third item\n\n## Ordered\n\n1. Step one\n2. Step two\n3. Step three',
  },
};

export const Empty: Story = {
  args: {
    content: '',
  },
};
