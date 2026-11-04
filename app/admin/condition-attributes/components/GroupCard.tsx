'use client';

import { Pencil, Trash2, Plus } from 'lucide-react';
import { type ConditionAttributeGroup } from '@/lib/api/endpoints/admin/condition-attributes';
import { type OptionEdit, type OptionFormData, type GroupFormData } from './types';
import { getGroupIcon } from './utils';
import { InlineOptionForm } from './InlineOptionForm';
import { OptionRow } from './OptionRow';
import { OptionEditRow } from './OptionEditRow';

interface Props {
  group: ConditionAttributeGroup;

  // group-level edit
  isEditingGroup: boolean;
  groupFormData: GroupFormData;
  onGroupFormChange: (data: GroupFormData) => void;
  onGroupSubmit: (groupId: string) => void;
  onGroupEditCancel: () => void;
  onGroupEditStart: (group: ConditionAttributeGroup) => void;
  onDeleteGroup: (id: string) => void;

  // bulk option edit
  isEditingOptions: boolean;
  optionEdits: Record<string, OptionEdit>;
  onOptionEditChange: (id: string, edits: OptionEdit) => void;
  onOptionsSave: (group: ConditionAttributeGroup) => void;
  onOptionsEditStart: (group: ConditionAttributeGroup) => void;
  onOptionsEditCancel: () => void;
  saving: boolean;

  // single option inline form
  editingOptionId: string | null;
  addingToGroupKey: string | null;
  optionFormData: OptionFormData;
  onOptionFormChange: (data: OptionFormData) => void;
  onOptionFormSubmit: (groupId: string, isNew: boolean, optionId?: string) => void;
  onOptionFormCancel: () => void;
  onAddOptionStart: (group: ConditionAttributeGroup) => void;
}

export function GroupCard({
  group,
  isEditingGroup,
  groupFormData,
  onGroupFormChange,
  onGroupSubmit,
  onGroupEditCancel,
  onGroupEditStart,
  onDeleteGroup,
  isEditingOptions,
  optionEdits,
  onOptionEditChange,
  onOptionsSave,
  onOptionsEditStart,
  onOptionsEditCancel,
  saving,
  editingOptionId,
  addingToGroupKey,
  optionFormData,
  onOptionFormChange,
  onOptionFormSubmit,
  onOptionFormCancel,
  onAddOptionStart,
}: Props) {
  const optionCount = group.options?.length ?? 0;
  const GroupIcon = getGroupIcon(group.key, group.label);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
      {/* Card header */}
      {isEditingGroup ? (
        <div className="px-5 pt-5 pb-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Label</label>
              <input
                type="text"
                required
                value={groupFormData.label}
                onChange={(e) => onGroupFormChange({ ...groupFormData, label: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={groupFormData.description}
                onChange={(e) => onGroupFormChange({ ...groupFormData, description: e.target.value })}
                rows={2}
                placeholder="Group description…"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-white focus:ring-2 focus:ring-gray-900 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onGroupEditCancel}
                className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onGroupSubmit(group.id)}
                className="px-4 py-1.5 text-[11px] font-semibold bg-gray-950 text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <GroupIcon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-gray-900 capitalize leading-snug">{group.label}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {optionCount} {optionCount === 1 ? 'option' : 'options'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onOptionsEditStart(group)}
                className="p-1.5 text-gray-300 hover:text-gray-700 rounded-lg transition-colors"
                title="Edit options"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {/* <button
                onClick={() => onGroupEditStart(group)}
                className="p-1.5 text-gray-300 hover:text-gray-700 rounded-lg transition-colors"
                title="Edit group"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button> */}
              {/* <button
                onClick={() => onDeleteGroup(group.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                title="Delete group"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-5" />

      {/* Options */}
      <div className="flex-1 px-5 py-4 space-y-1.5">
        {(!group.options || group.options.length === 0) && addingToGroupKey !== group.key && (
          <div className="py-7 text-center text-xs text-gray-400">No options yet.</div>
        )}

        {isEditingOptions ? (
          <>
            {(group.options || []).map((option: any) => (
              <OptionEditRow
                key={option.id}
                option={option}
                edits={optionEdits[option.id] ?? {
                  label: option.label ?? '',
                  description: option.description ?? '',
                }}
                onChange={onOptionEditChange}
              />
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onOptionsEditCancel}
                className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onOptionsSave(group)}
                disabled={saving}
                className="px-4 py-1.5 text-[11px] font-semibold bg-gray-950 text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </>
        ) : (
          <>
            {group.options?.map((option: any) => {
              if (editingOptionId === option.id) {
                return (
                  <InlineOptionForm
                    key={`edit-${option.id}`}
                    groupId={group.id}
                    isNew={false}
                    optionId={option.id}
                    formData={optionFormData}
                    saving={saving}
                    onChange={onOptionFormChange}
                    onSubmit={onOptionFormSubmit}
                    onCancel={onOptionFormCancel}
                  />
                );
              }
              return <OptionRow key={option.id} option={option} />;
            })}

            {addingToGroupKey === group.key && (
              <InlineOptionForm
                key={`new-${group.id}`}
                groupId={group.id}
                isNew={true}
                formData={optionFormData}
                saving={saving}
                onChange={onOptionFormChange}
                onSubmit={onOptionFormSubmit}
                onCancel={onOptionFormCancel}
              />
            )}
          </>
        )}
      </div>

      {/* Card footer */}
      <div className="px-5 pb-5 pt-2">
        <button
          onClick={() =>
            addingToGroupKey === group.key ? onOptionFormCancel() : onAddOptionStart(group)
          }
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200 hover:border-gray-300"
        >
          <Plus className="w-3.5 h-3.5" />
          {addingToGroupKey === group.key ? 'Cancel' : 'Add option'}
        </button>
      </div>
    </div>
  );
}
