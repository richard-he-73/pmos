import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LineChart } from '../components/charts/LineChart';

const mockReactECharts = vi.fn(() => <div data-testid="echarts-mock">ECharts</div>);
vi.mock('echarts-for-react', () => ({
  default: (...args: any[]) => mockReactECharts(...args),
}));

beforeEach(() => {
  mockReactECharts.mockClear();
});

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

  it('passes correct xAxis and series to ECharts', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} />);
    expect(mockReactECharts).toHaveBeenCalled();
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.xAxis.data).toEqual(mockXAxis);
    expect(props.option.series.length).toBe(2);
  });

  it('renders with title', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} title="任务趋势" />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.title.text).toBe('任务趋势');
  });

  it('applies fillArea styling when fillArea prop is true', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} fillArea />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series[0].areaStyle).toBeDefined();
  });

  it('does not apply fillArea when fillArea prop is false', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} fillArea={false} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series[0].areaStyle).toBeUndefined();
  });

  it('uses default height of 300', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(300);
  });

  it('applies custom height when provided', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} height={400} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(400);
  });

  it('supports multiple series', () => {
    render(<LineChart xAxis={mockXAxis} series={mockSeries} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series.length).toBe(2);
    expect(props.option.series[0].name).toBe('待办');
    expect(props.option.series[1].name).toBe('进行中');
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue'];
    render(<LineChart xAxis={mockXAxis} series={mockSeries} colors={customColors} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series[0].itemStyle.color).toBe('red');
    expect(props.option.series[1].itemStyle.color).toBe('blue');
  });
});
