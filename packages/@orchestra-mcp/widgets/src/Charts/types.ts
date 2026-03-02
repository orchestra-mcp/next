export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  title?: string;
  className?: string;
}
