import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  title?: string;
  xAxis: string[];
  series: { name: string; data: number[] }[];
  height?: number;
  colors?: string[];
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  title = '',
  xAxis,
  series,
  height = 300,
  colors = ['oklch(58% 0.16 145)'],
  horizontal = false,
}) => {
  const option: EChartsOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      top: title ? 50 : 30,
      bottom: horizontal ? 80 : 40,
      left: horizontal ? 100 : 60,
      right: 40,
    },
    xAxis: horizontal
      ? { type: 'value' }
      : { type: 'category', data: xAxis },
    yAxis: horizontal
      ? { type: 'category', data: xAxis }
      : { type: 'value' },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      itemStyle: {
        color: colors[index % colors.length],
      },
    })),
  };

  return <ReactECharts option={option} style={{ height }} />;
};
