import request from '../request'

export interface Plan {
  id: number
  name: string
  type: 'milestone' | 'group' | 'detail'
  parent: number | null
  project: number
  start_date: string
  end_date: string
  actual_end_date: string | null
  status: 'draft' | 'in_progress' | 'completed' | 'delayed'
  progress: number
  assignee: number | null
  description: string
  sort_order: number
}

export interface Task {
  id: number
  name: string
  description: string
  plan: number
  status: 'todo' | 'in_progress' | 'done' | 'closed'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  assignee: number | null
  assignee_name: string
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  parent: number | null
  sort_order: number
}

export function getPlans(params?: Record<string, any>) {
  return request.get<Plan[]>('/plans/', { params })
}

export function getPlan(id: number) {
  return request.get<Plan>(`/plans/${id}/`)
}

export function getPlanGantt(id: number) {
  return request.get<{ plan: Plan; tasks: Task[] }>(`/plans/${id}/gantt/`)
}

export function getPlanTasks(id: number) {
  return request.get<Task[]>(`/plans/${id}/tasks/`)
}

export function createPlan(data: Partial<Plan>) {
  return request.post<Plan>('/plans/', data)
}

export function updatePlan(id: number, data: Partial<Plan>) {
  return request.patch<Plan>(`/plans/${id}/`, data)
}

export function deletePlan(id: number) {
  return request.delete(`/plans/${id}/`)
}

export function getTasks(params?: Record<string, any>) {
  return request.get<Task[]>('/tasks/', { params })
}

export function createTask(data: Partial<Task>) {
  return request.post<Task>('/tasks/', data)
}

export function updateTask(id: number, data: Partial<Task>) {
  return request.patch<Task>(`/tasks/${id}/`, data)
}

export function updateTaskStatus(id: number, status: string) {
  return request.patch<Task>(`/tasks/${id}/status/`, { status })
}
