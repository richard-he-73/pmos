import request from '../request'

export interface Project {
  id: number
  name: string
  code: string
  description: string
  status: 'planning' | 'active' | 'closed'
  start_date: string | null
  end_date: string | null
  owner: number
  owner_name: string
  created_at: string
  updated_at: string
}

export function getProjects(params?: Record<string, any>) {
  return request.get<{ count: number; results: Project[] }>('/projects/', { params })
}

export function getProject(id: number) {
  return request.get<Project>(`/projects/${id}/`)
}

export function createProject(data: Partial<Project>) {
  return request.post<Project>('/projects/', data)
}

export function updateProject(id: number, data: Partial<Project>) {
  return request.patch<Project>(`/projects/${id}/`, data)
}

export function deleteProject(id: number) {
  return request.delete(`/projects/${id}/`)
}
