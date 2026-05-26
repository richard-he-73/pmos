interface ProgressChartProps {
  data: { label: string; value: number; total: number; color?: string }[];
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  size = 'medium',
  showLabels = true,
}) => {
  const heights = {
    small: 24,
    medium: 32,
    large: 40,
  };

  const defaultColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  return (
    <div className="progress-chart">
      {data.map((item, index) => {
        const percentage = Math.min((item.value / item.total) * 100, 100);
        const color = item.color || defaultColors[index % defaultColors.length];

        return (
          <div key={item.label} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: size === 'small' ? 12 : 14 }}>{item.label}</span>
              {showLabels && (
                <span style={{ fontSize: size === 'small' ? 12 : 14, color: 'var(--color-muted)' }}>
                  {item.value} / {item.total} ({percentage.toFixed(0)}%)
                </span>
              )}
            </div>
            <div
              style={{
                height: heights[size],
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: color,
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressChart;