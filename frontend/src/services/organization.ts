import apiClient from '../api/client';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobLevel {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get('/organization/departments');
  // 确保每个部门都有 id 字段（从 _id 转换）
  return (response as any[]).map(dept => ({
    ...dept,
    id: dept.id || dept._id
  }));
};

export const getDepartment = async (id: string): Promise<Department> => {
  const response = await apiClient.get(`/organization/departments/${id}`);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const createDepartment = async (data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  const response = await apiClient.post('/organization/departments', data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const updateDepartment = async (id: string, data: Partial<Department>): Promise<Department> => {
  const response = await apiClient.put(`/organization/departments/${id}`, data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/organization/departments/${id}`);
};

export const getJobLevels = async (): Promise<JobLevel[]> => {
  const response = await apiClient.get('/organization/job-levels');
  // 确保每个职级都有 id 字段（从 _id 转换）
  return (response as any[]).map(level => ({
    ...level,
    id: level.id || level._id
  }));
};

export const getJobLevel = async (id: string): Promise<JobLevel> => {
  const response = await apiClient.get(`/organization/job-levels/${id}`);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const createJobLevel = async (data: Omit<JobLevel, 'id' | 'created_at' | 'updated_at'>): Promise<JobLevel> => {
  const response = await apiClient.post('/organization/job-levels', data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const updateJobLevel = async (id: string, data: Partial<JobLevel>): Promise<JobLevel> => {
  const response = await apiClient.put(`/organization/job-levels/${id}`, data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const deleteJobLevel = async (id: string): Promise<void> => {
  await apiClient.delete(`/organization/job-levels/${id}`);
};

export const initializeOrganizationData = async (): Promise<{ message: string }> => {
  return await apiClient.post('/organization/initialize');
};