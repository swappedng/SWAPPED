import { httpClient } from '../../httpClient';
import {
  AvailabilityBlock,
  CreateAvailabilityBlockRequest,
  UpdateAvailabilityBlockRequest,
} from '../../types/tradein';

export function getAvailabilityBlocks() {
  return httpClient.get<AvailabilityBlock[]>('/api/admin/availability');
}

export function createAvailabilityBlock(payload: CreateAvailabilityBlockRequest) {
  return httpClient.post<AvailabilityBlock, CreateAvailabilityBlockRequest>('/api/admin/availability', payload);
}

export function updateAvailabilityBlock(id: string, payload: UpdateAvailabilityBlockRequest) {
  return httpClient.patch<AvailabilityBlock, UpdateAvailabilityBlockRequest>(`/api/admin/availability/${id}`, payload);
}

export function deleteAvailabilityBlock(id: string) {
  return httpClient.delete(`/api/admin/availability/${id}`);
}
