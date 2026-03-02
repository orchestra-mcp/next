import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Select } from './Select';

const fruitOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];

/**
 * Select component with theme and variant support:
 * - 25 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - Placeholder, error, and disabled states
 * - Custom chevron indicator
 */
const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no value selected',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable select interaction',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below select',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: fruitOptions,
    value: 'banana',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await expect(select).toBeInTheDocument();
  },
};

export const WithPlaceholder: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Choose a fruit...',
  },
};

export const WithError: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Choose a fruit...',
    error: 'Please select a fruit',
  },
};

export const Disabled: Story = {
  args: {
    options: fruitOptions,
    value: 'cherry',
    disabled: true,
  },
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 20 }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Option ${i + 1}`,
    })),
    placeholder: 'Select an option...',
  },
};
