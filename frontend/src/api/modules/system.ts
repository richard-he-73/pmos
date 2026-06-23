import request from '../request'

export interface OperationLog {
  id: number
  user: number | null
  username?: string
  action: string
  model_name: string
  object_id: string
  object_repr: string
  detail: Record<string, any>
  ip_address: string | null
  created_at: string
}

export interface SystemConfig {
  id: number
  key: string
  value: any
  description: string
  updated_at: string
}

export interface BackupFile {
  filename: string
  file_size: number
  created_at: string
  summary: Record<string, number>
  total_tables: number
  total_records: number
  meta?: Record<string, any>
}

export function getOperationLogs(params?: Record<string, any>) {
  return request.get<{ results: OperationLog[] }>('/system/logs/', { params })
}

export function getSystemConfigs() {
  return request.get<SystemConfig[]>('/system/configs/')
}

export function updateSystemConfig(id: number, data: Partial<SystemConfig>) {
  return request.patch<SystemConfig>(`/system/configs/${id}/`, data)
}

export function getBackups() {
  return request.get<BackupFile[]>('/system/backup/')
}

export function createBackup() {
  return request.post<BackupFile>('/system/backup/')
}

export function getBackupDetail(filename: string) {
  return request.get<BackupFile>(`/system/backup/${filename}/`)
}

export function restoreBackup(filename: string) {
  return request.post(`/system/backup/${filename}/`)
}

export function deleteBackup(filename: string) {
  return request.delete(`/system/backup/${filename}/`)
}
