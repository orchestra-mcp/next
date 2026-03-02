import type { Meta, StoryObj } from '@storybook/react';
import { ChatStartupPrompts } from './ChatStartupPrompts';
import type { StartupPrompt } from '../types/message';

const meta = {
  title: 'AI/ChatStartupPrompts',
  component: ChatStartupPrompts,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatStartupPrompts>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultPrompts: StartupPrompt[] = [
  {
    id: 'explain',
    title: 'Explain this project',
    description: 'Get an overview of the codebase architecture',
    prompt: 'Explain the architecture of this project',
  },
  {
    id: 'bug',
    title: 'Fix a bug',
    description: 'Help me debug and fix an issue',
    prompt: 'Help me fix a bug in my code',
  },
  {
    id: 'feature',
    title: 'Build a feature',
    description: 'Implement a new feature step by step',
    prompt: 'Help me implement a new feature',
  },
  {
    id: 'refactor',
    title: 'Refactor code',
    description: 'Improve code quality and maintainability',
    prompt: 'Help me refactor my code for better readability',
  },
];

export const Default: Story = {
  args: {
    prompts: defaultPrompts,
    onSelect: () => {},
  },
};

export const Custom: Story = {
  args: {
    title: 'Welcome to Orchestra',
    subtitle: 'Select a prompt or type your own message below',
    prompts: defaultPrompts,
    onSelect: () => {},
  },
};
