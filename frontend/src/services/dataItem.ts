import apiClient from '../api/client';

export interface DataItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const DATA_ITEM_CATEGORIES: Record<string, string> = {
  priority: '优先级',
  project_status: '项目状态',
  project_role: '项目角色',
  user_role: '用户角色',
  org_level: '组织层级',
  resource_type: '资源类型',
  resource_availability: '资源可用性',
  requirement_type: '需求类型',
  requirement_status: '需求状态',
  development_status: '开发状态',
  testing_status: '测试状态',
  risk_status: '风险状态',
  risk_likelihood: '风险可能性',
  risk_impact: '风险影响',
  communication_type: '沟通类型',
  work_type: '工作类型',
  work_status: '工作状态',
  drill_type: '演练类型',
  drill_status: '演练状态',
  drill_target: '演练目标',
  deployment_status: '投产状态',
  config_type: '配置类型',
  user_status: '用户状态',
};

export const getDataItems = async (category: string): Promise<DataItem[]> => {
  const response = await apiClient.get(`/data-items/${category}`);
  return (response as DataItem[]).map(item => ({
    ...item,
    id: item.id || item._id
  }));
};

export const getDataItem = async (category: string, id: string): Promise<DataItem> => {
  const response = await apiClient.get(`/data-items/${category}/${id}`);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const createDataItem = async (category: string, data: Omit<DataItem, 'id' | 'created_at' | 'updated_at'>): Promise<DataItem> => {
  const response = await apiClient.post(`/data-items/${category}`, data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const updateDataItem = async (category: string, id: string, data: Partial<DataItem>): Promise<DataItem> => {
  const response = await apiClient.put(`/data-items/${category}/${id}`, data);
  return {
    ...response,
    id: response.id || response._id
  };
};

export const deleteDataItem = async (category: string, id: string): Promise<void> => {
  await apiClient.delete(`/data-items/${category}/${id}`);
};

export const initializeDataItems = async (): Promise<{ message: string }> => {
  return await apiClient.post('/data-items/initialize');
};
