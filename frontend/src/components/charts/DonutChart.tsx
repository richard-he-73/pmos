import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface DonutChartProps {
  title?: string;
  data: { name: string; value: number }[];
  height?: number;
  colors?: string[];
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title = '',
  data,
  height = 300,
  colors = ['oklch(58% 0.16 145)', 'oklch(58% 0.16 180)', 'oklch(58% 0.16 220)', 'oklch(58% 0.16 300)', 'oklch(58% 0.16 60)'],
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
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
    color: colors,
    grid: {
      top: title ? 60 : 40,
      bottom: 40,
      left: 80,
      right: 40,
    },
  };

  return <ReactECharts option={option} style={{ height }} />;
};
