'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Check,
  X,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const PAGE_SIZE = 10;
const emptyModel = { label: '', model: '', storage: '', basePrice: '', isActive: true };

export default function PhoneModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newModel, setNewModel] = useState<any>(emptyModel);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/phone-models?admin=1');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error(data?.error || 'Failed to fetch models');
      setModels(data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
    setLoading(false);
  };

  const startEdit = (model: any) => {
    setEditing(model.id);
    setDraft({ ...model });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`/api/admin/phone-models/${editing}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, basePrice: Number(draft.basePrice) }),
    });
    if (res.ok) {
      setEditing(null);
      fetchModels();
    }
  };

  const createModel = async () => {
    if (!newModel.label || !newModel.model || !newModel.storage || newModel.basePrice === '') return;
    const value = `${newModel.model}-${newModel.storage}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = await fetch('/api/admin/phone-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newModel, value, basePrice: Number(newModel.basePrice) }),
    });
    if (res.ok) {
      setNewModel(emptyModel);
      setIsAdding(false);
      setPage(1);
      fetchModels();
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('Delete this phone model? This will prevent trade-in quotes for this device.')) return;
    try {
      await fetch(`/api/admin/phone-models/${id}`, { method: 'DELETE' });
      fetchModels();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    return models.filter((model) => {
      const matchesSearch =
        !query || [model.label, model.model, model.storage].some((value) => value?.toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? model.isActive : !model.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [models, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredModels.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleModels = filteredModels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateFilters = (nextSearch: string, nextStatus = statusFilter) => {
    setSearch(nextSearch);
    setStatusFilter(nextStatus);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-600 text-xs font-semibold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Valuation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mt-1 tracking-tight">Trade-in values</h1>
          <p className="text-sm text-gray-600 mt-1">
            Set the highest amount offered for each phone. Customer condition answers reduce this value.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setNewModel(emptyModel);
          }}
          className="inline-flex items-center justify-center gap-2 bg-gray-950 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Phone Model</span>
        </button>
      </header>

      {/* Explanatory Info Card */}
      <section className="bg-gradient-to-r from-violet-50 to-indigo-50/60 border border-violet-100 rounded-xl p-4 sm:p-5 flex gap-3 text-xs leading-relaxed text-violet-950">
        <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-violet-900 block text-sm">What is a trade-in value?</span>
          <p className="text-violet-800">
            This is the <span className="font-semibold">maximum trade-in value</span> assigned to a phone in 100% mint condition with zero physical defects. When customers perform an assessment, selected condition attributes (e.g. cracked glass or depleted battery) deduct percentages from this baseline price.
          </p>
        </div>
      </section>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm space-y-0">
        {/* Search & Filter Control Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              value={search}
              onChange={(e) => updateFilters(e.target.value)}
              placeholder="Search by label (e.g. iPhone 15 Pro), model, or storage..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => updateFilters(search, e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-violet-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Display Label</th>
                <th className="px-6 py-3.5 text-left font-semibold">Model Name</th>
                <th className="px-6 py-3.5 text-left font-semibold">Storage</th>
                <th className="px-6 py-3.5 text-left font-semibold">Pristine Base Price</th>
                <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* New Row Input Mode */}
              {isAdding && (
                <tr className="bg-violet-50/60 border-b border-violet-100">
                  <td className="px-6 py-3">
                    <input
                      autoFocus
                      className="w-full bg-white border border-violet-300 rounded px-2.5 py-1 text-xs"
                      placeholder="iPhone 16 Pro Max 256GB"
                      value={newModel.label}
                      onChange={(e) => setNewModel({ ...newModel, label: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      className="w-full bg-white border border-violet-300 rounded px-2.5 py-1 text-xs"
                      placeholder="iPhone 16 Pro Max"
                      value={newModel.model}
                      onChange={(e) => setNewModel({ ...newModel, model: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      className="w-24 bg-white border border-violet-300 rounded px-2.5 py-1 text-xs"
                      placeholder="256GB"
                      value={newModel.storage}
                      onChange={(e) => setNewModel({ ...newModel, storage: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 bg-white border border-violet-300 rounded px-2 py-1">
                      <span className="text-gray-400 font-semibold">₦</span>
                      <input
                        type="number"
                        className="w-28 bg-transparent text-xs outline-none font-semibold"
                        placeholder="0"
                        value={newModel.basePrice}
                        onChange={(e) => setNewModel({ ...newModel, basePrice: e.target.value })}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button
                      onClick={createModel}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-violet-700 text-white rounded text-xs font-semibold hover:bg-violet-800"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-2.5 py-1 text-gray-600 hover:text-gray-900 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {visibleModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 text-gray-950 font-semibold">
                    {editing === model.id ? (
                      <input
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={draft.label}
                        onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      />
                    ) : (
                      model.label
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                    {editing === model.id ? (
                      <input
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={draft.model}
                        onChange={(e) => setDraft({ ...draft, model: e.target.value })}
                      />
                    ) : (
                      model.model
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {editing === model.id ? (
                      <input
                        className="w-24 border rounded px-2 py-1 text-xs"
                        value={draft.storage}
                        onChange={(e) => setDraft({ ...draft, storage: e.target.value })}
                      />
                    ) : (
                      model.storage
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-950">
                    {editing === model.id ? (
                      <input
                        type="number"
                        className="w-32 border rounded px-2 py-1 text-xs"
                        value={draft.basePrice}
                        onChange={(e) => setDraft({ ...draft, basePrice: e.target.value })}
                      />
                    ) : (
                      <>₦{model.basePrice?.toLocaleString()}</>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editing === model.id ? (
                      <label className="flex gap-1.5 items-center text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft.isActive}
                          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                        />
                        <span>Active</span>
                      </label>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          model.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {editing === model.id ? (
                      <>
                        <button onClick={saveEdit} className="text-violet-700 font-semibold hover:underline">
                          Save
                        </button>
                        <button onClick={() => setEditing(null)} className="text-gray-500 hover:underline">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(model)}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-950 font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteModel(model.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredModels.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Smartphone className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-900 text-sm">
              {models.length === 0 ? 'No phone models added yet' : 'No phone models match your search'}
            </p>
            <p className="text-xs text-gray-400">Add a model to allow customers to receive trade-in quotes.</p>
          </div>
        )}

        {/* Footer Pagination */}
        {filteredModels.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-3">
            <span>
              Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * PAGE_SIZE + 1}</span>–
              <span className="font-semibold text-gray-900">{Math.min(currentPage * PAGE_SIZE, filteredModels.length)}</span> of{' '}
              <span className="font-semibold text-gray-900">{filteredModels.length}</span> device models
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="px-2 font-medium text-gray-700">
                Page {currentPage} of {pageCount}
              </span>
              <button
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
