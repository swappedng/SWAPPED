'use client';

import { useState, useEffect } from 'react';
import { Sliders, Plus } from 'lucide-react';
import {
  getConditionAttributeGroups,
  deleteConditionAttributeGroup,
  deleteConditionAttributeOption,
  type ConditionAttributeGroup,
} from '@/lib/api/endpoints/admin/condition-attributes';
import { type OptionEdit, type OptionFormData, type GroupFormData } from './components/types';
import { NewGroupForm } from './components/NewGroupForm';
import { GroupCard } from './components/GroupCard';

const EMPTY_FORM: OptionFormData = {
  label: '',
  description: '',
  isActive: true,
};

const EMPTY_GROUP_FORM: GroupFormData = { label: '', description: '' };

export default function ConditionAttributesPage() {
  const [groups, setGroups] = useState<ConditionAttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Single-option inline edit/add
  const [editingOption, setEditingOption] = useState<{ groupId: string; optionId: string } | null>(null);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [optionFormData, setOptionFormData] = useState<OptionFormData>(EMPTY_FORM);

  // Group name/desc edit
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState<GroupFormData>(EMPTY_GROUP_FORM);

  // Bulk option edit
  const [editingGroupOptions, setEditingGroupOptions] = useState<string | null>(null);
  const [optionEdits, setOptionEdits] = useState<Record<string, OptionEdit>>({});

  // New group
  const [addingNewGroup, setAddingNewGroup] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getConditionAttributeGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
    setLoading(false);
  };

  // ─── Group CRUD ────────────────────────────────────────────────────────────

  const deleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute group? This will affect valuation calculations.')) return;
    try {
      await deleteConditionAttributeGroup(id);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleGroupSubmit = async (groupId: string) => {
    try {
      const res = await fetch(`/api/admin/condition-attributes/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });
      if (res.ok) { setEditingGroup(null); fetchGroups(); }
      else alert('Failed to save group. Please try again.');
    } catch {
      alert('Failed to save group. Please try again.');
    }
  };

  const handleNewGroupSubmit = async () => {
    try {
      const res = await fetch('/api/admin/condition-attributes/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...groupFormData,
          key: groupFormData.label.toLowerCase().replace(/\s+/g, '-'),
        }),
      });
      if (res.ok) { setAddingNewGroup(false); setGroupFormData(EMPTY_GROUP_FORM); fetchGroups(); }
      else alert('Failed to create group. Please try again.');
    } catch {
      alert('Failed to create group. Please try again.');
    }
  };

  // ─── Single option ─────────────────────────────────────────────────────────

  const deleteOption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this condition option?')) return;
    try {
      await deleteConditionAttributeOption(id);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleOptionFormSubmit = async (groupId: string, isNew: boolean, optionId?: string) => {
    setSaving(true);
    try {
      const url = isNew
        ? '/api/admin/condition-attributes/options'
        : `/api/admin/condition-attributes/options/${optionId}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...optionFormData, groupId }),
      });
      if (res.ok) { cancelAll(); fetchGroups(); }
      else alert('Failed to save option. Please try again.');
    } catch {
      alert('Failed to save option. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Bulk option edit ──────────────────────────────────────────────────────

  const startEditingGroupOptions = (group: ConditionAttributeGroup) => {
    const edits: Record<string, OptionEdit> = {};
    (group.options || []).forEach((opt: any) => {
      edits[opt.id] = {
        label: opt.label ?? '',
        description: opt.description ?? '',
      };
    });
    setEditingGroupOptions(group.id);
    setOptionEdits(edits);
    setEditingOption(null);
    setAddingToGroup(null);
    setEditingGroup(null);
    setAddingNewGroup(false);
  };

  const saveGroupOptions = async (group: ConditionAttributeGroup) => {
    setSaving(true);
    try {
      await Promise.all(
        (group.options || []).map((opt: any) => {
          const edits = optionEdits[opt.id];
          if (!edits) return Promise.resolve();
          return fetch(`/api/admin/condition-attributes/options/${opt.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...edits, groupId: group.id }),
          });
        })
      );
      cancelAll();
      fetchGroups();
    } catch {
      alert('Failed to save options. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const cancelAll = () => {
    setEditingOption(null);
    setAddingToGroup(null);
    setEditingGroup(null);
    setAddingNewGroup(false);
    setEditingGroupOptions(null);
    setOptionEdits({});
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Catalogue &amp; pricing</p>
          <h1 className="text-2xl font-bold text-gray-950 mt-1.5 tracking-tight">Inspection Checklist</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-lg">
            Each group is a question customers answer during trade-in. Price adjustments are configured per phone model in the phone models section.
          </p>
        </div>
        {/* <button
          onClick={() => { setAddingNewGroup(true); setGroupFormData(EMPTY_GROUP_FORM); }}
          className="inline-flex items-center gap-2 bg-gray-950 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors self-start whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add group
        </button> */}
      </header>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-gray-100 rounded w-2/5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-9 bg-gray-100 rounded-lg" />
                <div className="h-9 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {addingNewGroup && (
            <NewGroupForm
              formData={groupFormData}
              onChange={setGroupFormData}
              onSubmit={handleNewGroupSubmit}
              onCancel={() => { setAddingNewGroup(false); setGroupFormData(EMPTY_GROUP_FORM); }}
            />
          )}

          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              // group edit
              isEditingGroup={editingGroup === group.id}
              groupFormData={groupFormData}
              onGroupFormChange={setGroupFormData}
              onGroupSubmit={handleGroupSubmit}
              onGroupEditCancel={() => setEditingGroup(null)}
              onGroupEditStart={(g) => {
                setEditingGroup(g.id);
                setGroupFormData({ label: g.label ?? '', description: g.description ?? '' });
                setEditingOption(null); setAddingToGroup(null); setAddingNewGroup(false);
              }}
              onDeleteGroup={deleteGroup}
              // bulk option edit
              isEditingOptions={editingGroupOptions === group.id}
              optionEdits={optionEdits}
              onOptionEditChange={(id, edits) => setOptionEdits((prev) => ({ ...prev, [id]: edits }))}
              onOptionsSave={saveGroupOptions}
              onOptionsEditStart={startEditingGroupOptions}
              onOptionsEditCancel={cancelAll}
              saving={saving}
              // single option form
              editingOptionId={editingOption?.groupId === group.id ? editingOption.optionId : null}
              addingToGroupKey={addingToGroup}
              optionFormData={optionFormData}
              onOptionFormChange={setOptionFormData}
              onOptionFormSubmit={handleOptionFormSubmit}
              onOptionFormCancel={cancelAll}
              onAddOptionStart={(g) => {
                setAddingToGroup(g.key);
                setOptionFormData(EMPTY_FORM);
                setEditingOption(null); setEditingGroup(null); setAddingNewGroup(false);
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && groups.length === 0 && !addingNewGroup && (
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center space-y-4">
          <Sliders className="w-8 h-8 text-gray-300 mx-auto" />
          <div>
            <p className="font-semibold text-gray-900">No checklist groups yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Groups define the questions asked during a customer's trade-in assessment.
            </p>
          </div>
          <button
            onClick={() => { setAddingNewGroup(true); setGroupFormData(EMPTY_GROUP_FORM); }}
            className="inline-flex items-center gap-2 bg-gray-950 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create first group
          </button>
        </div>
      )}
    </div>
  );
}
