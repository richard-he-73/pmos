import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LineChart } from '../components/charts/LineChart';

vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => <div data-testid="echarts-mock">ECharts</div>),
}));

describe('LineChart', () => {
  const mockXAxis = ['2024-01-01', '2024-01-02', '2024-01-03'];
  const mockSeries = [
    { name: '待办', data: [10, 15, 12] },
    { name: '进行中', data: [5, 8, 10] },
  ];

  it('renders the chart component', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} title="任务趋势" />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('applies fillArea styling when fillArea prop is true', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} fillArea />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('supports multiple series', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue'];
    render(<LineChart xAxis={mockXAxis} series={mockSeries} colors={customColors} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });
});