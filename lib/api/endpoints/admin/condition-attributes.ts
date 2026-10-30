import { httpClient } from '../../httpClient';
import { ConditionType, PriceModifierType } from '../../types/enums';

export interface ConditionAttributeGroup {
  id: string;
  key: ConditionType;
  label: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  options?: ConditionAttributeOption[];
}

export interface ConditionAttributeOption {
  id: string;
  groupId: string;
  label: string;
  description?: string;
  imagePath?: string;
  priceModifier: number;
  modifierType: PriceModifierType;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  key: ConditionType;
  label: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateGroupRequest {
  label?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateOptionRequest {
  groupId: string;
  label: string;
  description?: string;
  imagePath?: string;
  priceModifier: number;
  modifierType?: PriceModifierType;
  isActive?: boolean;
  order?: number;
}

export interface UpdateOptionRequest {
  label?: string;
  description?: string;
  imagePath?: string;
  priceModifier?: number;
  modifierType?: PriceModifierType;
  isActive?: boolean;
  order?: number;
}

export async function getConditionAttributeGroups() {
  return httpClient.get<ConditionAttributeGroup[]>('/api/admin/condition-attributes/groups');
}

export async function createConditionAttributeGroup(payload: CreateGroupRequest) {
  return httpClient.post<ConditionAttributeGroup, CreateGroupRequest>('/api/admin/condition-attributes/groups', payload);
}

export async function updateConditionAttributeGroup(id: string, payload: UpdateGroupRequest) {
  return httpClient.patch<ConditionAttributeGroup, UpdateGroupRequest>(`/api/admin/condition-attributes/groups/${id}`, payload);
}

export async function deleteConditionAttributeGroup(id: string) {
  return httpClient.delete(`/api/admin/condition-attributes/groups/${id}`);
}

export async function createConditionAttributeOption(payload: CreateOptionRequest) {
  return httpClient.post<ConditionAttributeOption, CreateOptionRequest>('/api/admin/condition-attributes/options', payload);
}

export async function updateConditionAttributeOption(id: string, payload: UpdateOptionRequest) {
  return httpClient.patch<ConditionAttributeOption, UpdateOptionRequest>(`/api/admin/condition-attributes/options/${id}`, payload);
}

export async function deleteConditionAttributeOption(id: string) {
  return httpClient.delete(`/api/admin/condition-attributes/options/${id}`);
}
