import type { Meta, StoryObj } from '@storybook/react';
import { PINInput } from './PINInput';

/**
 * PINInput renders a row of individual digit boxes for PIN/OTP entry.
 * Supports 4, 6, or 8 digit lengths, masked mode, error states,
 * paste handling, and auto-focus advancement.
 */
const meta = {
  title: 'UI/PINInput',
  component: PINInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: 'select',
      options: [4, 6, 8],
      description: 'Number of PIN digits',
    },
    masked: {
      control: 'boolean',
      description: 'Show dots instead of digits',
    },
    error: {
      control: 'boolean',
      description: 'Show error styling',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable all inputs',
    },
  },
} satisfies Meta<typeof PINInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourDigit: Story = {
  args: {
    length: 4,
    autoFocus: false,
  },
};

export const SixDigit: Story = {
  args: {
    length: 6,
    autoFocus: false,
  },
};

export const Masked: Story = {
  args: {
    length: 4,
    masked: true,
    autoFocus: false,
  },
};

export const WithError: Story = {
  args: {
    length: 4,
    error: true,
    errorMessage: 'Incorrect PIN. Please try again.',
    autoFocus: false,
  },
};

export const Disabled: Story = {
  args: {
    length: 4,
    disabled: true,
    autoFocus: false,
  },
};

export const EightDigit: Story = {
  args: {
    length: 8,
    autoFocus: false,
  },
};

/**
 * All PIN lengths side by side
 */
export const AllLengths: Story = {
  args: { length: 4 },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.7 }}>4-digit</div>
        <PINInput length={4} autoFocus={false} />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.7 }}>6-digit</div>
        <PINInput length={6} autoFocus={false} />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontSize: 13, opacity: 0.7 }}>8-digit</div>
        <PINInput length={8} autoFocus={false} />
      </div>
    </div>
  ),
};
