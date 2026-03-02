import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PromptCardEditor } from './PromptCardEditor';
import type { PromptCard, PromptCardField } from './PromptCardEditor';

const meta: Meta<typeof PromptCardEditor> = {
  title: 'AI/PromptCardEditor',
  component: PromptCardEditor,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PromptCardEditor>;

/* ── Startup Prompts ─────────────────────────────── */

const PROMPT_FIELDS: PromptCardField[] = [
  { key: 'title', label: 'Title', placeholder: 'Fix a bug' },
  { key: 'description', label: 'Description', placeholder: 'Debug and resolve issues', type: 'textarea' },
  { key: 'prompt', label: 'Prompt', placeholder: 'Help me fix a bug in my code', type: 'textarea' },
];

const DEFAULT_PROMPTS: PromptCard[] = [
  { id: '1', icon: 'bx-bug', color: '#ef4444', title: 'Fix a bug', description: 'Debug and resolve issues', prompt: 'Help me fix a bug in my code' },
  { id: '2', icon: 'bx-code-alt', color: '#6366f1', title: 'Write code', description: 'Generate code from description', prompt: 'Help me write a new feature' },
  { id: '3', icon: 'bx-book-open', color: '#f59e0b', title: 'Explain code', description: 'Understand complex code', prompt: 'Explain how this code works' },
  { id: '4', icon: 'bx-git-branch', color: '#22c55e', title: 'Review PR', description: 'Get code review feedback', prompt: 'Review the latest pull request' },
];

function PromptsDemo() {
  const [cards, setCards] = useState<PromptCard[]>(DEFAULT_PROMPTS);
  return (
    <div style={{ maxWidth: 520 }}>
      <PromptCardEditor
        value={cards}
        onChange={setCards}
        fields={PROMPT_FIELDS}
        previewMode="prompts"
      />
    </div>
  );
}

export const StartupPrompts: Story = {
  render: () => <PromptsDemo />,
};

/* ── Quick Actions ───────────────────────────────── */

const ACTION_FIELDS: PromptCardField[] = [
  { key: 'label', label: 'Label', placeholder: 'Project Status' },
  { key: 'prompt', label: 'Prompt', placeholder: 'What is the project status?', type: 'textarea' },
];

const DEFAULT_ACTIONS: PromptCard[] = [
  { id: '1', icon: 'bx-bar-chart', color: '#6366f1', label: 'Project Status', prompt: 'What is the project status?' },
  { id: '2', icon: 'bx-task', color: '#22c55e', label: 'Next Task', prompt: 'What should I work on next?' },
  { id: '3', icon: 'bx-search', color: '#f59e0b', label: 'Code Review', prompt: 'Review my recent changes' },
  { id: '4', icon: 'bx-info-circle', color: '#3b82f6', label: 'Explain', prompt: 'Explain the current codebase architecture' },
];

function ActionsDemo() {
  const [cards, setCards] = useState<PromptCard[]>(DEFAULT_ACTIONS);
  return (
    <div style={{ maxWidth: 520 }}>
      <PromptCardEditor
        value={cards}
        onChange={setCards}
        fields={ACTION_FIELDS}
        previewMode="actions"
      />
    </div>
  );
}

export const QuickActions: Story = {
  render: () => <ActionsDemo />,
};

/* ── Empty State ─────────────────────────────────── */

function EmptyDemo() {
  const [cards, setCards] = useState<PromptCard[]>([]);
  return (
    <div style={{ maxWidth: 520 }}>
      <PromptCardEditor
        value={cards}
        onChange={setCards}
        fields={PROMPT_FIELDS}
        previewMode="prompts"
      />
    </div>
  );
}

export const Empty: Story = {
  render: () => <EmptyDemo />,
};

/* ── Disabled ────────────────────────────────────── */

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <PromptCardEditor
        value={DEFAULT_PROMPTS}
        onChange={() => {}}
        fields={PROMPT_FIELDS}
        previewMode="prompts"
        disabled
      />
    </div>
  ),
};
