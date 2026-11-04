export type { ConditionAttributeGroup } from '@/lib/api/endpoints/admin/condition-attributes';

export interface OptionEdit {
  label: string;
  description: string;
}

export interface OptionFormData {
  label: string;
  description: string;
  isActive: boolean;
}

export interface GroupFormData {
  label: string;
  description: string;
}
