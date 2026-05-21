import apiClient from './client';
import type { Requirement } from '../types/models';

export const getRequirements = (params?: Record<string, any>) => apiClient.get<Requirement[]>('/requirements', { params });
export const getRequirement = (id: string) => apiClient.get<Requirement>(`/requirements/${id}`);
export const createRequirement = (data: Partial<Requirement>) => apiClient.post<Requirement>('/requirements', data);
export const updateRequirement = (id: string, data: Partial<Requirement>) => apiClient.put<Requirement>(`/requirements/${id}`, data);
export const deleteRequirement = (id: string) => apiClient.delete(`/requirements/${id}`);
