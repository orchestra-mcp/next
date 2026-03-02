import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import { Input } from './Input';

/**
 * Input component demonstrates theme and variant system:
 * - 25 color themes via toolbar dropdown (affects border, focus states)
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - 5 input types: text, password, email, number, search
 * - 3 sizes: small, medium, large
 * - States: disabled, error, with helper text
 * - Full accessibility with labels and ARIA attributes
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'search'],
      description: 'Input type (HTML input type attribute)',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Input size affecting padding and font size',
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
    },
    value: {
      control: 'text',
      description: 'Controlled input value',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input interaction',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below input (hidden when error is present)',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input with label and placeholder
 */
export const Text: Story = {
  args: {
    variant: 'text',
    label: 'Username',
    placeholder: 'Enter your username',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass('input', 'input--medium');
    await expect(input).toHaveAttribute('type', 'text');

    // Test typing interaction
    await userEvent.type(input, 'john_doe');
    await expect(input).toHaveValue('john_doe');
  },
};

/**
 * Password input type for secure text entry
 */
export const Password: Story = {
  args: {
    variant: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/password/i);
    await expect(input).toHaveAttribute('type', 'password');

    // Test password typing (should be masked)
    await userEvent.type(input, 'secret123');
    await expect(input).toHaveValue('secret123');
  },
};

/**
 * Email input type with built-in validation
 */
export const Email: Story = {
  args: {
    variant: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveAttribute('type', 'email');

    // Test email typing
    await userEvent.type(input, 'user@example.com');
    await expect(input).toHaveValue('user@example.com');
  },
};

/**
 * Number input type for numeric values
 */
export const Number: Story = {
  args: {
    variant: 'number',
    label: 'Age',
    placeholder: 'Enter your age',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton');
    await expect(input).toHaveAttribute('type', 'number');

    // Test number typing
    await userEvent.type(input, '25');
    await expect(input).toHaveValue(25);
  },
};

/**
 * Search input type for search functionality
 */
export const Search: Story = {
  args: {
    variant: 'search',
    label: 'Search',
    placeholder: 'Search for something...',
    size: 'medium',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    await expect(input).toHaveAttribute('type', 'search');

    // Test search typing
    await userEvent.type(input, 'query');
    await expect(input).toHaveValue('query');
  },
};

/**
 * Small size input
 */
export const Small: Story = {
  args: {
    variant: 'text',
    label: 'Small Input',
    placeholder: 'Small size',
    size: 'small',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveClass('input--small');
  },
};

/**
 * Medium size input (default)
 */
export const Medium: Story = {
  args: {
    variant: 'text',
    label: 'Medium Input',
    placeholder: 'Medium size',
    size: 'medium',
  },
};

/**
 * Large size input
 */
export const Large: Story = {
  args: {
    variant: 'text',
    label: 'Large Input',
    placeholder: 'Large size',
    size: 'large',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveClass('input--large');
  },
};

/**
 * Disabled input state (non-interactive)
 */
export const Disabled: Story = {
  args: {
    variant: 'text',
    label: 'Disabled Input',
    placeholder: 'Cannot type here',
    size: 'medium',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toBeDisabled();

    // Verify typing is prevented
    await userEvent.type(input, 'test');
    await expect(input).toHaveValue('');
  },
};

/**
 * Input with error state and message
 */
export const Error: Story = {
  args: {
    variant: 'text',
    label: 'Email Address',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    size: 'medium',
    error: 'Please enter a valid email address',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveClass('input--error');

    const errorText = canvas.getByText(/please enter a valid email/i);
    await expect(errorText).toBeInTheDocument();
    await expect(errorText).toHaveClass('input-error-text');
  },
};

/**
 * Input with helper text
 */
export const WithHelper: Story = {
  args: {
    variant: 'text',
    label: 'Username',
    placeholder: 'Choose a username',
    size: 'medium',
    helperText: 'Must be 3-20 characters, alphanumeric only',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helperText = canvas.getByText(/must be 3-20 characters/i);
    await expect(helperText).toBeInTheDocument();
    await expect(helperText).toHaveClass('input-helper-text');
  },
};

