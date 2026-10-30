export type { ConditionAttributeGroup } from '@/lib/api/endpoints/admin/condition-attributes';

export interface OptionEdit {
  label: string;
  description: string;
  priceModifier: number;
  modifierType: string;
}

export interface OptionFormData {
  label: string;
  description: string;
  priceModifier: number;
  modifierType: string;
  isActive: boolean;
}

export interface GroupFormData {
  label: string;
  description: string;
}
