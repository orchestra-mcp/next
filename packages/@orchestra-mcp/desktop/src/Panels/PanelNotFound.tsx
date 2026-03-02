import { SearchIcon } from '@orchestra-mcp/icons';
import { Button } from '@orchestra-mcp/ui';

interface PanelNotFoundProps {
  route: string;
  onGoBack?: () => void;
}

/**
 * 404 state when a panel route has no registered component.
 * Uses Button from @orchestra-mcp/ui and SearchIcon from @orchestra-mcp/icons.
 */
export function PanelNotFound({ route, onGoBack }: PanelNotFoundProps) {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="desktop-panel-state">
      <div className="desktop-panel-state__icon">
        <SearchIcon size={40} />
      </div>
      <h2 className="desktop-panel-state__title">Panel Not Found</h2>
      <p className="desktop-panel-state__message">
        The panel at <code className="desktop-panel-state__route">{route}</code>{' '}
        could not be found.
      </p>
      <p className="desktop-panel-state__message">
        This panel may not be registered or the plugin that provides it may not be installed.
      </p>
      <Button
        label="Go Back"
        variant="filled"
        color="gray"
        size="sm"
        onClick={handleGoBack}
      />
    </div>
  );
}
