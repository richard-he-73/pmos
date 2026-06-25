import request from '../request'

// ── 投产演练 ──

export interface ReleaseDrill {
  id: number
  project: number | null
  name: string
  description: string
  target_environment: 'test' | 'pre_prod' | 'gray_release' | 'other'
  scenario: 'normal_deploy' | 'service_down' | 'rollback' | 'business_verify' | 'monitor_alert' | 'other'
  steps: string
  prerequisites: string
  expected_results: string
  criteria: string
  assignee: number | null
  assignee_name?: string
  stakeholders: number[]
  stakeholder_ids?: number[]
  stakeholder_names?: string[]
  conclusion: 'pass' | 'conditional_pass' | 'fail' | 'pending'
  notes: string
  attachment: string | null
  attachment_url?: string | null
  created_at: string
  updated_at: string
}

export const DRILL_ENV_LABELS: Record<string, string> = {
  test: '测试环境',
  pre_prod: '预发布环境',
  gray_release: '生产灰度环境',
  other: '其他环境',
}

export const DRILL_SCENARIO_LABELS: Record<string, string> = {
  normal_deploy: '正常部署',
  service_down: '服务宕机',
  rollback: '异常回滚',
  business_verify: '业务验证',
  monitor_alert: '监控告警',
  other: '其他',
}

export const DRILL_CONCLUSION_LABELS: Record<string, string> = {
  pass: '通过',
  conditional_pass: '条件通过',
  fail: '不通过',
  pending: '待判定',
}

export function drillConclusionClass(s: string): string {
  const map: Record<string, string> = {
    pass: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    conditional_pass: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    fail: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
    pending: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700',
  }
  return map[s] || ''
}

// ── 投产计划 ──

export interface ReleasePlan {
  id: number
  project: number | null
  name: string
  release_type: 'regular' | 'hotfix' | 'non_functional' | 'infrastructure'
  target_environment: 'pre_prod' | 'gray_release' | 'production'
  content: string
  assignee: number | null
  assignee_name?: string
  stakeholders: number[]
  stakeholder_ids?: number[]
  stakeholder_names?: string[]
  notes: string
  attachment: string | null
  attachment_url?: string | null
  created_at: string
  updated_at: string
}

export const PLAN_TYPE_LABELS: Record<string, string> = {
  regular: '常规发布',
  hotfix: '紧急修复',
  non_functional: '非功能变更',
  infrastructure: '基础设施变更',
}

export const PLAN_ENV_LABELS: Record<string, string> = {
  pre_prod: '预发布环境',
  gray_release: '生产灰度环境',
  production: '生产环境',
}

// ── API 函数 ──

export function getReleaseDrills(params?: Record<string, any>) {
  return request.get<{ count: number; results: ReleaseDrill[] }>('/release-drills/', { params })
}
export function getReleaseDrill(id: number) {
  return request.get<ReleaseDrill>(`/release-drills/${id}/`)
}
export function createReleaseDrill(data: Partial<ReleaseDrill> | FormData) {
  return request.post<ReleaseDrill>('/release-drills/', data)
}
export function updateReleaseDrill(id: number, data: Partial<ReleaseDrill> | FormData) {
  return request.patch<ReleaseDrill>(`/release-drills/${id}/`, data)
}
export function deleteReleaseDrill(id: number) {
  return request.delete(`/release-drills/${id}/`)
}

export function getReleasePlans(params?: Record<string, any>) {
  return request.get<{ count: number; results: ReleasePlan[] }>('/release-plans/', { params })
}
export function getReleasePlan(id: number) {
  return request.get<ReleasePlan>(`/release-plans/${id}/`)
}
export function createReleasePlan(data: Partial<ReleasePlan> | FormData) {
  return request.post<ReleasePlan>('/release-plans/', data)
}
export function updateReleasePlan(id: number, data: Partial<ReleasePlan> | FormData) {
  return request.patch<ReleasePlan>(`/release-plans/${id}/`, data)
}
export function deleteReleasePlan(id: number) {
  return request.delete(`/release-plans/${id}/`)
}
