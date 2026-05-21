import apiClient from './client';
import type { Role, UserGroup, OperationLog } from '../types/models';

export const getRoles = (params?: Record<string, any>) => apiClient.get<Role[]>('/permissions/roles', { params });
export const createRole = (data: Partial<Role>) => apiClient.post<Role>('/permissions/roles', data);
export const updateRole = (id: string, data: Partial<Role>) => apiClient.put<Role>(`/permissions/roles/${id}`, data);
export const deleteRole = (id: string) => apiClient.delete(`/permissions/roles/${id}`);

export const getGroups = (params?: Record<string, any>) => apiClient.get<UserGroup[]>('/permissions/groups', { params });
export const createGroup = (data: Partial<UserGroup>) => apiClient.post<UserGroup>('/permissions/groups', data);
export const updateGroup = (id: string, data: Partial<UserGroup>) => apiClient.put<UserGroup>(`/permissions/groups/${id}`, data);
export const deleteGroup = (id: string) => apiClient.delete(`/permissions/groups/${id}`);

export const getOperationLogs = (params?: Record<string, any>) => apiClient.get<OperationLog[]>('/permissions/logs', { params });
export const createOperationLog = (data: Partial<OperationLog>) => apiClient.post<OperationLog>('/permissions/logs', data);
