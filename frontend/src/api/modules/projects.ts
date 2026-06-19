import request from '../request'

export interface Project {
  id: number
  code: string
  name: string
  description: string
  project_domain: 'overall_planning' | 'project_management' | 'professional_consulting'
  consulting_direction: 'core' | 'credit' | 'credit_card' | 'payment' | 'channel' | 'operations' | 'finance_accounting' | 'digital_transform' | 'ai' | 'other'
  project_type: 'monthly' | 'fixed' | 'resource_pool'
  start_date: string | null
  end_date: string | null
  owner: number
  owner_name: string
  status: 'planning' | 'active' | 'pending_acceptance' | 'closed'
  contract_price: number | null
  budget_price: number | null
  contract_status: 'draft' | 'pending_legal' | 'pending_sign' | 'signed' | 'archived'
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
