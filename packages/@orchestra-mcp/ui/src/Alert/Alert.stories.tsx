import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

/**
 * Alert component for inline banner messages.
 * - 4 variants: info, success, warning, error
 * - Optional title, dismissible, custom icon
 * - Theme-aware via CSS custom properties
 * - Compact/modern layout variants via toolbar
 */
const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    dismissible: { control: 'boolean' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational alert message.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review before proceeding.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
  },
};

export const WithTitle: Story = {
  args: {
    variant: 'info',
    title: 'Did you know?',
    children: 'You can add a bold title above the message body.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Heads up',
    children: 'This alert can be dismissed with the X button.',
    dismissible: true,
  },
};

export const AllVariants: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Alert variant="info" title="Info">Informational message.</Alert>
      <Alert variant="success" title="Success">Action completed.</Alert>
      <Alert variant="warning" title="Warning">Proceed with caution.</Alert>
      <Alert variant="error" title="Error">Something failed.</Alert>
    </div>
  ),
};
