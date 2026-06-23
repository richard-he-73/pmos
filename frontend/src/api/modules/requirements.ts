import request from '../request'

export interface Requirement {
  id: number
  type: 'business' | 'software_func' | 'software_perf' | 'other'
  name: string
  description: string
  assignee: number | null
  assignee_name?: string
  due_date: string | null
  notes: string
  document: string | null
  document_url?: string | null
  status: 'submitted' | 'pending_review' | 'review_passed' | 'baselined'
  project: number
  submitter: number | null
  submitter_name?: string
  review_assignee: number | null
  review_assignee_name?: string
  created_at: string
  updated_at: string
}

export interface RequirementReview {
  id: number
  requirement: number
  requirement_name?: string
  reviewer: number | null
  reviewer_name?: string
  stakeholders: number[]
  stakeholders_ids?: number[]
  stakeholders_names?: string[]
  review_method: 'meeting' | 'email' | 'circulation' | 'other'
  review_date: string
  conclusion: 'pass' | 'conditional_pass' | 'fail'
  notes: string
  document: string | null
  document_url?: string | null
  created_at: string
}

export interface RequirementBaseline {
  id: number
  type: string
  name: string
  description: string
  version: string
  notes: string
  requirement_ids: number[]
  requirements_data?: Requirement[]
  project: number
  created_by: number | null
  created_by_name?: string
  created_at: string
}

export interface RequirementChange {
  id: number
  baseline: number
  baseline_name?: string
  baseline_version: string
  object_desc: string
  content: string
  assignee: number | null
  assignee_name?: string
  approver: number | null
  approver_name?: string
  approval_status: 'pending' | 'approved' | 'rejected'
  notes: string
  created_by: number | null
  created_by_name?: string
  created_at: string
  updated_at: string
}

export const TYPE_LABELS: Record<string, string> = {
  business: '业务需求', software_func: '软件功能需求',
  software_perf: '软件性能需求', other: '其他需求',
}
export const STATUS_LABELS: Record<string, string> = {
  submitted: '已提交', pending_review: '待评审',
  review_passed: '评审通过', baselined: '纳入基线',
}

export function getRequirements(params?: Record<string, any>) {
  return request.get<{ count: number; results: Requirement[] }>('/requirements/', { params })
}
export function getRequirement(id: number) {
  return request.get<Requirement>(`/requirements/${id}/`)
}
export function createRequirement(data: Partial<Requirement>) {
  return request.post<Requirement>('/requirements/', data)
}
export function updateRequirement(id: number, data: Partial<Requirement>) {
  return request.patch<Requirement>(`/requirements/${id}/`, data)
}
export function deleteRequirement(id: number) {
  return request.delete(`/requirements/${id}/`)
}
export function submitReview(id: number, data: { review_assignee_id?: number | null }) {
  return request.post(`/requirements/${id}/submit_review/`, data)
}
export function withdrawReview(id: number) {
  return request.post(`/requirements/${id}/withdraw_review/`)
}

export function getReqReviews(params?: Record<string, any>) {
  return request.get<{ results: RequirementReview[] }>('/req-reviews/', { params })
}
export function createReqReview(data: Partial<RequirementReview>) {
  return request.post<RequirementReview>('/req-reviews/', data)
}

export function getReqBaselines(params?: Record<string, any>) {
  return request.get<{ results: RequirementBaseline[] }>('/req-baselines/', { params })
}
export function getReqBaseline(id: number) {
  return request.get<RequirementBaseline>(`/req-baselines/${id}/`)
}
export function createReqBaseline(data: Partial<RequirementBaseline>) {
  return request.post<RequirementBaseline>('/req-baselines/', data)
}
export function deleteReqBaseline(id: number) {
  return request.delete(`/req-baselines/${id}/`)
}

export function getReqChanges(params?: Record<string, any>) {
  return request.get<{ results: RequirementChange[] }>('/req-changes/', { params })
}
export function createReqChange(data: Partial<RequirementChange>) {
  return request.post<RequirementChange>('/req-changes/', data)
}
export function updateReqChange(id: number, data: Partial<RequirementChange>) {
  return request.patch<RequirementChange>(`/req-changes/${id}/`, data)
}
export function approveReqChange(id: number) {
  return request.post<RequirementChange>(`/req-changes/${id}/approve/`)
}
export function rejectReqChange(id: number) {
  return request.post<RequirementChange>(`/req-changes/${id}/reject/`)
}
