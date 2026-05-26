import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BarChart } from '../components/charts/BarChart';

vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => <div data-testid="echarts-mock">ECharts</div>),
}));

describe('BarChart', () => {
  const mockXAxis = ['项目A', '项目B', '项目C'];
  const mockSeries = [
    { name: '任务数', data: [10, 20, 15] },
  ];

  it('renders the chart component', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} title="任务分布" />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('renders horizontal bar chart when horizontal prop is true', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} horizontal />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('renders vertical bar chart by default', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('supports multiple series', () => {
    const multipleSeries = [
      { name: '已完成', data: [10, 20, 15] },
      { name: '进行中', data: [5, 10, 8] },
    ];
    render(<BarChart xAxis={mockXAxis} series={multipleSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue'];
    render(<BarChart xAxis={mockXAxis} series={mockSeries} colors={customColors} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });
});