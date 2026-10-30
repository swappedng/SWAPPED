import { httpClient } from '../../httpClient';

export interface AssessmentStep {
  id: string;
  label: string;
  key: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  options?: AssessmentOption[];
}

export interface AssessmentOption {
  id: string;
  groupId: string;
  value: string;
  label: string;
  description?: string;
  priceModifier: number;
  modifierType: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentRequest {
  label: string;
  key: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateAssessmentRequest {
  label?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CreateAssessmentOptionRequest {
  groupId: string;
  value: string;
  label: string;
  description?: string;
  priceModifier: number;
  modifierType?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateAssessmentOptionRequest {
  value?: string;
  label?: string;
  description?: string;
  priceModifier?: number;
  modifierType?: string;
  isActive?: boolean;
  order?: number;
}

// Assessment steps
export async function getAssessmentSteps() {
  return httpClient.get<AssessmentStep[]>('/api/admin/assessment');
}

export async function getAssessmentStep(id: string) {
  return httpClient.get<AssessmentStep>(`/api/admin/assessment/${id}`);
}

export async function createAssessmentStep(payload: CreateAssessmentRequest) {
  return httpClient.post<AssessmentStep, CreateAssessmentRequest>('/api/admin/assessment', payload);
}

export async function updateAssessmentStep(id: string, payload: UpdateAssessmentRequest) {
  return httpClient.patch<AssessmentStep, UpdateAssessmentRequest>(`/api/admin/assessment/${id}`, payload);
}

export async function deleteAssessmentStep(id: string) {
  return httpClient.delete(`/api/admin/assessment/${id}`);
}

// Assessment options
export async function getAssessmentOptions() {
  return httpClient.get<AssessmentOption[]>('/api/admin/assessment/options');
}

export async function getAssessmentOption(id: string) {
  return httpClient.get<AssessmentOption>(`/api/admin/assessment/options/${id}`);
}

export async function createAssessmentOption(payload: CreateAssessmentOptionRequest) {
  return httpClient.post<AssessmentOption, CreateAssessmentOptionRequest>('/api/admin/assessment/options', payload);
}

export async function updateAssessmentOption(id: string, payload: UpdateAssessmentOptionRequest) {
  return httpClient.patch<AssessmentOption, UpdateAssessmentOptionRequest>(`/api/admin/assessment/options/${id}`, payload);
}
