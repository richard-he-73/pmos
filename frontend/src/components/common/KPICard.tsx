interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  variant?: 'accent' | 'success' | 'info' | 'warning' | 'danger' | 'muted';
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  trend,
  trendDirection,
  variant = 'accent',
}) => {
  return (
    <div className={`kpi-card ${variant}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value mono-value">{value}</div>
      {trend && (
        <div className={`kpi-trend ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trendDirection === 'up' ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  );
};
