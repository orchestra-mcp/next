import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { RadioGroup } from './RadioGroup';

/**
 * RadioGroup component for selecting one option from a set.
 * Supports vertical/horizontal layout, descriptions, error state,
 * and per-option disabled state. Themed via CSS custom properties.
 */
const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of radio options',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all radio options',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

export const Default: Story = {
  args: {
    options: basicOptions,
    value: 'react',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    await expect(radios).toHaveLength(3);
    await expect(radios[0]).toBeChecked();
  },
};

export const Horizontal: Story = {
  args: {
    options: basicOptions,
    value: 'vue',
    direction: 'horizontal',
  },
};

export const WithDescriptions: Story = {
  args: {
    options: [
      { value: 'free', label: 'Free', description: 'Basic features, no cost' },
      { value: 'pro', label: 'Pro', description: '$9/mo, advanced tools' },
      { value: 'team', label: 'Team', description: '$29/mo, collaboration' },
    ],
    value: 'pro',
  },
};

export const WithError: Story = {
  args: {
    options: basicOptions,
    error: 'Please select a framework',
  },
};

export const Disabled: Story = {
  args: {
    options: basicOptions,
    value: 'react',
    disabled: true,
  },
};
