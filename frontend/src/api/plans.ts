import apiClient from './client';

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  acceptance_criteria: string;
  owner: string;
  current_status: string;
  plan_start_date: string;
  actual_start_date?: string;
  plan_end_date: string;
  actual_end_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface GroupPlan {
  id: string;
  project_id: string;
  milestone_id: string;
  name: string;
  description: string;
  acceptance_criteria: string;
  owner: string;
  current_status: string;
  plan_start_date: string;
  actual_start_date?: string;
  plan_end_date: string;
  actual_end_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface DetailTask {
  id: string;
  project_id: string;
  milestone_id: string;
  group_id: string;
  name: string;
  description: string;
  acceptance_criteria: string;
  owner: string;
  current_status: string;
  plan_start_date: string;
  actual_start_date?: string;
  plan_end_date: string;
  actual_end_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  created_at: string;
  updated_at: string;
}

// 里程碑 API
export const getMilestones = (projectId: string) => 
  apiClient.get<Milestone[]>(`/plans/${projectId}/milestones`);
export const createMilestone = (data: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => 
  apiClient.post<Milestone>('/plans/milestones', data);
export const updateMilestone = (id: string, data: Partial<Omit<Milestone, 'id' | 'project_id' | 'created_at' | 'updated_at'>>) => 
  apiClient.put<Milestone>(`/plans/milestones/${id}`, data);
export const deleteMilestone = (id: string) => 
  apiClient.delete(`/plans/milestones/${id}`);

// 小组计划 API
export const getGroupPlans = (projectId: string) => 
  apiClient.get<GroupPlan[]>(`/plans/${projectId}/group-plans`);
export const createGroupPlan = (data: Omit<GroupPlan, 'id' | 'created_at' | 'updated_at'>) => 
  apiClient.post<GroupPlan>('/plans/group-plans', data);
export const updateGroupPlan = (id: string, data: Partial<Omit<GroupPlan, 'id' | 'project_id' | 'created_at' | 'updated_at'>>) => 
  apiClient.put<GroupPlan>(`/plans/group-plans/${id}`, data);
export const deleteGroupPlan = (id: string) => 
  apiClient.delete(`/plans/group-plans/${id}`);

// 详细任务 API
export const getDetailTasks = (projectId: string) => 
  apiClient.get<DetailTask[]>(`/plans/${projectId}/detail-tasks`);
export const createDetailTask = (data: Omit<DetailTask, 'id' | 'created_at' | 'updated_at'>) => 
  apiClient.post<DetailTask>('/plans/detail-tasks', data);
export const updateDetailTask = (id: string, data: Partial<Omit<DetailTask, 'id' | 'project_id' | 'created_at' | 'updated_at'>>) => 
  apiClient.put<DetailTask>(`/plans/detail-tasks/${id}`, data);
export const deleteDetailTask = (id: string) => 
  apiClient.delete(`/plans/detail-tasks/${id}`);
