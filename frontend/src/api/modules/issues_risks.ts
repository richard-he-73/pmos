import request from '../request'

export interface Issue {
  id: number
  project: number | null
  title: string
  description: string
  issue_type: 'plan_execution' | 'resource' | 'config_error' | 'change_request' | 'external_dependency' | 'other'
  severity: 'fatal' | 'serious' | 'normal' | 'tip'
  priority: 'high' | 'medium' | 'low'
  source: 'exec_tracking' | 'user_feedback' | 'other'
  reporter: number | null
  reporter_name?: string
  assignee: number | null
  assignee_name?: string
  stakeholders: number[]
  stakeholder_ids?: number[]
  stakeholder_names?: string[]
  expected_resolution_date: string | null
  status: 'new' | 'confirmed' | 'analyzing' | 'fixing' | 'pending_verify' | 'closed' | 'reopened'
  resolution: string
  attachment: string | null
  attachment_url?: string | null
  created_at: string
  updated_at: string
}

export interface Risk {
  id: number
  project: number | null
  title: string
  description: string
  category: 'schedule' | 'requirement' | 'technology' | 'resource' | 'external_dependency' | 'compliance' | 'other'
  probability: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'
  impact: 'fatal' | 'serious' | 'normal' | 'slight'
  risk_level: 'extreme' | 'high' | 'medium' | 'low'
  early_signs: string
  strategy: 'avoid' | 'transfer' | 'mitigate' | 'accept'
  response_plan: string
  reporter: number | null
  reporter_name?: string
  assignee: number | null
  assignee_name?: string
  stakeholders: number[]
  stakeholder_ids?: number[]
  stakeholder_names?: string[]
  status: 'new' | 'assessing' | 'planned' | 'monitoring' | 'closed'
  attachment: string | null
  attachment_url?: string | null
  created_at: string
  updated_at: string
}

// ── 常量字典 ──

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  plan_execution: '计划执行',
  resource: '资源问题',
  config_error: '配置错误',
  change_request: '变更请求',
  external_dependency: '外部依赖',
  other: '其他',
}

export const SEVERITY_LABELS: Record<string, string> = {
  fatal: '致命',
  serious: '严重',
  normal: '一般',
  tip: '提示',
}

export const PRIORITY_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const SOURCE_LABELS: Record<string, string> = {
  exec_tracking: '执行跟踪',
  user_feedback: '用户反馈',
  other: '其他',
}

export const ISSUE_STATUS_LABELS: Record<string, string> = {
  new: '新建',
  confirmed: '已确认',
  analyzing: '分析中',
  fixing: '修复/解决中',
  pending_verify: '待验证',
  closed: '已关闭',
  reopened: '重新打开',
}

export const RISK_CATEGORY_LABELS: Record<string, string> = {
  schedule: '进度',
  requirement: '需求',
  technology: '技术',
  resource: '资源',
  external_dependency: '外部依赖',
  compliance: '合规',
  other: '其他',
}

export const PROBABILITY_LABELS: Record<string, string> = {
  very_high: '很高',
  high: '高',
  medium: '中',
  low: '低',
  very_low: '很低',
}

export const IMPACT_LABELS: Record<string, string> = {
  fatal: '致命',
  serious: '严重',
  normal: '一般',
  slight: '轻微',
}

export const RISK_LEVEL_LABELS: Record<string, string> = {
  extreme: '极高',
  high: '高',
  medium: '中',
  low: '低',
}

export const STRATEGY_LABELS: Record<string, string> = {
  avoid: '规避',
  transfer: '转移',
  mitigate: '缓解',
  accept: '接受',
}

export const RISK_STATUS_LABELS: Record<string, string> = {
  new: '新建',
  assessing: '评估中',
  planned: '已制定应对',
  monitoring: '监控中',
  closed: '已关闭',
}

// ── 样式映射 ──

export function severityClass(s: string): string {
  const map: Record<string, string> = {
    fatal: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    serious: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    normal: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    tip: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
  }
  return map[s] || ''
}

export function priorityClass(p: string): string {
  const map: Record<string, string> = {
    high: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  }
  return map[p] || ''
}

export function issueStatusClass(s: string): string {
  const map: Record<string, string> = {
    new: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    confirmed: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    analyzing: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    fixing: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    pending_verify: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20',
    closed: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
    reopened: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  }
  return map[s] || ''
}

export function riskLevelClass(l: string): string {
  const map: Record<string, string> = {
    extreme: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    high: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
  }
  return map[l] || ''
}

export function riskStatusClass(s: string): string {
  const map: Record<string, string> = {
    new: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    assessing: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    planned: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    monitoring: 'text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/20',
    closed: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
  }
  return map[s] || ''
}

// ── API 函数 ──

export function getIssues(params?: Record<string, any>) {
  return request.get<{ count: number; results: Issue[] }>('/issues/', { params })
}

export function getIssue(id: number) {
  return request.get<Issue>(`/issues/${id}/`)
}

export function createIssue(data: Partial<Issue> | FormData) {
  return request.post<Issue>('/issues/', data)
}

export function updateIssue(id: number, data: Partial<Issue> | FormData) {
  return request.patch<Issue>(`/issues/${id}/`, data)
}

export function deleteIssue(id: number) {
  return request.delete(`/issues/${id}/`)
}

export function reportRiskFromIssue(id: number) {
  return request.post<Risk>(`/issues/${id}/report_risk/`)
}

export function getRisks(params?: Record<string, any>) {
  return request.get<{ count: number; results: Risk[] }>('/risks/', { params })
}

export function getRisk(id: number) {
  return request.get<Risk>(`/risks/${id}/`)
}

export function createRisk(data: Partial<Risk> | FormData) {
  return request.post<Risk>('/risks/', data)
}

export function updateRisk(id: number, data: Partial<Risk> | FormData) {
  return request.patch<Risk>(`/risks/${id}/`, data)
}

export function deleteRisk(id: number) {
  return request.delete(`/risks/${id}/`)
}

export function convertRiskToIssue(id: number) {
  return request.post<Issue>(`/risks/${id}/convert_to_issue/`)
}

export function recalculateRiskLevel(id: number) {
  return request.post<Risk>(`/risks/${id}/recalculate_risk_level/`)
}
