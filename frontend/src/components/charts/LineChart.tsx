import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  title?: string;
  xAxis: string[];
  series: { name: string; data: number[]; smooth?: boolean }[];
  height?: number;
  colors?: string[];
  fillArea?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  title = '',
  xAxis,
  series,
  height = 300,
  colors = ['oklch(58% 0.16 145)'],
  fillArea = false,
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
    },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      top: title ? 50 : 30,
      bottom: 40,
      left: 60,
      right: 40,
    },
    xAxis: {
      type: 'category',
      data: xAxis,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: s.smooth ?? true,
      itemStyle: {
        color: colors[index % colors.length],
      },
      areaStyle: fillArea
        ? {
            color: colors[index % colors.length],
            opacity: 0.3,
          }
        : undefined,
    })),
  };

  return <ReactECharts option={option} style={{ height }} />;
};
