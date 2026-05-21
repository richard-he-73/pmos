import apiClient from './client';

export interface StatsData {
  projects: {
    total: number;
    by_status: Record<string, number>;
  };
  tasks: {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
  };
  resources: {
    total: number;
    by_type: Record<string, number>;
  };
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TrendData {
  date: string;
  status: string;
}

export interface BudgetUsage {
  name: string;
  total: number;
  used: number;
  usage_percent: number;
}

export interface ResourceUtilization {
  name: string;
  type: string;
  capacity: number;
  allocated: number;
  utilization: number;
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  status: string;
  dependencies: string[];
}

export const getStats = () => apiClient.get<StatsData>('/stats');
export const getProjectStatusChart = () => apiClient.get<ChartData[]>('/stats/chart/project-status');
export const getTaskPriorityChart = () => apiClient.get<ChartData[]>('/stats/chart/task-priority');
export const getTaskTrendChart = (limit?: number) => apiClient.get<TrendData[]>('/stats/chart/task-trend', { params: { limit } });
export const getBudgetUsageChart = () => apiClient.get<BudgetUsage[]>('/stats/chart/budget-usage');
export const getResourceUtilizationChart = () => apiClient.get<ResourceUtilization[]>('/stats/chart/resource-utilization');
export const getTaskGanttData = (projectId?: string) => apiClient.get<GanttTask[]>('/stats/gantt/tasks', { params: { project_id: projectId } });
