import request from '../request'

export interface Equipment {
  id: number
  name: string
  code: string
  type: 'server' | 'computer' | 'printer' | 'storage' | 'consumable' | 'other'
  specs: string
  quantity: number
  status: 'not_issued' | 'in_use' | 'recycled' | 'scrapped' | 'other'
  project: number | null
  project_name?: string
  notes: string
  borrower: number | null
  borrower_name?: string
  borrow_date: string | null
  return_date: string | null
  created_at: string
  updated_at: string
}

export interface Leave {
  id: number
  project: number | null
  applicant: number | null
  applicant_name?: string
  type: 'personal' | 'sick' | 'annual' | 'marriage' | 'maternity' | 'bereavement' | 'family_visit' | 'other'
  start_date: string
  end_date: string
  duration_days: number | null
  status: 'pending' | 'approved' | 'rejected'
  approver: number | null
  approver_name?: string
  is_cancelled: boolean
  notes: string
  created_at: string
  updated_at: string
}

export interface Timesheet {
  id: number
  project: number | null
  reporter: number | null
  reporter_name?: string
  start_date: string | null
  end_date: string | null
  type: 'workday' | 'holiday' | 'overtime' | 'leave'
  status: 'normal' | 'abnormal'
  approval_status: 'approved' | 'returned' | 'rejected'
  approver: number | null
  created_at: string
  updated_at: string
}

export interface TimesheetDetail {
  id: number
  timesheet: number
  date: string
  type: string
  hours: number
  description: string
}

export function getEquipments(params?: Record<string, any>) {
  return request.get<{ results: Equipment[] }>('/equipments/', { params })
}

export function createEquipment(data: Partial<Equipment>) {
  return request.post<Equipment>('/equipments/', data)
}

export function updateEquipment(id: number, data: Partial<Equipment>) {
  return request.patch<Equipment>(`/equipments/${id}/`, data)
}

export function deleteEquipment(id: number) {
  return request.delete(`/equipments/${id}/`)
}

export function getLeaves(params?: Record<string, any>) {
  return request.get<{ results: Leave[] }>('/leaves/', { params })
}

export function createLeave(data: Partial<Leave>) {
  return request.post<Leave>('/leaves/', data)
}

export function updateLeave(id: number, data: Partial<Leave>) {
  return request.patch<Leave>(`/leaves/${id}/`, data)
}

export function deleteLeave(id: number) {
  return request.delete(`/leaves/${id}/`)
}

export function getTimesheets(params?: Record<string, any>) {
  return request.get<{ results: Timesheet[] }>('/timesheets/', { params })
}

export function createTimesheet(data: Partial<Timesheet>) {
  return request.post<Timesheet>('/timesheets/', data)
}

export function getTimesheetDetails(params?: Record<string, any>) {
  return request.get<{ results: TimesheetDetail[] }>('/timesheet-details/', { params })
}

export function createTimesheetDetail(data: Partial<TimesheetDetail>) {
  return request.post<TimesheetDetail>('/timesheet-details/', data)
}

export function deleteTimesheetDetail(id: number) {
  return request.delete(`/timesheet-details/${id}/`)
}
