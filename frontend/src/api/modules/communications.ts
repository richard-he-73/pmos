import request from '../request'

export interface CommType {
  id: number
  name: string
  description: string
  is_active: boolean
  project: number | null
  icon: string
  sort_order: number
}

export interface CommRecord {
  id: number
  comm_type: number
  comm_type_name?: string
  project: number
  subject: string
  content: string
  conclusion: string
  initiator: number
  initiator_name?: string
  participants: number[]
  participants_names?: string[]
  comm_date: string
  duration_minutes: number | null
  location: string
  attachments: any[]
  created_at: string
}

export function getCommTypes(params?: Record<string, any>) {
  return request.get<CommType[]>('/comm-types/', { params })
}

export function createCommType(data: Partial<CommType>) {
  return request.post<CommType>('/comm-types/', data)
}

export function updateCommType(id: number, data: Partial<CommType>) {
  return request.patch<CommType>(`/comm-types/${id}/`, data)
}

export function deleteCommType(id: number) {
  return request.delete(`/comm-types/${id}/`)
}

export function getCommRecords(params?: Record<string, any>) {
  return request.get<{ results: CommRecord[] }>('/comm-records/', { params })
}

export function getCommRecord(id: number) {
  return request.get<CommRecord>(`/comm-records/${id}/`)
}

export function createCommRecord(data: Partial<CommRecord>) {
  return request.post<CommRecord>('/comm-records/', data)
}

export function updateCommRecord(id: number, data: Partial<CommRecord>) {
  return request.patch<CommRecord>(`/comm-records/${id}/`, data)
}

export function deleteCommRecord(id: number) {
  return request.delete(`/comm-records/${id}/`)
}

export function uploadFile(data: FormData) {
  return request.post('/upload/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
