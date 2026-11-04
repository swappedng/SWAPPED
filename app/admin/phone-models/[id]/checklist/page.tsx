'use client';

import { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, RotateCcw, Check, Sparkles, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { getGroupIcon } from '@/app/admin/condition-attributes/components/utils';

interface OptionItem {
  id: string;
  groupId: string;
  label: string;
  description: string | null;
  priceModifier: number;
  modifierType: 'AMOUNT' | 'PERCENTAGE';
  isCustom: boolean;
  order: number;
}

interface GroupItem {
  id: string;
  key: string;
  label: string;
  description: string | null;
  order: number;
  options: OptionItem[];
}

interface VariantItem {
  id: string;
  label: string;
  storage: string;
  buyingPrice: number;
  isActive: boolean;
}

interface ChecklistData {
  model: string;
  variants: VariantItem[];
  groups: GroupItem[];
}

interface OptionEditState {
  priceModifier: number;
  modifierType: 'AMOUNT' | 'PERCENTAGE';
  isCustom: boolean;
}

export default function PhoneModelChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ChecklistData | null>(null);
  const [edits, setEdits] = useState<Record<string, OptionEditState>>({});
  const [resetOptionIds, setResetOptionIds] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/phone-models/${encodeURIComponent(id)}/checklist`);
      if (!res.ok) throw new Error('Failed to load checklist');
      const json: ChecklistData = await res.json();
      setData(json);

      const initialEdits: Record<string, OptionEditState> = {};
      json.groups.forEach((group) => {
        group.options.forEach((opt) => {
          initialEdits[opt.id] = {
            priceModifier: opt.priceModifier,
            modifierType: opt.modifierType,
            isCustom: opt.isCustom,
          };
        });
      });
      setEdits(initialEdits);
      setResetOptionIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const allOptions = useMemo(() => {
    return data ? data.groups.flatMap((g) => g.options) : [];
  }, [data]);

  const hasChanges = useMemo(() => {
    if (!data) return false;
    if (resetOptionIds.length > 0) return true;

    for (const opt of allOptions) {
      const edit = edits[opt.id];
      if (!edit) continue;
      if (edit.isCustom && (edit.priceModifier !== opt.priceModifier || edit.modifierType !== opt.modifierType)) {
        return true;
      }
      if (!edit.isCustom && opt.isCustom) {
        return true;
      }
    }
    return false;
  }, [data, allOptions, edits, resetOptionIds]);

  const customizedCount = useMemo(() => {
    return Object.values(edits).filter((e) => e.isCustom).length;
  }, [edits]);

  const handleEditChange = (
    optionId: string,
    field: 'priceModifier' | 'modifierType',
    value: any
  ) => {
    setEdits((prev) => {
      const current = prev[optionId];
      if (!current) return prev;
      return {
        ...prev,
        [optionId]: {
          ...current,
          [field]: value,
          isCustom: true,
        },
      };
    });

    // Remove from reset list if user is actively modifying it
    setResetOptionIds((prev) => prev.filter((oId) => oId !== optionId));
    setSaveSuccess(false);
  };

  const handleResetOption = (option: OptionItem) => {
    setEdits((prev) => ({
      ...prev,
      [option.id]: {
        priceModifier: 0,
        modifierType: 'AMOUNT',
        isCustom: false,
      },
    }));

    if (option.isCustom) {
      setResetOptionIds((prev) => (prev.includes(option.id) ? prev : [...prev, option.id]));
    }
    setSaveSuccess(false);
  };

  const handleResetAll = () => {
    if (!confirm(`Revert all checklist modifiers for ${data?.model} back to the global defaults?`)) {
      return;
    }

    const resetMap: Record<string, OptionEditState> = {};
    const toReset: string[] = [];

    allOptions.forEach((opt) => {
      resetMap[opt.id] = {
        priceModifier: 0,
        modifierType: 'AMOUNT',
        isCustom: false,
      };
      if (opt.isCustom) {
        toReset.push(opt.id);
      }
    });

    setEdits(resetMap);
    setResetOptionIds(toReset);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const modifiers = Object.entries(edits)
        .filter(([optId, edit]) => edit.isCustom)
        .map(([optionId, edit]) => ({
          optionId,
          priceModifier: edit.priceModifier,
          modifierType: edit.modifierType,
        }));

      const res = await fetch(`/api/admin/phone-models/${encodeURIComponent(id)}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modifiers,
          resetOptionIds,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setSaveSuccess(true);
      await loadData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save inspection checklist for this phone model.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-6 w-36 bg-gray-200 animate-pulse rounded" />
        <div className="h-28 bg-white border border-gray-200 rounded-2xl p-6 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Phone Model Not Found</h2>
        <p className="text-sm text-gray-500">We could not locate this device in the catalogue.</p>
        <Link
          href="/admin/phone-models"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Phone Models
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top navigation bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/phone-models"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Phone Models"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Link href="/admin/phone-models" className="hover:text-gray-600 transition-colors">
                Phone models
              </Link>
              <span>/</span>
              <span className="text-gray-700 font-bold">{data.model}</span>
              <span>/</span>
              <span>Checklist</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight mt-0.5">
              {data.model} — Inspection Checklist
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customizedCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 rounded-lg transition-colors"
              title="Remove all custom modifiers for this model"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear all custom
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : hasChanges
                ? 'bg-gray-950 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            {saving ? (
              'Saving…'
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Model summary banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                Price deductions for {data.model}
              </span>
              <span className="text-xs  font-medium ">
                {customizedCount} {customizedCount === 1 ? 'option' : 'options'} set
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
              Deductions set here apply to all storage variants of <strong>{data.model}</strong> during trade-in valuation.
              <br />
              Each option must be set with a price modifier.
            </p>
          </div>

          {/* Storage variants chips */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Applies to:</span>
            {data.variants.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200"
              >
                {v.storage}
                <span className="text-gray-400 font-normal ml-1">
                  (₦{v.buyingPrice.toLocaleString()})
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Groups grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.groups.map((group) => {
          const GroupIcon = getGroupIcon(group.key, group.label);

          return (
            <div
              key={group.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4"
            >
              {/* Group header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-200/60 text-gray-700 shrink-0">
                  <GroupIcon className="w-5 h-5 text-gray-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-950 truncate">{group.label}</h3>
                  {group.description && (
                    <p className="text-xs text-gray-500 truncate">{group.description}</p>
                  )}
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-3 flex-1">
                {group.options.map((option) => {
                  const edit = edits[option.id] || {
                    priceModifier: option.priceModifier,
                    modifierType: option.modifierType,
                    isCustom: option.isCustom,
                  };

                  return (
                    <div
                      key={option.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        edit.isCustom
                          ? 'border-violet-200 bg-violet-50/30'
                          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900">
                              {option.label}
                            </span>
                            {edit.isCustom ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 border border-violet-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                Custom for {data.model}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Not set
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                              {option.description}
                            </p>
                          )}
                        </div>

                        {edit.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleResetOption(option)}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-white rounded transition"
                            title="Revert to global default"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Modifier deduction input */}
                      <div className="flex items-center gap-2 pt-1">
                        <select
                          value={edit.modifierType}
                          onChange={(e) =>
                            handleEditChange(
                              option.id,
                              'modifierType',
                              e.target.value as 'AMOUNT' | 'PERCENTAGE'
                            )
                          }
                          className="h-8 px-4 border border-gray-200 rounded-lg text-xs font-semibold bg-white text-gray-800 focus:ring-2 focus:ring-gray-900 outline-none shrink-0"
                        >
                          <option value="AMOUNT">Flat ₦</option>
                          <option value="PERCENTAGE">%</option>
                        </select>

                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="any"
                            value={edit.priceModifier}
                            onChange={(e) =>
                              handleEditChange(
                                option.id,
                                'priceModifier',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="w-full h-8 px-2.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-gray-900 outline-none"
                          />
                        </div>

                        <span className="text-[11px] text-gray-400 shrink-0">
                          {!edit.isCustom
                            ? 'Not set'
                            : edit.priceModifier === 0
                            ? 'Full value'
                            : edit.modifierType === 'PERCENTAGE'
                            ? `-${edit.priceModifier}%`
                            : `-₦${edit.priceModifier.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
