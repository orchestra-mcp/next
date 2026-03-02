import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './TagInput';

/**
 * TagInput renders inline tag chips with autocomplete support.
 * - Add tags with Enter or comma
 * - Remove with X button or Backspace
 * - Optional suggestions dropdown, max tags, duplicate prevention
 */
const meta = {
  title: 'UI/TagInput',
  component: TagInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    tags: { control: 'object', description: 'Current tags array' },
    maxTags: { control: 'number', description: 'Maximum tags allowed' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    allowDuplicates: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '360px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wrapper to make TagInput stateful in stories */
const StatefulTagInput = (props: Partial<React.ComponentProps<typeof TagInput>>) => {
  const [tags, setTags] = useState(props.tags ?? []);
  return <TagInput {...props} tags={tags} onChange={setTags} />;
};

export const Empty: Story = {
  args: { tags: [], onChange: () => {} },
  render: () => <StatefulTagInput placeholder="Add a tag..." />,
};

export const WithTags: Story = {
  args: { tags: ['React', 'TypeScript', 'Zustand'], onChange: () => {} },
  render: () => (
    <StatefulTagInput tags={['React', 'TypeScript', 'Zustand']} />
  ),
};

export const WithSuggestions: Story = {
  args: { tags: [], onChange: () => {}, suggestions: [] },
  render: () => (
    <StatefulTagInput
      tags={['React']}
      suggestions={['Redux', 'Router', 'Query', 'Native', 'Vue', 'Svelte']}
      placeholder="Type to see suggestions..."
    />
  ),
};

export const MaxReached: Story = {
  args: { tags: ['one', 'two', 'three'], onChange: () => {}, maxTags: 3 },
  render: () => (
    <StatefulTagInput tags={['one', 'two', 'three']} maxTags={3} />
  ),
};

export const Disabled: Story = {
  args: { tags: ['locked', 'tags'], onChange: () => {}, disabled: true },
  render: () => (
    <StatefulTagInput tags={['locked', 'tags']} disabled />
  ),
};
