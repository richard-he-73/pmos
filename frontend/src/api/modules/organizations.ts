import request from '../request'

export interface Department {
  id: number
  name: string
  project: number | null
  parent: number | null
  manager: number | null
  manager_name?: string
  sort_order: number
  is_active: boolean
  description: string
  created_at: string
  children?: Department[]
}

export interface UserOrganization {
  id: number
  project: number | null
  consultant: number | null
  consultant_name?: string
  name: string
  gender: string
  age: number | null
  rank: string
  project_role: string
  department: number
  department_name?: string
  phone: string
  email: string
  joined_at: string | null
}

export function getDepartments(params?: Record<string, any>) {
  return request.get<{ results: Department[] }>('/departments/', { params })
}

export function getDepartment(id: number) {
  return request.get<Department>(`/departments/${id}/`)
}

export function createDepartment(data: Partial<Department>) {
  return request.post<Department>('/departments/', data)
}

export function updateDepartment(id: number, data: Partial<Department>) {
  return request.patch<Department>(`/departments/${id}/`, data)
}

export function deleteDepartment(id: number) {
  return request.delete(`/departments/${id}/`)
}

export function getOrgMembers(params?: Record<string, any>) {
  return request.get<{ results: UserOrganization[] }>('/org-members/', { params })
}

export function getOrgMember(id: number) {
  return request.get<UserOrganization>(`/org-members/${id}/`)
}

export function createOrgMember(data: Partial<UserOrganization>) {
  return request.post<UserOrganization>('/org-members/', data)
}

export function updateOrgMember(id: number, data: Partial<UserOrganization>) {
  return request.patch<UserOrganization>(`/org-members/${id}/`, data)
}

export function deleteOrgMember(id: number) {
  return request.delete(`/org-members/${id}/`)
}
