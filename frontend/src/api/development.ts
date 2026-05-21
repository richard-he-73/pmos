import apiClient from './client';
import type { Iteration, CodeReview } from '../types/models';

export const getIterations = (params?: Record<string, any>) => apiClient.get<Iteration[]>('/development/iterations', { params });
export const getIteration = (id: string) => apiClient.get<Iteration>(`/development/iterations/${id}`);
export const createIteration = (data: Partial<Iteration>) => apiClient.post<Iteration>('/development/iterations', data);
export const updateIteration = (id: string, data: Partial<Iteration>) => apiClient.put<Iteration>(`/development/iterations/${id}`, data);
export const deleteIteration = (id: string) => apiClient.delete(`/development/iterations/${id}`);

export const getCodeReviews = (params?: Record<string, any>) => apiClient.get<CodeReview[]>('/development/code-reviews', { params });
export const createCodeReview = (data: Partial<CodeReview>) => apiClient.post<CodeReview>('/development/code-reviews', data);
export const updateCodeReview = (id: string, data: Partial<CodeReview>) => apiClient.put<CodeReview>(`/development/code-reviews/${id}`, data);
