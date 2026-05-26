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

export const TASK_TYPE = {
  task: '任务',
  feature: '功能',
  bug: '缺陷',
  milestone: '里程碑',
} as const;

export const PRIORITY = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
} as const;

export const RISK_STATUS = {
  identified: '已识别',
  assessed: '已评估',
  mitigating: '缓解中',
  closed: '已关闭',
} as const;

export const RISK_CATEGORY = {
  technical: '技术风险',
  schedule: '进度风险',
  budget: '预算风险',
  resource: '资源风险',
  external: '外部风险',
} as const;

export const RISK_SEVERITY = {
  low: '低',
  medium: '中',
  high: '高',
} as const;

export const REQUIREMENT_STATUS = {
  draft: '草稿',
  reviewing: '评审中',
  approved: '已批准',
  in_progress: '进行中',
  done: '已完成',
  rejected: '已拒绝',
} as const;

export const REQUIREMENT_TYPE = {
  functional: '功能需求',
  non_functional: '非功能需求',
  business: '业务需求',
  technical: '技术需求',
} as const;

export const ITERATION_STATUS = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
  cancelled: '已取消',
} as const;

export const CODE_REVIEW_STATUS = {
  pending: '待评审',
  approved: '已通过',
  rejected: '已拒绝',
  needs_changes: '需修改',
} as const;

export const TEST_CASE_STATUS = {
  draft: '草稿',
  active: '活跃',
  deprecated: '已废弃',
} as const;

export const DEFECT_STATUS = {
  new: '新建',
  open: '已打开',
  in_progress: '修复中',
  resolved: '已解决',
  closed: '已关闭',
  rejected: '已拒绝',
} as const;

export const SEVERITY = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
} as const;

export const PAGE_SIZE = 20;
