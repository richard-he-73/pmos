import apiClient from './client';

export const exportProjectsCSV = (statusFilter?: string) => {
  const url = `/api/v1/export/projects/csv${statusFilter ? `?status_filter=${statusFilter}` : ''}`;
  window.open(url, '_blank');
};

export const exportProjectsJSON = (statusFilter?: string) => {
  const url = `/api/v1/export/projects/json${statusFilter ? `?status_filter=${statusFilter}` : ''}`;
  window.open(url, '_blank');
};

export const exportTasksCSV = (projectId?: string, statusFilter?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set('project_id', projectId);
  if (statusFilter) params.set('status_filter', statusFilter);
  const url = `/api/v1/export/tasks/csv${params.toString() ? `?${params.toString()}` : ''}`;
  window.open(url, '_blank');
};

export const exportTasksJSON = (projectId?: string, statusFilter?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set('project_id', projectId);
  if (statusFilter) params.set('status_filter', statusFilter);
  const url = `/api/v1/export/tasks/json${params.toString() ? `?${params.toString()}` : ''}`;
  window.open(url, '_blank');
};

export const exportRisksCSV = (projectId?: string, statusFilter?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set('project_id', projectId);
  if (statusFilter) params.set('status_filter', statusFilter);
  const url = `/api/v1/export/risks/csv${params.toString() ? `?${params.toString()}` : ''}`;
  window.open(url, '_blank');
};

export const exportRequirementsCSV = (projectId?: string, statusFilter?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set('project_id', projectId);
  if (statusFilter) params.set('status_filter', statusFilter);
  const url = `/api/v1/export/requirements/csv${params.toString() ? `?${params.toString()}` : ''}`;
  window.open(url, '_blank');
};

export const exportSummaryReport = () => {
  const url = '/api/v1/export/summary/report';
  window.open(url, '_blank');
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header] ?? '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};
