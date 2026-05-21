import apiClient from './client';
import type { Notification } from '../types/models';

export const getNotifications = (params?: Record<string, any>) => apiClient.get<Notification[]>('/notifications', { params });
export const getUnreadCount = () => apiClient.get<{ unread_count: number }>('/notifications/unread-count');
export const createNotification = (data: Partial<Notification>) => apiClient.post<Notification>('/notifications', data);
export const updateNotification = (id: string, data: Partial<Notification>) => apiClient.put<Notification>(`/notifications/${id}`, data);
export const deleteNotification = (id: string) => apiClient.delete(`/notifications/${id}`);
export const markAllRead = () => apiClient.post('/notifications/mark-all-read');
export const createBatchNotifications = (userIds: string[], title: string, content: string = '', type: string = 'info') =>
  apiClient.post<Notification[]>('/notifications/batch', null, { params: { user_ids: userIds.join(','), title, content, type } });
