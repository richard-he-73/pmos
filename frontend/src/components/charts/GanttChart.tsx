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
  minDate?: string | number;
  maxDate?: string | number;
}

const vibrantColors = [
  'oklch(75% 0.22 250)', // 亮蓝色
  'oklch(78% 0.20 280)', // 亮紫色
  'oklch(75% 0.18 200)', // 亮青色
  'oklch(78% 0.22 145)', // 亮绿色
  'oklch(80% 0.20 80)',  // 亮黄色
  'oklch(75% 0.22 40)',  // 亮橙色
  'oklch(70% 0.25 20)',  // 亮红色
];

const getColorByIndex = (index: number): string => {
  return vibrantColors[index % vibrantColors.length];
};

const statusColors: Record<string, string> = {
  todo: 'oklch(75% 0.20 250)',
  in_progress: 'oklch(75% 0.20 145)',
  done: 'oklch(65% 0.20 145)',
  critical: 'oklch(70% 0.25 30)',
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  height = 400,
  title = '',
  minDate: propMinDate,
  maxDate: propMaxDate,
}) => {
  if (!tasks.length) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>暂无任务数据</div>;
  }

  // 如果传入了 minDate 和 maxDate，则使用传入值，否则从任务中计算
  let minDate, maxDate;
  if (propMinDate && propMaxDate) {
    minDate = dayjs(propMinDate).valueOf();
    maxDate = dayjs(propMaxDate).valueOf();
  } else {
    const dates = tasks.flatMap((t) => [dayjs(t.start).valueOf(), dayjs(t.end).valueOf()]);
    minDate = Math.min(...dates);
    maxDate = Math.max(...dates);
  }

  const categories = tasks.map((t) => t.name);
  const data = tasks.map((t, index) => {
    const start = dayjs(t.start).valueOf();
    const end = dayjs(t.end).valueOf();
    const color = t.isCritical ? statusColors.critical : getColorByIndex(index);
    return {
      name: t.name,
      value: [index, start, end, t.progress || 0, color],
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
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value } = params;
        const startDate = dayjs(value[1]).format('YYYY-MM-DD');
        const endDate = dayjs(value[2]).format('YYYY-MM-DD');
        const progress = value[3];
        const days = Math.ceil(dayjs(endDate).diff(dayjs(startDate), 'day'));
        return `
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #333;">${name}</div>
          <div style="font-size: 12px; line-height: 1.8; color: #555;">
            <div>📅 开始：${startDate}</div>
            <div>🏁 结束：${endDate}</div>
            <div>⏱️ 工期：${days} 天</div>
            <div>📊 进度：${progress}%</div>
          </div>
        `;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#ccc',
      borderWidth: 2,
      textStyle: {
        color: '#333',
      },
    },
    grid: {
      top: title ? 50 : 30,
      bottom: 50,
      left: 160,
      right: 60,
    },
    xAxis: {
      type: 'time',
      min: minDate - 86400000,
      max: maxDate + 86400000,
      axisLabel: {
        formatter: (value: number) => dayjs(value).format('YYYY-MM'),
        rotate: 0,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          width: 1,
        },
      },
      minInterval: 30 * 24 * 60 * 60 * 1000,
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ccc',
        },
      },
    },
    series: [
      {
        type: 'custom',
        renderItem: (_params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const barHeight = api.size([0, 1])[1] * 0.8;
          const color = api.value(4);
          const progress = api.value(3);

          const progressWidth = Math.max((end[0] - start[0]) * (progress / 100), 0);
          const totalWidth = Math.max(end[0] - start[0], 10);

          return {
            type: 'group',
            children: [
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: start[1] - barHeight / 2,
                  width: totalWidth,
                  height: barHeight,
                  r: 8,
                },
                style: {
                  fill: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: color },
                      { offset: 1, color: adjustColorSaturation(color, -20) },
                    ],
                  },
                  opacity: 0.25,
                  shadowBlur: 12,
                  shadowColor: color,
                  shadowOffsetX: 0,
                  shadowOffsetY: 4,
                },
              },
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: start[1] - barHeight / 2,
                  width: totalWidth,
                  height: barHeight,
                  r: 8,
                },
                style: {
                  fill: 'transparent',
                  stroke: color,
                  lineWidth: 2,
                  opacity: 0.6,
                },
              },
              {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: start[1] - barHeight / 2,
                  width: progressWidth,
                  height: barHeight,
                  r: [8, 8, 8, 8],
                },
                style: {
                  fill: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [
                      { offset: 0, color: adjustColorBrightness(color, 20) },
                      { offset: 0.3, color: color },
                      { offset: 0.7, color: color },
                      { offset: 1, color: adjustColorBrightness(color, 40) },
                    ],
                  },
                  opacity: 1,
                  shadowBlur: 10,
                  shadowColor: color,
                  shadowOffsetX: 0,
                  shadowOffsetY: 3,
                },
              },
              {
                type: 'circle',
                shape: {
                  cx: start[0],
                  cy: start[1],
                  r: 5,
                },
                style: {
                  fill: adjustColorBrightness(color, 50),
                  stroke: '#fff',
                  lineWidth: 2,
                  shadowBlur: 8,
                  shadowColor: adjustColorBrightness(color, 30),
                },
              },
              {
                type: 'circle',
                shape: {
                  cx: start[0] + totalWidth,
                  cy: start[1],
                  r: 5,
                },
                style: {
                  fill: adjustColorBrightness(color, 50),
                  stroke: '#fff',
                  lineWidth: 2,
                  shadowBlur: 8,
                  shadowColor: adjustColorBrightness(color, 30),
                },
              },
              progress > 0 && progress < 100 ? {
                type: 'circle',
                shape: {
                  cx: start[0] + progressWidth,
                  cy: start[1],
                  r: 4,
                },
                style: {
                  fill: '#fff',
                  stroke: color,
                  lineWidth: 2,
                  shadowBlur: 6,
                  shadowColor: color,
                },
              } : null,
            ].filter(Boolean),
          };
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data,
        animation: true,
        animationDuration: 1200,
        animationEasing: 'elasticOut',
      },
    ],
  };

  return (
    <ReactECharts 
      option={option} 
      style={{ height }} 
      key={`gantt-${tasks.length}`}
      onChartReady={(chart) => {
        setTimeout(() => {
          chart.resize();
        }, 100);
      }}
    />
  );
};

function adjustColorBrightness(color: string, amount: number): string {
  const match = color.match(/oklch\(([^)]+)\)/);
  if (!match) return color;
  
  const parts = match[1].split(/\s+/);
  if (parts.length < 3) return color;
  
  let lightness = parseFloat(parts[0].replace('%', '')) / 100;
  const chroma = parseFloat(parts[1]);
  const hue = parseFloat(parts[2]);
  
  lightness = Math.max(0.3, Math.min(0.95, lightness + amount / 100));
  
  return `oklch(${Math.round(lightness * 100)}% ${chroma} ${hue})`;
}

function adjustColorSaturation(color: string, amount: number): string {
  const match = color.match(/oklch\(([^)]+)\)/);
  if (!match) return color;
  
  const parts = match[1].split(/\s+/);
  if (parts.length < 3) return color;
  
  let lightness = parseFloat(parts[0].replace('%', '')) / 100;
  let chroma = parseFloat(parts[1]);
  const hue = parseFloat(parts[2]);
  
  chroma = Math.max(0, Math.min(0.4, chroma + amount / 100));
  
  return `oklch(${Math.round(lightness * 100)}% ${chroma} ${hue})`;
}
