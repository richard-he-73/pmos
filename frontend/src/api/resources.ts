import apiClient from './client';
import type { Resource } from '../types/models';

export const getResources = (typeFilter?: string, availability?: string) => {
  const params = new URLSearchParams();
  if (typeFilter) params.set('type_filter', typeFilter);
  if (availability) params.set('availability', availability);
  const query = params.toString();
  return apiClient.get<Resource[]>(`/resources${query ? `?${query}` : ''}`);
};

export const getResource = (id: string) => apiClient.get<Resource>(`/resources/${id}`);
export const createResource = (data: Partial<Resource>) => apiClient.post<Resource>('/resources', data);
export const updateResource = (id: string, data: Partial<Resource>) => apiClient.put<Resource>(`/resources/${id}`, data);
export const deleteResource = (id: string) => apiClient.delete(`/resources/${id}`);
export const checkResourceConflicts = () => apiClient.get('/resources/conflicts');
export const getAlerts = () => apiClient.get('/resources/alerts');
