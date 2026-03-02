import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

/**
 * Modal component demonstrates theme and variant system:
 * - 25 color themes via toolbar dropdown (affects overlay, borders, shadows)
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - 3 sizes: small, medium, large
 * - Full accessibility with ARIA attributes, focus management, and keyboard navigation
 * - Focus trap: Tab cycles through modal content only
 * - ESC key and overlay click to close (configurable)
 * - Body scroll lock when modal is open
 * - Automatic focus restoration on close
 */
const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Modal size affecting width and max-height',
    },
    title: {
      control: 'text',
      description: 'Modal header title (optional)',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Allow closing modal by clicking overlay backdrop',
    },
    closeOnEsc: {
      control: 'boolean',
      description: 'Allow closing modal by pressing ESC key',
    },
    variant: {
      control: 'select',
      options: ['center', 'sideover', 'sheet', 'confirm'],
      description: 'Layout variant for the modal',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive wrapper component for modal stories
 * Manages isOpen state and provides trigger button
 */
const ModalStoryWrapper = ({
  size = 'medium',
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  buttonLabel = 'Open Modal',
}: {
  size?: 'small' | 'medium' | 'large';
  title?: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  buttonLabel?: string;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Button
        label={buttonLabel}
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size={size}
        title={title}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
      >
        {children}
      </Modal>
    </div>
  );
};

/**
 * Small modal size
 */
export const Small: Story = {
  render: () => (
    <ModalStoryWrapper size="small" title="Small Modal" buttonLabel="Open Small Modal">
      <p>This is a small modal with minimal content.</p>
      <p>Perfect for simple confirmations or alerts.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open small modal/i });

    // Click to open modal
    await userEvent.click(openButton);

    // Wait for modal to appear in document.body
    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('modal', 'modal--small');
    });

    // Verify title using more specific selector
    const modal = within(document.body).getByRole('dialog');
    const title = within(modal).getByText('Small Modal');
    await expect(title).toBeInTheDocument();
    await expect(title).toHaveClass('modal-title');

    // Close modal by clicking close button
    const closeButton = within(document.body).getByRole('button', { name: /close modal/i });
    await userEvent.click(closeButton);

    // Verify modal is removed
    await waitFor(() => {
      const modal = within(document.body).queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  },
};

/**
 * Medium modal size (default)
 */
export const Medium: Story = {
  render: () => (
    <ModalStoryWrapper size="medium" title="Medium Modal" buttonLabel="Open Medium Modal">
      <p>This is a medium modal with standard content.</p>
      <p>The most commonly used modal size for general purposes.</p>
      <p>It provides a good balance between space and user focus.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open medium modal/i });

    await userEvent.click(openButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toHaveClass('modal', 'modal--medium');
    });
  },
};

/**
 * Large modal size
 */
export const Large: Story = {
  render: () => (
    <ModalStoryWrapper size="large" title="Large Modal" buttonLabel="Open Large Modal">
      <p>This is a large modal with extensive content.</p>
      <p>Use large modals when you need to display:</p>
      <ul>
        <li>Forms with many fields</li>
        <li>Detailed information or documentation</li>
        <li>Data tables or complex visualizations</li>
        <li>Multi-step wizards or workflows</li>
      </ul>
      <p>The larger size ensures content doesn't feel cramped.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open large modal/i });

    await userEvent.click(openButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toHaveClass('modal', 'modal--large');
    });
  },
};

/**
 * Modal with title and close button
 */
export const WithTitle: Story = {
  render: () => (
    <ModalStoryWrapper size="medium" title="Modal Title" buttonLabel="Open With Title">
      <p>This modal has a title in the header.</p>
      <p>The title helps users understand the modal's purpose.</p>
      <p>A close button (X) is automatically shown in the header.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open with title/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      // Verify title is present and accessible
      const title = within(document.body).getByText(/modal title/i);
      await expect(title).toBeInTheDocument();
      await expect(title).toHaveAttribute('id', 'modal-title');

      // Verify modal is labeled by title
      const modal = within(document.body).getByRole('dialog');
      await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

      // Verify close button is present
      const closeButton = within(document.body).getByRole('button', { name: /close modal/i });
      await expect(closeButton).toBeInTheDocument();
    });
  },
};

