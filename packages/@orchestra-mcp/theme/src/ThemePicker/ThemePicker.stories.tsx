import type { Meta, StoryObj } from '@storybook/react';
import { ThemePicker } from './ThemePicker';

const meta: Meta<typeof ThemePicker> = {
  title: 'Theme/ThemePicker',
  component: ThemePicker,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithoutVariants: Story = {
  args: {
    showVariants: false,
  },
};

export const WithSearch: Story = {
  args: {
    searchQuery: 'dark',
  },
};

export const WithCallbacks: Story = {
  args: {
    onThemeChange: (id: string) => console.log('Theme changed:', id),
    onVariantChange: (v: string) => console.log('Variant changed:', v),
  },
};
