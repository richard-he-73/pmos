import request from '../request'

// ─── 测试环境 ───

export interface TestEnvironment {
  id: number
  name: string
  description: string
  config_info: string
  db_info: string
  address_info: string
  status: 'planned' | 'active' | 'inactive' | 'discarded'
  notes: string
  project: number
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

export const ENV_STATUS_LABELS: Record<string, string> = {
  planned: '计划', active: '启用', inactive: '停用', discarded: '废弃',
}

export function getTestEnvironments(params?: Record<string, any>) {
  return request.get<{ count: number; results: TestEnvironment[] }>('/test-environments/', { params })
}
export function getTestEnvironment(id: number) {
  return request.get<TestEnvironment>(`/test-environments/${id}/`)
}
export function createTestEnvironment(data: Partial<TestEnvironment>) {
  return request.post<TestEnvironment>('/test-environments/', data)
}
export function updateTestEnvironment(id: number, data: Partial<TestEnvironment>) {
  return request.patch<TestEnvironment>(`/test-environments/${id}/`, data)
}
export function deleteTestEnvironment(id: number) {
  return request.delete(`/test-environments/${id}/`)
}

// ─── 测试用例 ───

export interface TestCase {
  id: number
  name: string
  type: 'functional' | 'api' | 'performance' | 'security' | 'other'
  module: string
  test_steps: string
  expected_result: string
  requirement_baseline: number | null
  baseline_name: string
  baseline_version: string
  related_requirements: number[]
  related_requirement_names: string[]
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  status: 'draft' | 'active' | 'inactive' | 'discarded'
  test_document: string | null
  notes: string
  project: number
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

export const CASE_TYPE_LABELS: Record<string, string> = {
  functional: '功能测试', api: '接口测试', performance: '性能测试', security: '安全测试', other: '其他',
}
export const CASE_PRIORITY_LABELS: Record<string, string> = {
  p0: 'P0-致命', p1: 'P1-高', p2: 'P2-中', p3: 'P3-低',
}
export const CASE_STATUS_LABELS: Record<string, string> = {
  draft: '草稿', active: '启用', inactive: '停用', discarded: '废弃',
}

export function getTestCases(params?: Record<string, any>) {
  return request.get<{ count: number; results: TestCase[] }>('/test-cases/', { params })
}
export function getTestCase(id: number) {
  return request.get<TestCase>(`/test-cases/${id}/`)
}
export function createTestCase(data: Partial<TestCase> | FormData) {
  if (data instanceof FormData) {
    return request.post<TestCase>('/test-cases/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  return request.post<TestCase>('/test-cases/', data)
}
export function updateTestCase(id: number, data: Partial<TestCase> | FormData) {
  if (data instanceof FormData) {
    return request.patch<TestCase>(`/test-cases/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
  return request.patch<TestCase>(`/test-cases/${id}/`, data)
}
export function deleteTestCase(id: number) {
  return request.delete(`/test-cases/${id}/`)
}

// ─── 测试计划 ───

export interface TestPlan {
  id: number
  name: string
  goal: string
  start_date: string | null
  end_date: string | null
  test_cases: number[]
  test_case_ids: number[]
  test_case_names: string[]
  test_environment: number | null
  test_environment_name: string
  assignee: number | null
  assignee_name: string
  stakeholders: number[]
  stakeholder_ids: number[]
  stakeholder_names: string[]
  notes: string
  project: number
  created_by: number | null
  created_at: string
  updated_at: string
}

export function getTestPlans(params?: Record<string, any>) {
  return request.get<{ count: number; results: TestPlan[] }>('/test-plans/', { params })
}
export function getTestPlan(id: number) {
  return request.get<TestPlan>(`/test-plans/${id}/`)
}
export function createTestPlan(data: Partial<TestPlan>) {
  return request.post<TestPlan>('/test-plans/', data)
}
export function updateTestPlan(id: number, data: Partial<TestPlan>) {
  return request.patch<TestPlan>(`/test-plans/${id}/`, data)
}
export function deleteTestPlan(id: number) {
  return request.delete(`/test-plans/${id}/`)
}
export function executeTestPlan(id: number) {
  return request.post(`/test-plans/${id}/execute/`)
}

// ─── 测试执行 ───

export interface TestExecution {
  id: number
  test_plan: number
  test_plan_name: string
  test_case: number
  test_case_name: string
  executor: number | null
  executor_name: string
  execution_date: string | null
  result: 'pass' | 'fail' | 'blocked' | 'skipped'
  evidence: string | null
  notes: string
  project: number
  created_by: number | null
  created_at: string
  updated_at: string
}

export const EXEC_RESULT_LABELS: Record<string, string> = {
  pass: '通过', fail: '失败', blocked: '阻塞', skipped: '跳过',
}
export const EXEC_RESULT_COLORS: Record<string, string> = {
  pass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fail: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blocked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  skipped: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

export function getTestExecutions(params?: Record<string, any>) {
  return request.get<{ count: number; results: TestExecution[] }>('/test-executions/', { params })
}
export function getTestExecution(id: number) {
  return request.get<TestExecution>(`/test-executions/${id}/`)
}
export function createTestExecution(data: Partial<TestExecution>) {
  return request.post<TestExecution>('/test-executions/', data)
}
export function updateTestExecution(id: number, data: Partial<TestExecution>) {
  return request.patch<TestExecution>(`/test-executions/${id}/`, data)
}
export function deleteTestExecution(id: number) {
  return request.delete(`/test-executions/${id}/`)
}

// ─── 测试缺陷 ───

export interface TestDefect {
  id: number
  name: string
  description: string
  related_test_case: number | null
  test_case_name: string
  severity: 'fatal' | 'serious' | 'normal' | 'suggestion'
  priority: 'p0' | 'p1' | 'p2' | 'p3'
  assignee: number | null
  assignee_name: string
  status: 'reproducing' | 'located' | 'retesting' | 'suspended' | 'resolved'
  notes: string
  project: number
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

export const DEFECT_SEVERITY_LABELS: Record<string, string> = {
  fatal: '致命', serious: '严重', normal: '一般', suggestion: '建议',
}
export const DEFECT_PRIORITY_LABELS: Record<string, string> = {
  p0: 'P0-致命', p1: 'P1-高', p2: 'P2-中', p3: 'P3-低',
}
export const DEFECT_STATUS_LABELS: Record<string, string> = {
  reproducing: '复现中', located: '已定位', retesting: '复测中', suspended: '已挂起', resolved: '已解决',
}
export const DEFECT_SEVERITY_COLORS: Record<string, string> = {
  fatal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  serious: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  suggestion: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
}

export function getTestDefects(params?: Record<string, any>) {
  return request.get<{ count: number; results: TestDefect[] }>('/test-defects/', { params })
}
export function getTestDefect(id: number) {
  return request.get<TestDefect>(`/test-defects/${id}/`)
}
export function createTestDefect(data: Partial<TestDefect>) {
  return request.post<TestDefect>('/test-defects/', data)
}
export function updateTestDefect(id: number, data: Partial<TestDefect>) {
  return request.patch<TestDefect>(`/test-defects/${id}/`, data)
}
export function deleteTestDefect(id: number) {
  return request.delete(`/test-defects/${id}/`)
}

// ─── 测试报告（API 聚合数据） ───

export interface TestReportData {
  test_executions: {
    total: number
    by_result: { result: string; count: number }[]
  }
  test_cases: {
    total: number
    by_type: { type: string; count: number }[]
    by_status: { status: string; count: number }[]
  }
  defects: {
    total: number
    open: number
    by_severity: { severity: string; count: number }[]
    by_status: { status: string; count: number }[]
  }
}

export function getTestReport(projectId: number) {
  return request.get<TestReportData>('/statistics/project_detail/', { params: { project: projectId } })
}
