"use client";

import { useState, useCallback } from 'react';
import './Accordion.css';

export interface AccordionItem {
  /** Unique identifier for the item */
  id: string;
  /** Header text displayed in the clickable trigger */
  title: string;
  /** Content rendered when the item is expanded */
  content: React.ReactNode;
  /** Prevents toggling this item */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Array of accordion items to render */
  items: AccordionItem[];
  /** Allow multiple items open at once (default: false) */
  multiple?: boolean;
  /** Item IDs that start expanded */
  defaultOpen?: string[];
  /** Called with the array of currently open item IDs */
  onChange?: (openIds: string[]) => void;
  /** Additional CSS class on the root element */
  className?: string;
}

export const Accordion = ({
  items,
  multiple = false,
  defaultOpen = [],
  onChange,
  className,
}: AccordionProps) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        let next: string[];
        if (prev.includes(id)) {
          next = prev.filter((i) => i !== id);
        } else {
          next = multiple ? [...prev, id] : [id];
        }
        onChange?.(next);
        return next;
      });
    },
    [multiple, onChange],
  );

  return (
    <div className={`accordion${className ? ` ${className}` : ''}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const classes = [
          'accordion__item',
          isOpen ? 'accordion__item--open' : '',
          item.disabled ? 'accordion__item--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={item.id} className={classes}>
            <button
              type="button"
              className="accordion__header"
              aria-expanded={isOpen}
              disabled={item.disabled}
              onClick={() => toggle(item.id)}
            >
              <span className="accordion__title">{item.title}</span>
              <span className="accordion__chevron" aria-hidden="true" />
            </button>
            <div
              className="accordion__content"
              aria-hidden={!isOpen}
              role="region"
            >
              <div className="accordion__body">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
