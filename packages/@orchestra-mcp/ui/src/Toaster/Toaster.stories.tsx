import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './Toaster';
import { useToaster } from './ToasterContext';
import type { ToastType, ToastPosition } from './ToasterContext';

/** Button helper for triggering toasts in stories */
const TriggerButton = ({
  type, title, message, duration, actionLabel,
}: {
  type: ToastType; title: string; message?: string; duration?: number; actionLabel?: string;
}) => {
  const { toast } = useToaster();
  return (
    <button
      type="button"
      onClick={() => toast({
        type, title, message, duration,
        action: actionLabel ? { label: actionLabel, onClick: () => {} } : undefined,
      })}
      style={{
        padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
        border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)',
      }}
    >
      Show {type}
    </button>
  );
};

const meta = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="success" title="Changes saved" message="All changes have been saved." />
      </div>
    </Toaster>
  ),
};

export const Error: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="error" title="Save failed" message="Could not save. Please try again." />
      </div>
    </Toaster>
  ),
};

export const Warning: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="warning" title="Disk space low" message="Less than 500MB remaining." />
      </div>
    </Toaster>
  ),
};

export const Info: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="info" title="New update" message="Version 2.1 is available." />
      </div>
    </Toaster>
  ),
};

export const Loading: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="loading" title="Deploying..." message="Build in progress." duration={0} />
      </div>
    </Toaster>
  ),
};

export const WithAction: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right">
      <div style={{ padding: 40 }}>
        <TriggerButton type="success" title="Item deleted" message="Removed from list." actionLabel="Undo" />
      </div>
    </Toaster>
  ),
};

export const Stacked: Story = {
  args: { children: null },
  render: () => (
    <Toaster position="top-right" maxVisible={5}>
      <div style={{ padding: 40, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <TriggerButton type="success" title="Success toast" />
        <TriggerButton type="error" title="Error toast" />
        <TriggerButton type="warning" title="Warning toast" />
        <TriggerButton type="info" title="Info toast" />
        <TriggerButton type="loading" title="Loading toast" duration={0} />
      </div>
    </Toaster>
  ),
};

export const Positions: Story = {
  args: { children: null },
  render: () => {
    const positions: ToastPosition[] = [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right',
    ];
    return (
      <div style={{ padding: 40 }}>
        <p style={{ color: 'var(--color-fg)', marginBottom: 12 }}>
          Each button opens a separate Toaster at a different position:
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {positions.map((pos) => (
            <Toaster key={pos} position={pos}>
              <TriggerButton type="info" title={pos} />
            </Toaster>
          ))}
        </div>
      </div>
    );
  },
};
