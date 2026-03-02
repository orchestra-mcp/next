import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Accordion } from './Accordion';

const sampleItems = [
  { id: '1', title: 'What is Orchestra?', content: 'An AI-agentic IDE targeting 5 platforms.' },
  { id: '2', title: 'How does sync work?', content: 'UUID PKs with version vectors and last-write-wins.' },
  { id: '3', title: 'What stack is used?', content: 'Go + Rust + React/TypeScript with pnpm + Turborepo.' },
];

/**
 * Accordion component with collapsible sections.
 * Supports single or multiple open, defaultOpen, disabled items,
 * and theme-aware styling via CSS custom properties.
 */
const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean', description: 'Allow multiple open items' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: sampleItems },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('What is Orchestra?')).toBeInTheDocument();
  },
};

export const MultipleOpen: Story = {
  args: { items: sampleItems, multiple: true },
};

export const DefaultOpen: Story = {
  args: { items: sampleItems, defaultOpen: ['1', '3'] },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      ...sampleItems,
      { id: '4', title: 'Disabled Section', content: 'Cannot open.', disabled: true },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      title: `Section ${i + 1}`,
      content: `Body content for section ${i + 1}.`,
    })),
  },
};
