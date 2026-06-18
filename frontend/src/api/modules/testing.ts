import request from '../request'

export interface TestPlan {
  id: number
  name: string
  project: number
  version: string
  status: 'draft' | 'in_progress' | 'completed' | 'blocked'
  assignee: number | null
  start_date: string | null
  end_date: string | null
  description: string
}

export interface TestCase {
  id: number
  name: string
  precondition: string
  steps: string[]
  expected_result: string
  type: string
  priority: string
  status: string
  module: string
  requirement: number | null
}

export interface Bug {
  id: number
  title: string
  description: string
  severity: 'critical' | 'major' | 'minor' | 'trivial'
  status: 'new' | 'confirmed' | 'in_progress' | 'resolved' | 'closed'
  source: string
  module: string
  reporter: number | null
  reporter_name: string
  assignee: number | null
  created_at: string
}

export function getTestPlans(params?: Record<string, any>) {
  return request.get<TestPlan[]>('/test-plans/', { params })
}

export function getTestCases(params?: Record<string, any>) {
  return request.get<TestCase[]>('/test-cases/', { params })
}

export function getBugs(params?: Record<string, any>) {
  return request.get<{ count: number; results: Bug[] }>('/bugs/', { params })
}

export function createBug(data: Partial<Bug>) {
  return request.post<Bug>('/bugs/', data)
}

export function updateBug(id: number, data: Partial<Bug>) {
  return request.patch<Bug>(`/bugs/${id}/`, data)
}
