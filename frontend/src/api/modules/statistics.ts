import request from '../request'

export interface StatsOverview {
  total: number
  by_status: { status: string; count: number }[]
}

export interface ProjectStats {
  plans: { total: number; completed: number; in_progress: number }
  tasks: { total: number; completed: number; in_progress: number }
  bugs: { total: number; open: number; by_severity: { severity: string; count: number }[] }
  test_cases: { total: number }
}

export function getProjectOverview(params?: { project?: number | string }) {
  const url = params?.project
    ? `/statistics/project_overview/?project=${params.project}`
    : '/statistics/project_overview/'
  return request.get<StatsOverview>(url)
}

export function getProjectDetailStats(projectId: number) {
  return request.get<ProjectStats>('/statistics/project_detail/', {
    params: { project: projectId },
  })
}

export function getBugTrend(projectId?: number) {
  return request.get('/statistics/bug_trend/', {
    params: projectId ? { project: projectId } : {},
  })
}

export function getTimesheetSummary(projectId?: number) {
  return request.get('/statistics/timesheet_summary/', {
    params: projectId ? { project: projectId } : {},
  })
}
