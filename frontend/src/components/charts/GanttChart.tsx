import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: number;
  dependencies?: string[];
  isCritical?: boolean;
}

interface GanttChartProps {
  tasks: GanttTask[];
  height?: number;
  title?: string;
}

const statusColors: Record<string, string> = {
  todo: 'oklch(70% 0.10 250)',
  in_progress: 'oklch(58% 0.16 145)',
  done: 'oklch(50% 0.05 250)',
  critical: 'oklch(58% 0.20 30)',
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  height = 400,
  title = '',
}) => {
  if (!tasks.length) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>暂无任务数据</div>;
  }

  const dates = tasks.flatMap((t) => [dayjs(t.start).valueOf(), dayjs(t.end).valueOf()]);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);

  const categories = tasks.map((t) => t.name);
  const data = tasks.map((t) => {
    const start = dayjs(t.start).valueOf();
    const end = dayjs(t.end).valueOf();
    const color = t.isCritical ? statusColors.critical : statusColors.in_progress;
    return {
      name: t.name,
      value: [0, start, end, t.progress || 0, color],
    };
  });

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
      formatter: (params: any) => {
        const { name, value } = params;
        const startDate = dayjs(value[1]).format('YYYY-MM-DD');
        const endDate = dayjs(value[2]).format('YYYY-MM-DD');
        const progress = value[3];
        return `<strong>${name}</strong><br/>开始: ${startDate}<br/>结束: ${endDate}<br/>进度: ${progress}%`;
      },
    },
    grid: {
      top: title ? 50 : 30,
      bottom: 40,
      left: 150,
      right: 60,
    },
    xAxis: {
      type: 'time',
      min: minDate - 86400000,
      max: maxDate + 86400000,
      axisLabel: {
        formatter: '{yyyy-MM-dd}',
        rotate: 30,
      },
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;
          const color = api.value(4);

          const rectShape = {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height,
          };

          return {
            type: 'group',
            children: [
              {
                type: 'rect',
                shape: rectShape,
                style: {
                  fill: color,
                  opacity: 0.8,
                },
              },
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: start[1] - height / 2,
                  width: (end[0] - start[0]) * (api.value(3) / 100),
                  height,
                },
                style: {
                  fill: color,
                  opacity: 1,
                },
              },
            ],
          };
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} />;
};
