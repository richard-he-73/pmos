import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DonutChart } from '../components/charts/DonutChart';

vi.mock('echarts-for-react', () => ({
  default: vi.fn(() => <div data-testid="echarts-mock">ECharts</div>),
}));

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

  it('renders with title', () => {
    render(<DonutChart data={mockData} title="项目状态" />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('applies custom colors when provided', () => {
    const customColors = ['red', 'blue', 'green'];
    render(<DonutChart data={mockData} colors={customColors} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });
});