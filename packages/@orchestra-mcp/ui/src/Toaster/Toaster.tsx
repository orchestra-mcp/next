import './Toaster.css';
import { ToasterProvider, useToaster } from './ToasterContext';
import { ToasterItem } from './ToasterItem';
import type { ToastPosition } from './ToasterContext';

export interface ToasterProps {
  /** Position of the toast stack on screen */
  position?: ToastPosition;
  /** Maximum number of visible toasts */
  maxVisible?: number;
}

const ToasterContainer = ({
  position = 'top-right',
  maxVisible = 5,
}: ToasterProps) => {
  const { toasts, dismiss } = useToaster();
  const visible = toasts.slice(0, maxVisible);

  if (visible.length === 0) return null;

  return (
    <div className={`toaster toaster--${position}`} aria-label="Notifications">
      {visible.map((t) => (
        <ToasterItem
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          duration={t.duration}
          action={t.action}
          icon={t.icon}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};

/**
 * Toaster component. Wrap your app with this to enable toast notifications.
 * Use the `useToaster` hook to trigger toasts from anywhere.
 *
 * @example
 * ```tsx
 * <Toaster position="top-right" maxVisible={5}>
 *   <App />
 * </Toaster>
 * ```
 */
export const Toaster = ({
  position = 'top-right',
  maxVisible = 5,
  children,
}: ToasterProps & { children: React.ReactNode }) => {
  return (
    <ToasterProvider>
      {children}
      <ToasterContainer position={position} maxVisible={maxVisible} />
    </ToasterProvider>
  );
};
