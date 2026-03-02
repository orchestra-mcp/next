import type { Meta, StoryObj } from '@storybook/react';
import { ChatQuickActions } from './ChatQuickActions';
import type { QuickAction } from '../types/message';

const meta = {
  title: 'AI/ChatQuickActions',
  component: ChatQuickActions,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatQuickActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultActions: QuickAction[] = [
  { id: 'explain', label: 'Explain code', prompt: 'Explain the selected code' },
  { id: 'refactor', label: 'Refactor', prompt: 'Refactor this code for better readability' },
  { id: 'tests', label: 'Write tests', prompt: 'Write unit tests for this code' },
  { id: 'docs', label: 'Add docs', prompt: 'Add JSDoc comments to this code' },
];

const manyActions: QuickAction[] = [
  { id: 'explain', label: 'Explain code', prompt: 'Explain the selected code' },
  { id: 'refactor', label: 'Refactor', prompt: 'Refactor this code' },
  { id: 'tests', label: 'Write tests', prompt: 'Write unit tests' },
  { id: 'docs', label: 'Add docs', prompt: 'Add documentation' },
  { id: 'types', label: 'Add types', prompt: 'Add TypeScript types' },
  { id: 'optimize', label: 'Optimize', prompt: 'Optimize performance' },
  { id: 'review', label: 'Code review', prompt: 'Review this code' },
  { id: 'debug', label: 'Debug', prompt: 'Help me debug this' },
  { id: 'lint', label: 'Fix lint', prompt: 'Fix linting issues' },
];

export const Default: Story = {
  args: {
    actions: defaultActions,
    onSelect: () => {},
  },
};

export const ManyActions: Story = {
  args: {
    actions: manyActions,
    onSelect: () => {},
  },
};