/**
 * Modal without title (header-less)
 */
export const WithoutTitle: Story = {
  render: () => (
    <ModalStoryWrapper size="medium" buttonLabel="Open Without Title">
      <h3 style={{ marginTop: 0 }}>Custom Content Header</h3>
      <p>This modal has no title prop, so no header is rendered.</p>
      <p>You can include custom headers in the content if needed.</p>
      <p>Close by clicking overlay or pressing ESC.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open without title/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      const modal = within(document.body).getByRole('dialog');
      await expect(modal).toBeInTheDocument();

      // Verify no title header exists
      const modalTitle = within(document.body).queryByRole('heading', { level: 2 });
      await expect(modalTitle).not.toBeInTheDocument();

      // Modal should not have aria-labelledby
      await expect(modal).not.toHaveAttribute('aria-labelledby');

      // Custom content header should be present
      const customHeader = within(document.body).getByText(/custom content header/i);
      await expect(customHeader).toBeInTheDocument();
    });
  },
};

/**
 * Modal with long scrollable content
 */
export const LongContent: Story = {
  render: () => (
    <ModalStoryWrapper size="medium" title="Long Content Modal" buttonLabel="Open Long Content">
      <h3>Introduction</h3>
      <p>This modal contains long content that exceeds the viewport height.</p>
      <p>The modal body becomes scrollable while the header remains fixed.</p>

      <h3>Section 1</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

      <h3>Section 2</h3>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

      <h3>Section 3</h3>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

      <h3>Section 4</h3>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
      <p>Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

      <h3>Conclusion</h3>
      <p>This demonstrates how the modal handles overflow content gracefully.</p>
      <p>The body scrolls while maintaining the header position.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open long content/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      const modal = within(document.body).getByRole('dialog');
      await expect(modal).toBeInTheDocument();

      // Verify multiple sections are present
      const section1 = within(document.body).getByText(/section 1/i);
      const section4 = within(document.body).getByText(/section 4/i);
      await expect(section1).toBeInTheDocument();
      await expect(section4).toBeInTheDocument();
    });
  },
};

/**
 * Modal with nested interactive content (form)
 */
export const NestedContent: Story = {
  render: () => (
    <ModalStoryWrapper size="medium" title="User Settings" buttonLabel="Open Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '8px' }}>
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div>
          <label htmlFor="bio" style={{ display: 'block', marginBottom: '8px' }}>
            Bio
          </label>
          <textarea
            id="bio"
            placeholder="Tell us about yourself"
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open settings/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      // Verify form elements are present and focusable
      const usernameInput = within(document.body).getByLabelText(/username/i);
      const emailInput = within(document.body).getByLabelText(/email/i);
      const bioTextarea = within(document.body).getByLabelText(/bio/i);

      await expect(usernameInput).toBeInTheDocument();
      await expect(emailInput).toBeInTheDocument();
      await expect(bioTextarea).toBeInTheDocument();

      // Test typing in form fields
      await userEvent.type(usernameInput, 'john_doe');
      await expect(usernameInput).toHaveValue('john_doe');

      await userEvent.type(emailInput, 'john@example.com');
      await expect(emailInput).toHaveValue('john@example.com');

      // Verify action buttons
      const cancelButton = within(document.body).getByRole('button', { name: /cancel/i });
      const saveButton = within(document.body).getByRole('button', { name: /save changes/i });
      await expect(cancelButton).toBeInTheDocument();
      await expect(saveButton).toBeInTheDocument();
    });
  },
};

/**
 * Modal demonstrating form submission workflow
 */
