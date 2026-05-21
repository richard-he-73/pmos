import apiClient from './client';
import type { Communication, ConfigItem, DrillPlan, DeploymentPlan, WorkRecord } from '../types/models';

// Communication
export const getCommunications = (params?: Record<string, any>) => apiClient.get<Communication[]>('/communications', { params });
export const createCommunication = (data: Partial<Communication>) => apiClient.post<Communication>('/communications', data);
export const updateCommunication = (id: string, data: Partial<Communication>) => apiClient.put<Communication>(`/communications/${id}`, data);
export const deleteCommunication = (id: string) => apiClient.delete(`/communications/${id}`);

// Configuration
export const getConfigItems = (params?: Record<string, any>) => apiClient.get<ConfigItem[]>('/configuration/items', { params });
export const createConfigItem = (data: Partial<ConfigItem>) => apiClient.post<ConfigItem>('/configuration/items', data);
export const updateConfigItem = (id: string, data: Partial<ConfigItem>) => apiClient.put<ConfigItem>(`/configuration/items/${id}`, data);
export const deleteConfigItem = (id: string) => apiClient.delete(`/configuration/items/${id}`);

// Drill
export const getDrills = (params?: Record<string, any>) => apiClient.get<DrillPlan[]>('/configuration/drills', { params });
export const createDrill = (data: Partial<DrillPlan>) => apiClient.post<DrillPlan>('/configuration/drills', data);
export const updateDrill = (id: string, data: Partial<DrillPlan>) => apiClient.put<DrillPlan>(`/configuration/drills/${id}`, data);
export const deleteDrill = (id: string) => apiClient.delete(`/configuration/drills/${id}`);

// Deployment
export const getDeployments = (params?: Record<string, any>) => apiClient.get<DeploymentPlan[]>('/configuration/deployments', { params });
export const createDeployment = (data: Partial<DeploymentPlan>) => apiClient.post<DeploymentPlan>('/configuration/deployments', data);
export const updateDeployment = (id: string, data: Partial<DeploymentPlan>) => apiClient.put<DeploymentPlan>(`/configuration/deployments/${id}`, data);
export const deleteDeployment = (id: string) => apiClient.delete(`/configuration/deployments/${id}`);

// Work
export const getWorkRecords = (params?: Record<string, any>) => apiClient.get<WorkRecord[]>('/configuration/work-records', { params });
export const createWorkRecord = (data: Partial<WorkRecord>) => apiClient.post<WorkRecord>('/configuration/work-records', data);
export const updateWorkRecord = (id: string, data: Partial<WorkRecord>) => apiClient.put<WorkRecord>(`/configuration/work-records/${id}`, data);
export const deleteWorkRecord = (id: string) => apiClient.delete(`/configuration/work-records/${id}`);
