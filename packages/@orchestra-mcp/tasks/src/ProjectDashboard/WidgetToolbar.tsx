import type { WidgetLayout } from '../stores/useDashboardStore';
import { WIDGET_TITLES } from './defaultLayout';
import './WidgetToolbar.css';

export interface WidgetToolbarProps {
  widgets: WidgetLayout[];
  onToggle: (widgetId: string) => void;
}

export const WidgetToolbar = ({ widgets, onToggle }: WidgetToolbarProps) => {
  return (
    <div className="widget-toolbar" data-testid="widget-toolbar">
      {widgets.map((w) => {
        const title = WIDGET_TITLES[w.type] || w.type;
        const isVisible = !w.hidden;
        return (
          <button
            key={w.id}
            type="button"
            className={`widget-toolbar__chip${isVisible ? ' widget-toolbar__chip--active' : ''}`}
            onClick={() => onToggle(w.id)}
            data-testid={`toolbar-chip-${w.id}`}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
};
