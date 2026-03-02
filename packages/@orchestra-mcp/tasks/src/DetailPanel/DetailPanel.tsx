import { useEffect, useRef } from 'react';
import './DetailPanel.css';

export interface DetailField {
  label: string;
  value: string;
  color?: string;
}

export interface DetailPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Panel title */
  title: string;
  /** Subtitle (e.g. task ID) */
  subtitle?: string;
  /** Key-value fields shown at the top */
  fields?: DetailField[];
  /** Main content — description or markdown body */
  children?: React.ReactNode;
}

export const DetailPanel = ({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  children,
}: DetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="detail-overlay" onClick={onClose} role="presentation">
      <div
        ref={panelRef}
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-panel__header">
          <div className="detail-panel__titles">
            {subtitle && <span className="detail-panel__subtitle">{subtitle}</span>}
            <h2 className="detail-panel__title">{title}</h2>
          </div>
          <button
            type="button"
            className="detail-panel__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {fields && fields.length > 0 && (
          <div className="detail-panel__fields">
            {fields.map((f, i) => (
              <div key={i} className="detail-panel__field">
                <span className="detail-panel__field-label">{f.label}</span>
                <span
                  className="detail-panel__field-value"
                  style={f.color ? { color: f.color } : undefined}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-panel__body">
          {children}
        </div>
      </div>
    </div>
  );
};
