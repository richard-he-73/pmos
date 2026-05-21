import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BarChart } from '../components/charts/BarChart';

const mockReactECharts = vi.fn(() => <div data-testid="echarts-mock">ECharts</div>);
vi.mock('echarts-for-react', () => ({
  default: (...args: any[]) => mockReactECharts(...args),
}));

beforeEach(() => {
  mockReactECharts.mockClear();
});

describe('BarChart', () => {
  const mockXAxis = ['项目A', '项目B', '项目C'];
  const mockSeries = [
    { name: '任务数', data: [10, 20, 15] },
  ];

  it('renders the chart component', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('passes correct xAxis and series to ECharts', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    expect(mockReactECharts).toHaveBeenCalled();
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.xAxis.data).toEqual(mockXAxis);
    expect(props.option.series[0].name).toBe('任务数');
    expect(props.option.series[0].data).toEqual([10, 20, 15]);
  });

  it('renders with title', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} title="任务分布" />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.title.text).toBe('任务分布');
  });

  it('renders horizontal bar chart when horizontal prop is true', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} horizontal />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.yAxis.type).toBe('category');
    expect(props.option.xAxis.type).toBe('value');
  });

  it('renders vertical bar chart by default', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.xAxis.type).toBe('category');
    expect(props.option.yAxis.type).toBe('value');
  });

  it('uses default height of 300', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(300);
  });

  it('applies custom height when provided', () => {
    render(<BarChart xAxis={mockXAxis} series={mockSeries} height={400} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(400);
  });

  it('supports multiple series', () => {
    const multipleSeries = [
      { name: '已完成', data: [10, 20, 15] },
      { name: '进行中', data: [5, 10, 8] },
    ];
    render(<BarChart xAxis={mockXAxis} series={multipleSeries} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series.length).toBe(2);
    expect(props.option.series[0].name).toBe('已完成');
    expect(props.option.series[1].name).toBe('进行中');
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue'];
    render(<BarChart xAxis={mockXAxis} series={mockSeries} colors={customColors} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series[0].itemStyle.color).toBe('red');
  });
});
