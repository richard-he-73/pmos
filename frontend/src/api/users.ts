import apiClient from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  display_name: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  display_name?: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ResetPasswordRequest {
  new_password: string;
}

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get('/users');
  },

  getUser: async (id: string): Promise<User> => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    return apiClient.post('/users', data);
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    return apiClient.put(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete(`/users/${id}`);
  },

  resetPassword: async (id: string, data: ResetPasswordRequest): Promise<void> => {
    return apiClient.post(`/users/${id}/reset-password`, data);
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    return apiClient.post(`/users/${id}/toggle-status`);
  },
};