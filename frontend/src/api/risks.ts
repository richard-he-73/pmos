import apiClient from './client';
import type { Risk } from '../types/models';

export const getRisks = (params?: Record<string, any>) => apiClient.get<Risk[]>('/risks', { params });
export const getRisk = (id: string) => apiClient.get<Risk>(`/risks/${id}`);
export const createRisk = (data: Partial<Risk>) => apiClient.post<Risk>('/risks', data);
export const updateRisk = (id: string, data: Partial<Risk>) => apiClient.put<Risk>(`/risks/${id}`, data);
export const deleteRisk = (id: string) => apiClient.delete(`/risks/${id}`);
