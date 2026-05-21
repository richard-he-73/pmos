import apiClient from './client';
import type { Task } from '../types/models';

export const getTasks = (projectId?: string, assigneeId?: string, statusFilter?: string, priority?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set('project_id', projectId);
  if (assigneeId) params.set('assignee_id', assigneeId);
  if (statusFilter) params.set('status_filter', statusFilter);
  if (priority) params.set('priority', priority);
  const query = params.toString();
  return apiClient.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
};

export const getTask = (id: string) => apiClient.get<Task>(`/tasks/${id}`);
export const createTask = (data: Partial<Task>) => apiClient.post<Task>('/tasks', data);
export const updateTask = (id: string, data: Partial<Task>) => apiClient.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: string) => apiClient.delete(`/tasks/${id}`);
export const getTaskDependencies = (taskId: string) => apiClient.get(`/tasks/${taskId}/dependencies`);
export const addTaskDependency = (taskId: string, dependencyId: string) =>
  apiClient.post<Task>(`/tasks/${taskId}/dependencies`, { dependency_id: dependencyId });
export const removeTaskDependency = (taskId: string, dependencyId: string) =>
  apiClient.delete<Task>(`/tasks/${taskId}/dependencies/${dependencyId}`);
