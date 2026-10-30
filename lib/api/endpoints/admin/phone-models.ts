import { httpClient } from '../../httpClient';

export interface PhoneModel {
  id: string;
  label: string;
  model: string;
  storage: string;
  buyingPrice: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhoneModelRequest {
  label: string;
  model: string;
  storage: string;
  buyingPrice: number;
  isActive?: boolean;
  order?: number;
}

export interface UpdatePhoneModelRequest {
  label?: string;
  model?: string;
  storage?: string;
  buyingPrice?: number;
  isActive?: boolean;
  order?: number;
}

export async function getPhoneModels(includeInactive = false) {
  const query = includeInactive ? '?admin=1' : '';
  return httpClient.get<PhoneModel[]>(`/api/admin/phone-models${query}`);
}

export async function getPhoneModel(id: string) {
  return httpClient.get<PhoneModel>(`/api/admin/phone-models/${id}`);
}

export async function createPhoneModel(payload: CreatePhoneModelRequest) {
  return httpClient.post<PhoneModel, CreatePhoneModelRequest>('/api/admin/phone-models', payload);
}

export async function updatePhoneModel(id: string, payload: UpdatePhoneModelRequest) {
  return httpClient.patch<PhoneModel, UpdatePhoneModelRequest>(`/api/admin/phone-models/${id}`, payload);
}

export async function deletePhoneModel(id: string) {
  return httpClient.delete(`/api/admin/phone-models/${id}`);
}
