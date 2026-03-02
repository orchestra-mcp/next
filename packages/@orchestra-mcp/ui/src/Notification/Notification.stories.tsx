import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Notification } from './Notification';

const meta = {
  title: 'UI/Notification',
  component: Notification,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'],
    },
    duration: { control: 'number' },
  },
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    message: 'This is an informational notification',
    type: 'info',
    onClose: () => {},
  },
};

export const Success: Story = {
  args: {
    title: 'Success',
    message: 'Your changes have been saved successfully',
    type: 'success',
    onClose: () => {},
  },
};

export const Warning: Story = {
  args: {
    title: 'Warning',
    message: 'This action cannot be undone',
    type: 'warning',
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    title: 'Error',
    message: 'Failed to save changes. Please try again.',
    type: 'error',
    onClose: () => {},
  },
};

export const WithAction: Story = {
  args: {
    title: 'Item deleted',
    message: 'The item has been removed from your list',
    type: 'success',
    onClose: () => {},
    action: {
      label: 'Undo',
      onClick: () => {},
    },
  },
};

export const AutoDismiss: Story = {
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <div style={{ padding: 80 }}>
        {show ? (
          <Notification
            message="This notification will auto-dismiss in 3 seconds"
            type="info"
            duration={3000}
            onClose={() => setShow(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShow(true)}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-fg)', cursor: 'pointer' }}
          >
            Show Again
          </button>
        )}
      </div>
    );
  },
};

export const AllTypes: Story = {
  args: { message: '' },
  render: () => (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', minHeight: 400 }}>
      <Notification message="Info notification" type="info" position="top-left" onClose={() => {}} />
      <Notification title="Success" message="Operation completed" type="success" position="top-right" onClose={() => {}} />
      <Notification title="Warning" message="Proceed with caution" type="warning" position="bottom-left" onClose={() => {}} />
      <Notification title="Error" message="Something went wrong" type="error" position="bottom-right" onClose={() => {}} />
    </div>
  ),
};

export const NoAutoDismiss: Story = {
  args: {
    title: 'Important',
    message: 'This notification stays until manually closed',
    type: 'warning',
    duration: 0,
    onClose: () => {},
  },
};