export const FormModal: Story = {
  render: () => {
    const [submitted, setSubmitted] = React.useState(false);

    return (
      <ModalStoryWrapper
        size="medium"
        title={submitted ? 'Success!' : 'Contact Form'}
        buttonLabel="Open Contact Form"
      >
        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '8px' }}>
                Name *
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <div>
              <label htmlFor="message" style={{ display: 'block', marginBottom: '8px' }}>
                Message *
              </label>
              <textarea
                id="message"
                required
                placeholder="Your message"
                rows={5}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '8px 24px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}
            >
              ✓
            </div>
            <h3 style={{ marginBottom: '8px' }}>Form Submitted!</h3>
            <p>Thank you for your message. We'll get back to you soon.</p>
          </div>
        )}
      </ModalStoryWrapper>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open contact form/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      const nameInput = within(document.body).getByLabelText(/name \*/i);
      const messageTextarea = within(document.body).getByLabelText(/message \*/i);

      // Fill out form
      await userEvent.type(nameInput, 'Jane Smith');
      await userEvent.type(messageTextarea, 'This is a test message.');

      await expect(nameInput).toHaveValue('Jane Smith');
      await expect(messageTextarea).toHaveValue('This is a test message.');

      // Submit form
      const submitButton = within(document.body).getByRole('button', { name: /submit/i });
      await userEvent.click(submitButton);

      // Verify success message appears
      await waitFor(() => {
        const successMessage = within(document.body).getByText(/form submitted!/i);
        expect(successMessage).toBeInTheDocument();
      });
    });
  },
};

/**
 * Modal with ESC key close interaction test
 */
export const EscKeyClose: Story = {
  render: () => (
    <ModalStoryWrapper
      size="medium"
      title="Press ESC to Close"
      buttonLabel="Test ESC Key"
      closeOnEsc={true}
    >
      <p>This modal can be closed by pressing the ESC key.</p>
      <p>Try it: Press ESC on your keyboard.</p>
      <p>The modal will close and focus will return to the trigger button.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /test esc key/i });

    await userEvent.click(openButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    // Press ESC key to close
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      const modal = within(document.body).queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  },
};

/**
 * Modal with overlay click close interaction test
 */
export const OverlayClickClose: Story = {
  render: () => (
    <ModalStoryWrapper
      size="medium"
      title="Click Overlay to Close"
      buttonLabel="Test Overlay Click"
      closeOnOverlayClick={true}
    >
      <p>This modal can be closed by clicking the dark overlay backdrop.</p>
      <p>Try it: Click outside this modal on the dark area.</p>
      <p>The modal will close immediately.</p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /test overlay click/i });

    await userEvent.click(openButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    // Click overlay to close (find element with role="presentation")
    const overlay = within(document.body).getByRole('presentation');
    await userEvent.click(overlay);

    await waitFor(() => {
      const modal = within(document.body).queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  },
};

/**
 * Modal that cannot be closed by ESC or overlay click
 */
export const NoEasyClose: Story = {
  render: () => (
    <ModalStoryWrapper
      size="medium"
      title="Required Action"
      buttonLabel="Open Required Modal"
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <p>This modal requires explicit action to close.</p>
      <p>ESC key and overlay clicks are disabled.</p>
      <p>You must click the close button (X) to dismiss it.</p>
      <p style={{ marginTop: '16px', fontStyle: 'italic', color: '#666' }}>
        Use this pattern for critical confirmations or required user actions.
      </p>
    </ModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open required modal/i });

    await userEvent.click(openButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    // Try ESC key (should not close)
    await userEvent.keyboard('{Escape}');
    const modalAfterEsc = within(document.body).queryByRole('dialog');
    await expect(modalAfterEsc).toBeInTheDocument();

    // Try overlay click (should not close)
    const overlay = within(document.body).getByRole('presentation');
    await userEvent.click(overlay);
    const modalAfterOverlay = within(document.body).queryByRole('dialog');
    await expect(modalAfterOverlay).toBeInTheDocument();

    // Must use close button
    const closeButton = within(document.body).getByRole('button', { name: /close modal/i });
    await userEvent.click(closeButton);

    await waitFor(() => {
      const modalAfterClose = within(document.body).queryByRole('dialog');
      expect(modalAfterClose).not.toBeInTheDocument();
    });
  },
};

/**
 * All modal sizes side by side comparison
 */
