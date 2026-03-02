import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    // Reset body overflow style before each test
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Clean up any remaining modals
    document.body.style.overflow = '';
  });

  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  it('displays title correctly when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="My Modal Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText(/my modal title/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /my modal title/i })).toBeInTheDocument();
  });

  it('renders children content correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <div>
          <h3>Custom Content</h3>
          <p>This is a paragraph</p>
          <button>Action</button>
        </div>
      </Modal>
    );
    expect(screen.getByText(/custom content/i)).toBeInTheDocument();
    expect(screen.getByText(/this is a paragraph/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked and closeOnOverlayClick is true', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" closeOnOverlayClick={true}>
        <p>Content</p>
      </Modal>
    );
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" closeOnOverlayClick={false}>
        <p>Content</p>
      </Modal>
    );
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside modal content', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    const modalContent = screen.getByRole('dialog');
    fireEvent.click(modalContent);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when ESC key is pressed and closeOnEsc is true', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" closeOnEsc={true}>
        <p>Content</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when ESC key is pressed and closeOnEsc is false', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal" closeOnEsc={false}>
        <p>Content</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders small size modal with correct CSS class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Small Modal" size="small">
        <p>Content</p>
      </Modal>
    );
    const modal = document.body.querySelector('.modal');
    expect(modal).toHaveClass('modal', 'modal--small');
  });

  it('renders medium size modal with correct CSS class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Medium Modal" size="medium">
        <p>Content</p>
      </Modal>
    );
    const modal = document.body.querySelector('.modal');
    expect(modal).toHaveClass('modal', 'modal--medium');
  });

  it('renders large size modal with correct CSS class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Large Modal" size="large">
        <p>Content</p>
      </Modal>
    );
    const modal = document.body.querySelector('.modal');
    expect(modal).toHaveClass('modal', 'modal--large');
  });

  it('uses medium size as default when size prop is not provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Default Modal">
        <p>Content</p>
      </Modal>
    );
    const modal = document.body.querySelector('.modal');
    expect(modal).toHaveClass('modal--medium');
  });

  it('applies correct accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Accessible Modal">
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('tabIndex', '-1');
  });

  it('renders without title header when title prop is not provided', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Content without title</p>
      </Modal>
    );
    const modalHeader = container.querySelector('.modal-header');
    expect(modalHeader).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('prevents body scroll when modal is open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Modal — sideover variant', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders with sideover overlay and dialog classes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sideover">
        <p>Sideover content</p>
      </Modal>
    );
    const overlay = document.body.querySelector('.modal-overlay');
    expect(overlay).toHaveClass('modal-overlay--sideover');
    const dialog = document.body.querySelector('.modal');
    expect(dialog).toHaveClass('modal--variant-sideover');
  });

  it('always shows close button even without title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sideover">
        <p>No title</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    const header = document.body.querySelector('.modal-header');
    expect(header).toBeInTheDocument();
  });

  it('shows header with title when title provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sideover" title="Panel Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('heading', { name: /panel title/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
  });

  it('does not apply size class to sideover', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sideover" size="large">
        <p>Content</p>
      </Modal>
    );
    const dialog = document.body.querySelector('.modal');
    expect(dialog).not.toHaveClass('modal--large');
    expect(dialog).toHaveClass('modal--variant-sideover');
  });

  it('fires onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} variant="sideover">
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('supports overlay click to close', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} variant="sideover" closeOnOverlayClick={true}>
        <p>Content</p>
      </Modal>
    );
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

describe('Modal — sheet variant', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders with sheet overlay and dialog classes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sheet">
        <p>Sheet content</p>
      </Modal>
    );
    const overlay = document.body.querySelector('.modal-overlay');
    expect(overlay).toHaveClass('modal-overlay--sheet');
    const dialog = document.body.querySelector('.modal');
    expect(dialog).toHaveClass('modal--variant-sheet');
  });

  it('does not apply size class to sheet', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sheet" size="small">
        <p>Content</p>
      </Modal>
    );
    const dialog = document.body.querySelector('.modal');
    expect(dialog).not.toHaveClass('modal--small');
    expect(dialog).toHaveClass('modal--variant-sheet');
  });

  it('renders with role="dialog" (not alertdialog)', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sheet">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not show header when no title provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="sheet">
        <p>Content</p>
      </Modal>
    );
    const header = document.body.querySelector('.modal-header');
    expect(header).not.toBeInTheDocument();
  });
});

describe('Modal — confirm variant', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders with role="alertdialog"', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm" title="Confirm Action">
        <p>Are you sure?</p>
      </Modal>
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders icon strip with color class when icon provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        variant="confirm"
        icon={<span data-testid="test-icon">!</span>}
        color="danger"
      >
        <p>Content</p>
      </Modal>
    );
    const iconStrip = document.body.querySelector('.modal-icon-strip');
    expect(iconStrip).toBeInTheDocument();
    expect(iconStrip).toHaveClass('modal-icon-strip--danger');
  });

  it('renders icon with aria-hidden="true"', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        variant="confirm"
        icon={<span data-testid="test-icon">!</span>}
        color="warning"
      >
        <p>Content</p>
      </Modal>
    );
    const iconWrapper = document.body.querySelector('.modal-icon-strip__icon');
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders confirm footer with cancel and confirm buttons', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm">
        <p>Content</p>
      </Modal>
    );
    const footer = document.body.querySelector('.modal-footer');
    expect(footer).toBeInTheDocument();
    const cancelBtn = document.body.querySelector('.modal-footer__cancel');
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).toHaveTextContent('Cancel');
    const confirmBtn = document.body.querySelector('.modal-footer__confirm');
    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn).toHaveTextContent('Confirm');
  });

  it('uses custom confirmLabel and cancelLabel', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        variant="confirm"
        confirmLabel="Delete"
        cancelLabel="Keep"
      >
        <p>Content</p>
      </Modal>
    );
    const cancelBtn = document.body.querySelector('.modal-footer__cancel');
    expect(cancelBtn).toHaveTextContent('Keep');
    const confirmBtn = document.body.querySelector('.modal-footer__confirm');
    expect(confirmBtn).toHaveTextContent('Delete');
  });

  it('fires onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm" onConfirm={handleConfirm}>
        <p>Content</p>
      </Modal>
    );
    const confirmBtn = document.body.querySelector('.modal-footer__confirm') as HTMLButtonElement;
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when cancel button clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} variant="confirm">
        <p>Content</p>
      </Modal>
    );
    const cancelBtn = document.body.querySelector('.modal-footer__cancel') as HTMLButtonElement;
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner and disables confirm button when loading', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm" loading={true}>
        <p>Content</p>
      </Modal>
    );
    const confirmBtn = document.body.querySelector('.modal-footer__confirm') as HTMLButtonElement;
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn).toHaveAttribute('aria-busy', 'true');
    const spinner = document.body.querySelector('.modal-footer__spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders title as centered text without header', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm" title="Delete Project?">
        <p>This cannot be undone.</p>
      </Modal>
    );
    const header = document.body.querySelector('.modal-header');
    expect(header).not.toBeInTheDocument();
    const confirmTitle = document.body.querySelector('.modal-confirm-title');
    expect(confirmTitle).toBeInTheDocument();
    expect(confirmTitle).toHaveTextContent('Delete Project?');
  });

  it('applies size class to confirm variant', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} variant="confirm" size="large">
        <p>Content</p>
      </Modal>
    );
    const dialog = document.body.querySelector('.modal');
    expect(dialog).toHaveClass('modal--large');
    expect(dialog).toHaveClass('modal--variant-confirm');
  });
});

describe('Modal — backward compat', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('defaults to center variant with role="dialog" and size class', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Default Modal" size="small">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const dialog = document.body.querySelector('.modal');
    expect(dialog).toHaveClass('modal--variant-center');
    expect(dialog).toHaveClass('modal--small');
  });

  it('center variant without title still has no header', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    const header = document.body.querySelector('.modal-header');
    expect(header).not.toBeInTheDocument();
    const dialog = document.body.querySelector('.modal');
    expect(dialog).toHaveClass('modal--variant-center');
  });
});
