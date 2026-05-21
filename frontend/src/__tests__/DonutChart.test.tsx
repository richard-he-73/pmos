import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DonutChart } from '../components/charts/DonutChart';

const mockReactECharts = vi.fn(() => <div data-testid="echarts-mock">ECharts</div>);
vi.mock('echarts-for-react', () => ({
  default: (...args: any[]) => mockReactECharts(...args),
}));

beforeEach(() => {
  mockReactECharts.mockClear();
});

describe('DonutChart', () => {
  const mockData = [
    { name: '进行中', value: 32 },
    { name: '已完成', value: 12 },
    { name: '规划中', value: 4 },
  ];

  it('renders the chart component', () => {
    render(<DonutChart data={mockData} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('passes correct data to ECharts', () => {
    render(<DonutChart data={mockData} title="项目状态" />);
    expect(mockReactECharts).toHaveBeenCalled();
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.series[0].data).toEqual(mockData);
  });

  it('uses default height of 300', () => {
    render(<DonutChart data={mockData} />);
    expect(mockReactECharts).toHaveBeenCalled();
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(300);
  });

  it('applies custom height when provided', () => {
    render(<DonutChart data={mockData} height={400} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.style.height).toBe(400);
  });

  it('uses default colors when not provided', () => {
    render(<DonutChart data={mockData} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.color).toBeDefined();
    expect(props.option.color.length).toBe(5);
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue', 'green'];
    render(<DonutChart data={mockData} colors={customColors} />);
    const props = mockReactECharts.mock.calls[0][0];
    expect(props.option.color).toEqual(customColors);
  });
});