export const AllSizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = React.useState<'small' | 'medium' | 'large' | null>(null);

    return (
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button label="Small" variant="primary" onClick={() => setOpenModal('small')} />
        <Button label="Medium" variant="primary" onClick={() => setOpenModal('medium')} />
        <Button label="Large" variant="primary" onClick={() => setOpenModal('large')} />

        <Modal
          isOpen={openModal === 'small'}
          onClose={() => setOpenModal(null)}
          size="small"
          title="Small Modal"
        >
          <p>This is a small modal.</p>
          <p>Compact size for simple content.</p>
        </Modal>

        <Modal
          isOpen={openModal === 'medium'}
          onClose={() => setOpenModal(null)}
          size="medium"
          title="Medium Modal"
        >
          <p>This is a medium modal.</p>
          <p>Standard size for most use cases.</p>
          <p>Provides balanced space and focus.</p>
        </Modal>

        <Modal
          isOpen={openModal === 'large'}
          onClose={() => setOpenModal(null)}
          size="large"
          title="Large Modal"
        >
          <p>This is a large modal.</p>
          <p>Spacious size for complex content.</p>
          <p>Use for forms, tables, and detailed information.</p>
          <p>Ensures content doesn't feel cramped.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test small modal
    const smallButton = canvas.getByRole('button', { name: /^small$/i });
    await userEvent.click(smallButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toHaveClass('modal--small');
    });

    const closeButton1 = within(document.body).getByRole('button', { name: /close modal/i });
    await userEvent.click(closeButton1);

    // Test medium modal
    const mediumButton = canvas.getByRole('button', { name: /^medium$/i });
    await userEvent.click(mediumButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toHaveClass('modal--medium');
    });

    const closeButton2 = within(document.body).getByRole('button', { name: /close modal/i });
    await userEvent.click(closeButton2);

    // Test large modal
    const largeButton = canvas.getByRole('button', { name: /^large$/i });
    await userEvent.click(largeButton);

    await waitFor(() => {
      const modal = within(document.body).getByRole('dialog');
      expect(modal).toHaveClass('modal--large');
    });
  },
};

/**
 * Interactive wrapper for variant stories (sideover, sheet, confirm).
 * Accepts all new Modal props while keeping backward compatibility.
 */
const VariantModalStoryWrapper = ({
  size = 'medium',
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  buttonLabel = 'Open Modal',
  variant,
  icon,
  color,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading,
}: {
  size?: 'small' | 'medium' | 'large';
  title?: string;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  buttonLabel?: string;
  variant?: 'center' | 'sideover' | 'sheet' | 'confirm';
  icon?: React.ReactNode;
  color?: 'info' | 'success' | 'warning' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Button
        label={buttonLabel}
        variant="primary"
        onClick={() => setIsOpen(true)}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size={size}
        title={title}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        variant={variant}
        icon={icon}
        color={color}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm ?? (() => setIsOpen(false))}
        loading={loading}
      >
        {children}
      </Modal>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sideover stories
// ---------------------------------------------------------------------------

/**
 * Sideover variant — slides in from the right as a settings panel
 */
export const SideoverDefault: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sideover"
      title="Settings Panel"
      buttonLabel="Open Sideover"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark Mode</span>
          <input type="checkbox" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Notifications</span>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Auto-save</span>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Sideover variant without a title — close button should still be visible
 */
export const SideoverNoTitle: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sideover"
      buttonLabel="Open Sideover (No Title)"
    >
      <p>This sideover has no title, but the close button should still appear.</p>
    </VariantModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open sideover \(no title\)/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      const modal = within(document.body).getByRole('dialog');
      await expect(modal).toBeInTheDocument();

      // Close button should be visible even without a title
      const closeButton = within(document.body).getByRole('button', { name: /close modal/i });
      await expect(closeButton).toBeInTheDocument();
    });
  },
};

/**
 * Sideover variant with long scrollable content
 */
export const SideoverLongContent: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sideover"
      title="Details"
      buttonLabel="Open Long Sideover"
    >
      <h3>Overview</h3>
      <p>This sideover contains long content to demonstrate scrolling behavior.</p>

      <h3>Section 1</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

      <h3>Section 2</h3>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

      <h3>Section 3</h3>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>

      <h3>Section 4</h3>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
      <p>Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

      <h3>Conclusion</h3>
      <p>This demonstrates how the sideover handles overflow content gracefully with internal scrolling.</p>
    </VariantModalStoryWrapper>
  ),
};

// ---------------------------------------------------------------------------
// Sheet stories
// ---------------------------------------------------------------------------

