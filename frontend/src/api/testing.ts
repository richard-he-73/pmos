import apiClient from './client';
import type { TestCase, Defect, TestReport } from '../types/models';

export const getTestCases = (params?: Record<string, any>) => apiClient.get<TestCase[]>('/testing/test-cases', { params });
export const getTestCase = (id: string) => apiClient.get<TestCase>(`/testing/test-cases/${id}`);
export const createTestCase = (data: Partial<TestCase>) => apiClient.post<TestCase>('/testing/test-cases', data);
export const updateTestCase = (id: string, data: Partial<TestCase>) => apiClient.put<TestCase>(`/testing/test-cases/${id}`, data);
export const deleteTestCase = (id: string) => apiClient.delete(`/testing/test-cases/${id}`);

export const getDefects = (params?: Record<string, any>) => apiClient.get<Defect[]>('/testing/defects', { params });
export const getDefect = (id: string) => apiClient.get<Defect>(`/testing/defects/${id}`);
export const createDefect = (data: Partial<Defect>) => apiClient.post<Defect>('/testing/defects', data);
export const updateDefect = (id: string, data: Partial<Defect>) => apiClient.put<Defect>(`/testing/defects/${id}`, data);
export const deleteDefect = (id: string) => apiClient.delete(`/testing/defects/${id}`);

export const getTestReports = (params?: Record<string, any>) => apiClient.get<TestReport[]>('/testing/reports', { params });
export const getTestReport = (id: string) => apiClient.get<TestReport>(`/testing/reports/${id}`);
export const createTestReport = (data: Partial<TestReport>) => apiClient.post<TestReport>('/testing/reports', data);
export const updateTestReport = (id: string, data: Partial<TestReport>) => apiClient.put<TestReport>(`/testing/reports/${id}`, data);
export const deleteTestReport = (id: string) => apiClient.delete(`/testing/reports/${id}`);
