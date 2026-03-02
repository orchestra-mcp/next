import { BoxIcon } from '@orchestra-mcp/icons';
import './DashboardHeader.css';

export interface DashboardHeaderProps {
  name: string;
  onRefresh?: () => void;
  onSettingsToggle: (e: React.MouseEvent) => void;
}

export const DashboardHeader = ({
  name,
  onRefresh,
  onSettingsToggle,
}: DashboardHeaderProps) => {
  return (
    <div className="dashboard-header" data-testid="dashboard-header">
      <h2 className="dashboard-header__title">{name}</h2>
      <div className="dashboard-header__spacer" />
      {onRefresh && (
        <button
          className="dashboard-header__btn"
          onClick={onRefresh}
          aria-label="Refresh"
          type="button"
        >
          <BoxIcon name="bx-refresh" size={16} />
        </button>
      )}
      <button
        className="dashboard-header__btn"
        onClick={onSettingsToggle}
        aria-label="Settings"
        type="button"
      >
        <BoxIcon name="bx-slider-alt" size={16} />
      </button>
    </div>
  );
};
