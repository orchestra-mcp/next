import type { Meta, StoryObj } from '@storybook/react';
import type { FileTab } from './FileEditorPage';
import { FileEditorPage } from './FileEditorPage';

const meta = {
  title: 'AI/Pages/FileEditorPage',
  component: FileEditorPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileEditorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const tsFile: FileTab = {
  id: 'tab-1',
  filePath: 'src/cards/CardRegistry.ts',
  content: `export class CardRegistry {\n  private cards = new Map<string, CardRegistration>();\n\n  register(type: string, card: CardRegistration) {\n    this.cards.set(type, card);\n  }\n\n  get(type: string) {\n    return this.cards.get(type);\n  }\n}\n`,
  language: 'typescript',
};

const cssFile: FileTab = {
  id: 'tab-2',
  filePath: 'src/cards/CardBase.css',
  content: `.card-base {\n  border: 1px solid var(--color-border);\n  border-radius: 8px;\n  overflow: hidden;\n}\n\n.card-base__header {\n  display: flex;\n  padding: 8px 12px;\n}\n`,
  language: 'css',
};

const dirtyFile: FileTab = {
  id: 'tab-3',
  filePath: 'src/types/events.ts',
  content: `export interface BashEvent {\n  type: 'bash';\n  command: string;\n  output?: string;\n  exitCode?: number;\n  // Added new field\n  cwd?: string;\n}\n`,
  originalContent: `export interface BashEvent {\n  type: 'bash';\n  command: string;\n  output?: string;\n  exitCode?: number;\n}\n`,
  language: 'typescript',
  isDirty: true,
};

export const SingleFile: Story = {
  args: {
    tabs: [tsFile],
    activeTabId: 'tab-1',
    onBack: () => console.log('Back'),
    onSave: (id, content) => console.log('Save', id, content),
  },
};

export const MultipleTabs: Story = {
  args: {
    tabs: [tsFile, cssFile, dirtyFile],
    activeTabId: 'tab-1',
    onSelectTab: (id) => console.log('Select', id),
    onCloseTab: (id) => console.log('Close', id),
    onBack: () => console.log('Back'),
    onSave: (id) => console.log('Save', id),
    onDiscard: (id) => console.log('Discard', id),
  },
};

export const DiffMode: Story = {
  args: {
    tabs: [dirtyFile],
    activeTabId: 'tab-3',
    diffMode: true,
    onBack: () => console.log('Back'),
    onSave: (id) => console.log('Save', id),
    onDiscard: (id) => console.log('Discard', id),
  },
};

export const ReadOnly: Story = {
  args: {
    tabs: [{ ...tsFile, readOnly: true }],
    activeTabId: 'tab-1',
    onBack: () => console.log('Back'),
  },
};

export const EmptyState: Story = {
  args: {
    tabs: [],
    activeTabId: '',
    onBack: () => console.log('Back'),
  },
};