/**
 * Input with helper text that changes to error on validation
 */
export const HelperToError: Story = {
  args: {
    variant: 'text',
    label: 'Username',
    placeholder: 'Choose a username',
    value: 'ab',
    size: 'medium',
    helperText: 'Must be 3-20 characters',
    error: 'Username is too short',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Error should be visible
    const errorText = canvas.getByText(/username is too short/i);
    await expect(errorText).toBeInTheDocument();

    // Helper text should be hidden when error is present
    const helperText = canvas.queryByText(/must be 3-20 characters/i);
    await expect(helperText).not.toBeInTheDocument();
  },
};

/**
 * All input type variants side by side
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
      <Input variant="text" label="Text" placeholder="Text input" />
      <Input variant="password" label="Password" placeholder="Password input" />
      <Input variant="email" label="Email" placeholder="email@example.com" />
      <Input variant="number" label="Number" placeholder="Enter number" />
      <Input variant="search" label="Search" placeholder="Search..." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all 5 input types are rendered
    await expect(canvas.getByLabelText(/^text$/i)).toHaveAttribute('type', 'text');
    await expect(canvas.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    await expect(canvas.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    await expect(canvas.getByLabelText(/number/i)).toHaveAttribute('type', 'number');
    await expect(canvas.getByLabelText(/search/i)).toHaveAttribute('type', 'search');
  },
};

/**
 * All input sizes side by side
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
      <Input size="small" label="Small" placeholder="Small input" />
      <Input size="medium" label="Medium" placeholder="Medium input" />
      <Input size="large" label="Large" placeholder="Large input" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all 3 sizes are rendered with correct classes
    const smallInput = canvas.getByPlaceholderText(/small input/i);
    const mediumInput = canvas.getByPlaceholderText(/medium input/i);
    const largeInput = canvas.getByPlaceholderText(/large input/i);

    await expect(smallInput).toHaveClass('input--small');
    await expect(mediumInput).toHaveClass('input--medium');
    await expect(largeInput).toHaveClass('input--large');
  },
};

/**
 * All input states demonstrated
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
      <Input label="Default" placeholder="Default state" />
      <Input label="Disabled" placeholder="Disabled state" disabled />
      <Input label="Error" value="invalid" error="This field has an error" />
      <Input label="With Helper" placeholder="Type here" helperText="This is helpful information" />
      <Input label="Focused" placeholder="Click to focus" value="Has value" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify disabled state
    const disabledInput = canvas.getByPlaceholderText(/disabled state/i);
    await expect(disabledInput).toBeDisabled();

    // Verify error state
    const errorInput = canvas.getByDisplayValue(/invalid/i);
    await expect(errorInput).toHaveClass('input--error');
    await expect(canvas.getByText(/this field has an error/i)).toBeInTheDocument();

    // Verify helper text
    await expect(canvas.getByText(/this is helpful information/i)).toBeInTheDocument();
  },
};

/**
 * Form example with multiple inputs
 */
export const FormExample: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '400px' }}>
      <Input
        variant="text"
        label="Full Name"
        placeholder="John Doe"
        helperText="Enter your first and last name"
      />
      <Input
        variant="email"
        label="Email Address"
        placeholder="you@example.com"
        helperText="We'll never share your email"
      />
      <Input
        variant="password"
        label="Password"
        placeholder="Create a password"
        helperText="At least 8 characters"
      />
      <Input
        variant="number"
        label="Age"
        placeholder="25"
      />
      <Input
        variant="search"
        label="Search Tags"
        placeholder="Type to search..."
      />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test full form interaction
    const nameInput = canvas.getByLabelText(/full name/i);
    const emailInput = canvas.getByLabelText(/email address/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const ageInput = canvas.getByLabelText(/age/i);
    const searchInput = canvas.getByLabelText(/search tags/i);

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(ageInput, '30');
    await userEvent.type(searchInput, 'react');

    await expect(nameInput).toHaveValue('John Doe');
    await expect(emailInput).toHaveValue('john@example.com');
    await expect(passwordInput).toHaveValue('password123');
    await expect(ageInput).toHaveValue(30);
    await expect(searchInput).toHaveValue('react');
  },
};
