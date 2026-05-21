export const API_PREFIX = '/api/v1';

export const PROJECT_STATUS = {
  planning: '规划中',
  active: '进行中',
  on_hold: '已暂停',
  completed: '已完成',
  archived: '已归档',
} as const;

export const TASK_STATUS = {
  todo: '待办',
  in_progress: '进行中',
  review: '审核中',
  done: '已完成',
  cancelled: '已取消',
} as const;

export const PRIORITY = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
} as const;

export const RISK_SEVERITY = {
  low: '低',
  medium: '中',
  high: '高',
} as const;

export const ALERT_LEVELS = {
  info: 'info',
  warn: 'warn',
  crit: 'crit',
} as const;

export const PAGE_SIZE = 20;
