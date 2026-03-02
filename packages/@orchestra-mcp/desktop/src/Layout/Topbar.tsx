import type { ReactNode } from 'react';
import { ChevronRightIcon } from '@orchestra-mcp/icons';
import { Button } from '@orchestra-mcp/ui';
import './Topbar.css';

interface TopbarProps {
  breadcrumb?: string;
  actions?: ReactNode;
  onBack?: () => void;
  onForward?: () => void;
}

/**
 * Desktop topbar with nav buttons, breadcrumb, and optional action slot.
 * Uses Button from @orchestra-mcp/ui and icons from @orchestra-mcp/icons.
 */
export function Topbar({
  breadcrumb = 'Orchestra',
  actions,
  onBack,
  onForward,
}: TopbarProps) {
  return (
    <header className="desktop-topbar">
      <div className="desktop-topbar__left">
        <Button
          variant="ghost"
          color="gray"
          size="xs"
          iconOnly
          ariaLabel="Back"
          iconLeft={
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
              <ChevronRightIcon size={14} />
            </span>
          }
          onClick={onBack}
        />
        <Button
          variant="ghost"
          color="gray"
          size="xs"
          iconOnly
          ariaLabel="Forward"
          iconLeft={<ChevronRightIcon size={14} />}
          onClick={onForward}
        />
        <span className="desktop-topbar__breadcrumb">{breadcrumb}</span>
      </div>

      {actions && <div className="desktop-topbar__right">{actions}</div>}
    </header>
  );
}
