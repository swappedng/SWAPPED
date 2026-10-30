'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Info,
  Layers,
  Percent,
} from 'lucide-react';
import { getConditionAttributeGroups, deleteConditionAttributeGroup, deleteConditionAttributeOption, type ConditionAttributeGroup } from '@/lib/api/endpoints/admin/condition-attributes';

export default function ConditionAttributesPage() {
  const [groups, setGroups] = useState<ConditionAttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    description: '',
    priceModifier: 0,
    modifierType: 'AMOUNT',
    isActive: true,
  });

  const [savingOption, setSavingOption] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getConditionAttributeGroups();
      setGroups(data);
      // Auto expand first group if available
      if (data.length > 0 && !expandedGroup) {
        setExpandedGroup(data[0].key);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
    setLoading(false);
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute group? This will affect valuation calculations.')) return;
    try {
      await deleteConditionAttributeGroup(id);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const deleteOption = async (id: string) => {
    if (!confirm('Are you sure you want to delete this condition option?')) return;
    try {
      await deleteConditionAttributeOption(id);
      fetchGroups();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const startEditingOption = (option: any) => {
    setEditingOption(option.id);
    setAddingToGroup(null);
    setFormData({
      label: option.label,
      description: option.description || '',
      priceModifier: option.priceModifier || 0,
      modifierType: option.modifierType || 'AMOUNT',
      isActive: option.isActive ?? true,
    });
  };

  const startAddingOption = (group: any) => {
    setAddingToGroup(group.key);
    setEditingOption(null);
    setFormData({
      label: '',
      description: '',
      priceModifier: 0,
      modifierType: 'AMOUNT',
      isActive: true,
    });
  };

  const cancelInlineEdit = () => {
    setEditingOption(null);
    setAddingToGroup(null);
  };

  const handleInlineSubmit = async (groupId: string, isNew: boolean, existingOptionId?: string) => {
    setSavingOption(true);
    try {
      const url = isNew
        ? '/api/admin/condition-attributes/options'
        : `/api/admin/condition-attributes/options/${existingOptionId}`;
      
      const payload = {
        ...formData,
        groupId,
      };

      const method = isNew ? 'POST' : 'PATCH';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        cancelInlineEdit();
        fetchGroups();
      } else {
        const errorText = await response.text();
        console.error('Failed to save option:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error saving option:', error);
    } finally {
      setSavingOption(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
       
          <h1 className="text-2xl font-bold text-gray-950 mt-1 tracking-tight">Condition questions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage the questions customers answer and how each answer changes their quote.
          </p>
        </div>
        <Link
          href="/admin/condition-attributes/new"
          className="inline-flex items-center justify-center gap-2 bg-gray-950 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add question group</span>
        </Link>
      </header>

      {/* Attribute Groups List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-500">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-2"></div>
            <p>Loading attribute groups...</p>
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = expandedGroup === group.key;
            return (
              <div
                key={group.key}
                className={`bg-white border transition-all rounded-xl overflow-hidden shadow-sm ${
                  isExpanded ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Group Header Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-gray-900 leading-snug">{group.label}</h2>
                       
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {group.options.length} {group.options.length === 1 ? 'option' : 'options'} configured
                      </p>
                    </div>
                  </div>

                  {/* Actions & Expand Chevron */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <Link
                      href={`/admin/condition-attributes/${group.key}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Group</span>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGroup(group.key);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Toggle options"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-700" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Options Drawer */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
                        <Percent className="w-3.5 h-3.5 text-gray-500" />
                        <span>Configured Options & Deductions</span>
                      </div>
                      <button
                        onClick={() => startAddingOption(group)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-violet-100/80 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="grid gap-2.5">
                      {group.options.length === 0 && !addingToGroup && (
                        <div className="p-4 text-center text-xs text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
                          No options added to this group yet. Click "+ Add Option" above.
                        </div>
                      )}
                      
                      {group.options.map((option: any) => {
                        if (editingOption === option.id) {
                          return (
                            <div key={option.id} className="bg-white p-3.5 rounded-lg border border-violet-300 shadow-sm transition-colors gap-3 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Display Label</label>
                                  <input
                                    type="text"
                                    required
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Deduction Type & Amount</label>
                                  <div className="flex gap-2">
                                    <select
                                      value={formData.modifierType}
                                      onChange={(e) => setFormData({ ...formData, modifierType: e.target.value })}
                                      className="w-1/3 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                    >
                                      <option value="AMOUNT">Flat Amount</option>
                                      <option value="PERCENTAGE">Percentage %</option>
                                    </select>
                                    <input
                                      type="number"
                                      step="any"
                                      required
                                      value={formData.priceModifier}
                                      onChange={(e) => setFormData({ ...formData, priceModifier: parseFloat(e.target.value) || 0 })}
                                      className="w-2/3 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                      placeholder={formData.modifierType === 'PERCENTAGE' ? 'e.g. 15 for 15%' : 'e.g. 15000'}
                                    />
                                  </div>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                                  <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={cancelInlineEdit}
                                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleInlineSubmit(group.id, false, option.id)}
                                  disabled={savingOption}
                                  className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                                >
                                  {savingOption ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          );
                        }

                        const deductionValue = Number(option.priceModifier);
                        const isZero = deductionValue === 0;

                        return (
                          <div
                            key={option.id}
                            className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-500 font-mono mt-0.5">
                                description: {option.description}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              {/* Modifier Badge */}
                              <div
                                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                                  isZero
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {isZero ? (
                                  <span>No deduction (Full Value)</span>
                                ) : (
                                  <span>-{Math.abs(deductionValue).toLocaleString()}{option.modifierType === 'PERCENTAGE' ? '%' : ''} deduction</span>
                                )}
                              </div>

                              {/* Option Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditingOption(option)}
                                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit Option"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteOption(option.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {addingToGroup === group.key && (
                        <div className="bg-white p-3.5 rounded-lg border border-violet-300 shadow-sm transition-colors gap-3 space-y-3 mt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                              <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Deduction Type & Amount</label>
                              <div className="flex gap-2">
                                <select
                                  value={formData.modifierType}
                                  onChange={(e) => setFormData({ ...formData, modifierType: e.target.value })}
                                  className="w-1/3 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                >
                                  <option value="AMOUNT">Flat Amount</option>
                                  <option value="PERCENTAGE">Percentage %</option>
                                </select>
                                <input
                                  type="number"
                                  step="any"
                                  required
                                  value={formData.priceModifier}
                                  onChange={(e) => setFormData({ ...formData, priceModifier: parseFloat(e.target.value) || 0 })}
                                  className="w-2/3 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                                  placeholder={formData.modifierType === 'PERCENTAGE' ? 'e.g. 15 for 15%' : 'e.g. 15000'}
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                              <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={cancelInlineEdit}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleInlineSubmit(group.id, true)}
                              disabled={savingOption}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                            >
                              {savingOption ? 'Saving...' : 'Create Option'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!loading && groups.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-600 space-y-3">
          <Sliders className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="font-semibold text-gray-900">No condition attribute groups found</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Attribute groups define questions during customer device trade-in assessments.
          </p>
          <Link
            href="/admin/condition-attributes/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Group</span>
          </Link>
        </div>
      )}

    </div>
  );
}
