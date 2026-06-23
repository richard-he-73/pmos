import request from '../request'

export interface Notification {
  id: number
  project: number | null
  project_name?: string
  recipient: number
  recipient_name?: string
  type: string
  title: string
  content: string
  is_read: boolean
  read_at: string | null
  related_type: string
  related_id: number | null
  created_at: string
}

export interface NotificationTemplate {
  id: number
  code: string
  title_template: string
  content_template: string
  description: string
}

export function getNotifications(params?: Record<string, any>) {
  return request.get<{ count: number; results: Notification[] }>('/notifications/', { params })
}

export function getNotification(id: number) {
  return request.get<Notification>(`/notifications/${id}/`)
}

export function markNotificationRead(id: number) {
  return request.post(`/notifications/${id}/mark_read/`)
}

export function markAllNotificationsRead() {
  return request.post('/notifications/mark_all_read/')
}

export function deleteNotification(id: number) {
  return request.delete(`/notifications/${id}/`)
}

export function updateNotification(id: number, data: Partial<Notification>) {
  return request.patch<Notification>(`/notifications/${id}/`, data)
}

export function getNotificationTemplates(params?: Record<string, any>) {
  return request.get<NotificationTemplate[]>('/notification-templates/', { params })
}

export function getNotificationTemplate(id: number) {
  return request.get<NotificationTemplate>(`/notification-templates/${id}/`)
}

export function createNotificationTemplate(data: Partial<NotificationTemplate>) {
  return request.post<NotificationTemplate>('/notification-templates/', data)
}

export function updateNotificationTemplate(id: number, data: Partial<NotificationTemplate>) {
  return request.patch<NotificationTemplate>(`/notification-templates/${id}/`, data)
}

export function deleteNotificationTemplate(id: number) {
  return request.delete(`/notification-templates/${id}/`)
}