/**
 * Sheet variant — slides up from the bottom with quick actions
 */
export const SheetDefault: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sheet"
      title="Quick Actions"
      buttonLabel="Open Sheet"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button type="button" style={{ padding: '12px', textAlign: 'left', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
          New File
        </button>
        <button type="button" style={{ padding: '12px', textAlign: 'left', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
          New Folder
        </button>
        <button type="button" style={{ padding: '12px', textAlign: 'left', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
          Import Project
        </button>
        <button type="button" style={{ padding: '12px', textAlign: 'left', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
          Open Terminal
        </button>
      </div>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Sheet variant without a title
 */
export const SheetNoTitle: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sheet"
      buttonLabel="Open Sheet (No Title)"
    >
      <p>A minimal bottom sheet with no title, just content.</p>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Sheet variant with long scrollable content
 */
export const SheetLongContent: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="sheet"
      title="Comments"
      buttonLabel="Open Comments Sheet"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '4px' }}>
            <strong>User {i + 1}</strong>
            <p style={{ margin: '4px 0 0' }}>
              This is comment number {i + 1}. It contains some feedback about the current project status and suggestions for improvement.
            </p>
          </div>
        ))}
      </div>
    </VariantModalStoryWrapper>
  ),
};

// ---------------------------------------------------------------------------
// Confirm stories
// ---------------------------------------------------------------------------

/**
 * Confirm variant — danger color for destructive actions
 */
export const ConfirmDanger: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="confirm"
      title="Delete Project?"
      color="danger"
      icon={<span style={{ fontSize: 24 }}>&#9888;</span>}
      confirmLabel="Delete"
      cancelLabel="Keep"
      buttonLabel="Open Danger Confirm"
    >
      <p>This action is permanent and cannot be undone. All project data, files, and history will be permanently deleted.</p>
    </VariantModalStoryWrapper>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole('button', { name: /open danger confirm/i });

    await userEvent.click(openButton);

    await waitFor(async () => {
      // Verify the modal has alertdialog role
      const modal = within(document.body).getByRole('alertdialog');
      await expect(modal).toBeInTheDocument();

      // Verify confirm and cancel button labels
      const deleteButton = within(document.body).getByRole('button', { name: /^delete$/i });
      await expect(deleteButton).toBeInTheDocument();

      const keepButton = within(document.body).getByRole('button', { name: /^keep$/i });
      await expect(keepButton).toBeInTheDocument();
    });
  },
};

/**
 * Confirm variant — success color for publishing or deploying
 */
export const ConfirmSuccess: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="confirm"
      title="Publish Changes?"
      color="success"
      icon={<span style={{ fontSize: 24 }}>&#10003;</span>}
      confirmLabel="Publish"
      buttonLabel="Open Success Confirm"
    >
      <p>Your changes will be deployed to production immediately. All users will see the updated version.</p>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Confirm variant — warning color for unsaved changes
 */
export const ConfirmWarning: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="confirm"
      title="Unsaved Changes"
      color="warning"
      icon={<span style={{ fontSize: 24 }}>!</span>}
      confirmLabel="Discard"
      cancelLabel="Go Back"
      buttonLabel="Open Warning Confirm"
    >
      <p>You have unsaved changes that will be lost if you leave this page.</p>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Confirm variant — info color for enabling a feature
 */
export const ConfirmInfo: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="confirm"
      title="Enable Notifications?"
      color="info"
      icon={<span style={{ fontSize: 24 }}>&#128276;</span>}
      confirmLabel="Enable"
      buttonLabel="Open Info Confirm"
    >
      <p>You will receive notifications about project updates, comments, and mentions.</p>
    </VariantModalStoryWrapper>
  ),
};

/**
 * Confirm variant — loading state with disabled confirm button
 */
export const ConfirmLoading: Story = {
  render: () => (
    <VariantModalStoryWrapper
      variant="confirm"
      title="Processing..."
      color="info"
      loading={true}
      confirmLabel="Saving..."
      buttonLabel="Open Loading Confirm"
    >
      <p>An operation is currently in progress. Please wait while your changes are being saved.</p>
    </VariantModalStoryWrapper>
  ),
};
