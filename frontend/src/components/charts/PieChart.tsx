interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
  showLegend?: boolean;
  showPercent?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLegend = true,
  showPercent = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const defaultColors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
  
  let currentAngle = -90;

  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const color = item.color || defaultColors[index % defaultColors.length];
    
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    
    const x1 = size / 2 + (size / 2 - 10) * Math.cos(startRad);
    const y1 = size / 2 + (size / 2 - 10) * Math.sin(startRad);
    const x2 = size / 2 + (size / 2 - 10) * Math.cos(endRad);
    const y2 = size / 2 + (size / 2 - 10) * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const d = [
      `M ${size / 2} ${size / 2}`,
      `L ${x1} ${y1}`,
      `A ${size / 2 - 10} ${size / 2 - 10} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    
    return { ...item, percentage, color, d };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <path
            key={slice.label}
            d={slice.d}
            fill={slice.color}
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="white"
        />
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          {total}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          style={{ fontSize: 12, fill: 'var(--color-muted)' }}
        >
          总计
        </text>
      </svg>
      
      {showLegend && (
        <div style={{ flex: 1 }}>
          {slices.map((slice) => (
            <div key={slice.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  backgroundColor: slice.color,
                  marginRight: 8,
                }}
              />
              <span style={{ flex: 1 }}>{slice.label}</span>
              {showPercent && (
                <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>
                  {slice.percentage.toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChart;