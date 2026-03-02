"use client";

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export interface ModalProps {
  /**
   * Controls modal visibility
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal header title
   */
  title?: string;
  /**
   * Modal content
   */
  children: ReactNode;
  /**
   * Modal size variant (applies to center and confirm variants only)
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Allow closing by clicking overlay
   */
  closeOnOverlayClick?: boolean;
  /**
   * Allow closing by pressing ESC
   */
  closeOnEsc?: boolean;
  /**
   * Layout variant: center (default dialog), sideover (slide-in panel),
   * sheet (bottom sheet), confirm (confirmation dialog with actions)
   */
  variant?: 'center' | 'sideover' | 'sheet' | 'confirm';
  /**
   * Icon rendered at the top of the confirm variant
   */
  icon?: ReactNode;
  /**
   * Color scheme for icon strip and confirm button
   */
  color?: 'info' | 'success' | 'warning' | 'danger';
  /**
   * Label for the confirm button (confirm variant)
   */
  confirmLabel?: string;
  /**
   * Label for the cancel button (confirm variant)
   */
  cancelLabel?: string;
  /**
   * Callback when the confirm button is clicked
   */
  onConfirm?: () => void;
  /**
   * Shows a loading spinner on the confirm button and disables it
   */
  loading?: boolean;
}

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 5L5 15M5 5L15 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  variant = 'center',
  icon,
  color,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeApplies = variant === 'center' || variant === 'confirm';
  const dialogClassName = [
    'modal',
    `modal--variant-${variant}`,
    sizeApplies ? `modal--${size}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const dialogRole = variant === 'confirm' ? 'alertdialog' : 'dialog';

  const showHeader = variant === 'sideover' || (variant !== 'confirm' && !!title);

  return createPortal(
    <div
      className={`modal-overlay modal-overlay--${variant}`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={dialogClassName}
        role={dialogRole}
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        <div className="modal-content">
          {variant === 'confirm' && icon && (
            <div className={`modal-icon-strip modal-icon-strip--${color ?? 'info'}`}>
              <span className="modal-icon-strip__icon" aria-hidden="true">
                {icon}
              </span>
            </div>
          )}
          {variant === 'confirm' && title && (
            <h2 id="modal-title" className="modal-confirm-title">
              {title}
            </h2>
          )}
          {showHeader && (
            <div className="modal-header">
              {title && (
                <h2 id="modal-title" className="modal-title">
                  {title}
                </h2>
              )}
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          )}
          <div className="modal-body">{children}</div>
          {variant === 'confirm' && (
            <div className="modal-footer">
              <button
                className="modal-footer__cancel"
                onClick={onClose}
              >
                {cancelLabel ?? 'Cancel'}
              </button>
              <button
                className={`modal-footer__confirm modal-footer__confirm--${color ?? 'info'}`}
                onClick={onConfirm}
                disabled={loading}
                aria-busy={loading || undefined}
              >
                {loading && (
                  <span className="modal-footer__spinner" aria-hidden="true" />
                )}
                {confirmLabel ?? 'Confirm'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
