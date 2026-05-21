import apiClient from './client';
import type { Project } from '../types/models';

export const getProjects = () => apiClient.get<Project[]>('/projects');
export const getProject = (id: string) => apiClient.get<Project>(`/projects/${id}`);
export const createProject = (data: Partial<Project>) => apiClient.post<Project>('/projects', data);
export const updateProject = (id: string, data: Partial<Project>) => apiClient.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: string) => apiClient.delete(`/projects/${id}`);
export const cloneProject = (id: string, name: string) => apiClient.post<Project>(`/projects/${id}/clone`, { name });
export const getProjectStatusFlow = (id: string) => apiClient.get(`/projects/${id}/status-flow`);
export const transitionProjectStatus = (id: string, new_status: string, reason: string) =>
  apiClient.post<Project>(`/projects/${id}/status-transition`, { new_status, reason });
