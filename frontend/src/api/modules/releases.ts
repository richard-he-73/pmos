import request from '../request'

export interface ReleaseDrill {
  id: number
  name: string
  project: number
  project_name?: string
  planned_date: string
  actual_date: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'failed'
  checklist: any[]
  participants: number[]
  result: string
  notes: string
  created_by: number | null
  created_at: string
  updated_at: string
}

export interface ReleaseDeployment {
  id: number
  name: string
  project: number
  project_name?: string
  version: string
  planned_date: string
  actual_date: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'rolled_back' | 'cancelled'
  commander: number | null
  commander_name?: string
  rollback_plan: string
  result: string
  notes: string
  created_by: number | null
  created_at: string
  updated_at: string
}

export interface ReleaseStep {
  id: number
  deployment: number
  name: string
  description: string
  order: number
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  executor: number | null
  executor_name?: string
  duration_minutes: number | null
  output: string
  started_at: string | null
  completed_at: string | null
}

export function getReleaseDrills(params?: Record<string, any>) {
  return request.get<{ results: ReleaseDrill[] }>('/release-drills/', { params })
}

export function createReleaseDrill(data: Partial<ReleaseDrill>) {
  return request.post<ReleaseDrill>('/release-drills/', data)
}

export function updateReleaseDrill(id: number, data: Partial<ReleaseDrill>) {
  return request.patch<ReleaseDrill>(`/release-drills/${id}/`, data)
}

export function deleteReleaseDrill(id: number) {
  return request.delete(`/release-drills/${id}/`)
}

export function getReleaseDeployments(params?: Record<string, any>) {
  return request.get<{ results: ReleaseDeployment[] }>('/release-deployments/', { params })
}

export function createReleaseDeployment(data: Partial<ReleaseDeployment>) {
  return request.post<ReleaseDeployment>('/release-deployments/', data)
}

export function updateReleaseDeployment(id: number, data: Partial<ReleaseDeployment>) {
  return request.patch<ReleaseDeployment>(`/release-deployments/${id}/`, data)
}

export function deleteReleaseDeployment(id: number) {
  return request.delete(`/release-deployments/${id}/`)
}

export function getReleaseSteps(params?: Record<string, any>) {
  return request.get<ReleaseStep[]>('/release-steps/', { params })
}
