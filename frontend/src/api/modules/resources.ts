import request from '../request'

export interface Consultant {
  id: number
  project: number | null
  project_name?: string
  name: string
  gender: 'male' | 'female'
  age: number | null
  rank: 'director' | 'senior' | 'consultant' | 'assistant' | 'other'
  status: 'pending_entry' | 'entered' | 'pending_exit' | 'exited'
  entry_date: string | null
  exit_date: string | null
  user: number | null
  created_at: string
}

export interface ProjectResource {
  id: number
  project: number
  project_name?: string
  user: number
  user_name?: string
  role_in_project: string
  join_date: string
  leave_date: string | null
  allocation: number
  notes: string
  created_at: string
}

export interface ResourceChangeLog {
  id: number
  resource: number
  change_type: string
  operator: number | null
  operator_name?: string
  detail: Record<string, any>
  changed_at: string
}

export function getConsultants(params?: Record<string, any>) {
  return request.get<{ results: Consultant[] }>('/consultants/', { params })
}

export function getConsultant(id: number) {
  return request.get<Consultant>(`/consultants/${id}/`)
}

export function createConsultant(data: Partial<Consultant>) {
  return request.post<Consultant>('/consultants/', data)
}

export function updateConsultant(id: number, data: Partial<Consultant>) {
  return request.patch<Consultant>(`/consultants/${id}/`, data)
}

export function deleteConsultant(id: number) {
  return request.delete(`/consultants/${id}/`)
}

export function getProjectResources(params?: Record<string, any>) {
  return request.get<{ results: ProjectResource[] }>('/project-resources/', { params })
}

export function createProjectResource(data: Partial<ProjectResource>) {
  return request.post<ProjectResource>('/project-resources/', data)
}

export function updateProjectResource(id: number, data: Partial<ProjectResource>) {
  return request.patch<ProjectResource>(`/project-resources/${id}/`, data)
}

export function deleteProjectResource(id: number) {
  return request.delete(`/project-resources/${id}/`)
}

export function getResourceChangeLogs(params?: Record<string, any>) {
  return request.get<{ results: ResourceChangeLog[] }>('/resource-change-logs/', { params })
}
