import apiClient from './client';

export interface UserProfile {
  username: string;
  display_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  bio: string;
}

export interface NotificationSettings {
  emailNotification: boolean;
  inAppNotification: boolean;
  browserNotification: boolean;
  taskReminder: boolean;
  riskAlert: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotification: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactLayout: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  status: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  role_id: string;
  role_name: string;
}

export interface UserSettings {
  profile: UserProfile;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export const settingsApi = {
  getUserProfile: async (): Promise<UserProfile> => {
    return apiClient.get('/users/me/profile');
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiClient.put('/users/me/profile', data);
  },

  getNotificationSettings: async (): Promise<NotificationSettings> => {
    return apiClient.get('/users/me/settings/notifications');
  },

  updateNotificationSettings: async (data: NotificationSettings): Promise<NotificationSettings> => {
    return apiClient.put('/users/me/settings/notifications', data);
  },

  getSecuritySettings: async (): Promise<SecuritySettings> => {
    return apiClient.get('/users/me/settings/security');
  },

  updateSecuritySettings: async (data: SecuritySettings): Promise<SecuritySettings> => {
    return apiClient.put('/users/me/settings/security', data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    return apiClient.post('/users/me/change-password', data);
  },

  getAppearanceSettings: async (): Promise<AppearanceSettings> => {
    return apiClient.get('/users/me/settings/appearance');
  },

  updateAppearanceSettings: async (data: AppearanceSettings): Promise<AppearanceSettings> => {
    return apiClient.put('/users/me/settings/appearance', data);
  },

  getAllSettings: async (): Promise<UserSettings> => {
    return apiClient.get('/users/me/settings');
  },

  updateAllSettings: async (data: UserSettings): Promise<UserSettings> => {
    return apiClient.put('/users/me/settings', data);
  },

  getRoles: async (): Promise<Role[]> => {
    return apiClient.get('/roles');
  },

  createRole: async (data: Omit<Role, 'id'>): Promise<Role> => {
    return apiClient.post('/roles', data);
  },

  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    return apiClient.put(`/roles/${id}`, data);
  },

  deleteRole: async (id: string): Promise<void> => {
    return apiClient.delete(`/roles/${id}`);
  },

  getUserGroups: async (): Promise<UserGroup[]> => {
    return apiClient.get('/user-groups');
  },

  createUserGroup: async (data: Omit<UserGroup, 'id'>): Promise<UserGroup> => {
    return apiClient.post('/user-groups', data);
  },

  updateUserGroup: async (id: string, data: Partial<UserGroup>): Promise<UserGroup> => {
    return apiClient.put(`/user-groups/${id}`, data);
  },

  deleteUserGroup: async (id: string): Promise<void> => {
    return apiClient.delete(`/user-groups/${id}`);
  },

  getDataDictionaries: async (category?: string): Promise<any[]> => {
    const params = category ? `?category=${category}` : '';
    return apiClient.get(`/data-dictionaries${params}`);
  },

  createDataDictionary: async (data: any): Promise<any> => {
    return apiClient.post('/data-dictionaries', data);
  },

  updateDataDictionary: async (id: string, data: any): Promise<any> => {
    return apiClient.put(`/data-dictionaries/${id}`, data);
  },

  deleteDataDictionary: async (id: string): Promise<void> => {
    return apiClient.delete(`/data-dictionaries/${id}`);
  },

  initializeDataDictionaries: async (): Promise<any> => {
    return apiClient.post('/data-dictionaries/initialize');
  },
};
