import request from '../request'

export interface DocumentCategory {
  id: number
  name: string
  parent: number | null
  project: number
  sort_order: number
}

export interface Document {
  id: number
  project: number | null
  project_name?: string
  doc_type: 'report' | 'plan' | 'requirement' | 'minutes' | 'other'
  title: string
  version: string
  file_format: string
  file_size: string
  upload_time: string | null
  uploader: number | null
  uploader_name?: string
  archive_status: 'unarchived' | 'archived'
  file: string | null
  created_at: string
  updated_at: string | null
}

export function getDocumentCategories(params?: Record<string, any>) {
  return request.get<DocumentCategory[]>('/document-categories/', { params })
}

export function createDocumentCategory(data: Partial<DocumentCategory>) {
  return request.post<DocumentCategory>('/document-categories/', data)
}

export function deleteDocumentCategory(id: number) {
  return request.delete(`/document-categories/${id}/`)
}

export function getDocuments(params?: Record<string, any>) {
  return request.get<{ count: number; results: Document[] }>('/documents/', { params })
}

export function getDocument(id: number) {
  return request.get<Document>(`/documents/${id}/`)
}

export function createDocument(data: FormData) {
  return request.post<Document>('/documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updateDocument(id: number, data: FormData | Partial<Document>) {
  if (data instanceof FormData) {
    return request.put<Document>(`/documents/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
  return request.patch<Document>(`/documents/${id}/`, data)
}

export function deleteDocument(id: number) {
  return request.delete(`/documents/${id}/`)
}
