'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Package, Plus, Save, Search, Smartphone, Trash2, X, Check, Sliders } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import {
  getPhoneModels,
  createPhoneModel,
  updatePhoneModel,
  deletePhoneModel,
  type PhoneModel,
} from '@/lib/api/endpoints/admin/phone-models';

const PAGE_SIZE = 10;

const iphoneRank = (model: string) => {
  const normalized = model.toLowerCase();
  const generation = Number(normalized.match(/iphone\s+(\d+)/)?.[1] || 0);
  const legacy = normalized.includes('xs max')
    ? 43
    : normalized.includes('xs')
    ? 42
    : normalized.includes('xr')
    ? 41
    : normalized.match(/iphone\s+x\b/)
    ? 40
    : 0;
  const tier = normalized.includes('pro max')
    ? 3
    : normalized.includes(' pro')
    ? 2
    : normalized.includes('plus')
    ? 1
    : normalized.includes('mini')
    ? -1
    : 0;
  return generation ? generation * 10 + tier : legacy;
};

const storageRank = (storage: string) => Number(storage.match(/\d+/)?.[0] || 0);

export default function PhoneModelsPage() {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [newModel, setNewModel] = useState({ model: '', storage: '', buyingPrice: '' });
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getPhoneModels(true);
      setModels(data);
      setDrafts(Object.fromEntries(data.map((m) => [m.id, String(m.buyingPrice ?? '')])));
      setStatusDrafts(Object.fromEntries(data.map((m) => [m.id, m.isActive])));
    } catch (error) {
      console.error('Failed to load phone models:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedRows = useMemo(() => {
    return [...models]
      .filter((phone) => `${phone.model} ${phone.storage}`.toLowerCase().includes(search.toLowerCase()))
      .sort(
        (a, b) =>
          iphoneRank(b.model) - iphoneRank(a.model) ||
          a.model.localeCompare(b.model) ||
          storageRank(a.storage) - storageRank(b.storage)
      );
  }, [models, search]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedRows = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasChanges = useMemo(() => {
    return models.some((phone) => {
      const draftPrice = drafts[phone.id];
      const draftActive = statusDrafts[phone.id];
      const priceChanged =
        draftPrice !== undefined && draftPrice !== '' && Number(draftPrice) !== phone.buyingPrice;
      const statusChanged = draftActive !== undefined && draftActive !== phone.isActive;
      return priceChanged || statusChanged;
    });
  }, [models, drafts, statusDrafts]);

  const saveChanges = async () => {
    setSaving(true);
    const requests: Promise<any>[] = [];

    models.forEach((phone) => {
      const draftPrice = drafts[phone.id];
      const draftActive = statusDrafts[phone.id] ?? phone.isActive;
      const priceNum = draftPrice !== undefined && draftPrice !== '' ? Number(draftPrice) : phone.buyingPrice;
      const priceChanged = draftPrice !== undefined && draftPrice !== '' && Number(draftPrice) !== phone.buyingPrice;
      const statusChanged = draftActive !== phone.isActive;

      if (priceChanged || statusChanged) {
        requests.push(
          updatePhoneModel(phone.id, {
            ...(priceChanged ? { buyingPrice: priceNum } : {}),
            ...(statusChanged ? { isActive: draftActive } : {}),
          })
        );
      }
    });

    try {
      await Promise.all(requests);
      await load();
    } catch (err) {
      console.error('Failed to save trade-in values:', err);
      alert('Failed to save some changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.model.trim() || !newModel.storage.trim() || newModel.buyingPrice === '') return;
    setCreating(true);
    try {
      const label = `${newModel.model.trim()} ${newModel.storage.trim()}`;
      await createPhoneModel({
        label,
        model: newModel.model.trim(),
        storage: newModel.storage.trim(),
        buyingPrice: Number(newModel.buyingPrice),
        isActive: true,
      });
      setNewModel({ model: '', storage: '', buyingPrice: '' });
      setIsAdding(false);
      await load();
    } catch (err) {
      console.error('Failed to create model:', err);
      alert('Failed to create phone model.');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePhoneModel(deleteTarget.id);
      await load();
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Failed to delete model:', err);
      setDeleteError(err?.message || 'Failed to delete phone model. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Buying prices</h1>
          <p className="mt-2 text-gray-600">
            Set the base buying price for each phone model in your catalogue. Inspection checklist deductions calculate off this amount.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          <Plus size={16} /> Add phone model
        </button>
      </header>

      {/* Add New Model Form Drawer */}
      {isAdding && (
        <form onSubmit={handleCreateModel} className="rounded-xl border border-violet-100 bg-violet-50/50 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-950">Add new a phone model</h2>
              <p className="text-sm text-gray-600">Add a model and storage combination with its base buying price.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Model Name
              </label>
              <input
                required
                placeholder="e.g. iPhone 16 Pro"
                value={newModel.model}
                onChange={(e) => setNewModel({ ...newModel, model: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Storage
              </label>
              <input
                required
                placeholder="e.g. 256GB"
                value={newModel.storage}
                onChange={(e) => setNewModel({ ...newModel, storage: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Buying Price (₦)
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                <span className="mr-1 text-sm text-gray-400">₦</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="0"
                  value={newModel.buyingPrice}
                  onChange={(e) => setNewModel({ ...newModel, buyingPrice: e.target.value })}
                  className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              <Check size={16} /> {creating ? 'Adding…' : 'Add Model'}
            </button>
          </div>
        </form>
      )}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-950">Phone catalogue</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search devices"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Phone Model</th>
                <th className="px-6 py-3 text-left font-semibold">Storage</th>
                <th className="px-6 py-3 text-right font-semibold">Base Buying Price</th>
                <th className="px-6 py-3 text-center font-semibold">Availability</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.map((phone) => {
                const priceValue = drafts[phone.id] ?? (phone.buyingPrice !== undefined ? String(phone.buyingPrice) : '');
                const isActive = statusDrafts[phone.id] ?? phone.isActive;

                return (
                  <tr key={phone.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <Link
                        href={`/admin/phone-models/${phone.id}/checklist`}
                        className="group inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-violet-600 transition-colors"
                        title={`Configure inspection checklist for ${phone.model}`}
                      >
                        <span>{phone.model}</span>
                        <Sliders className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{phone.storage}</td>
                    <td className="px-6 py-3 text-right">
                      <label className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                        <span className="mr-1 text-sm text-gray-400">₦</span>
                        <input
                          type="number"
                          value={priceValue}
                          onChange={(e) => setDrafts({ ...drafts, [phone.id]: e.target.value })}
                          placeholder="—"
                          className="w-28 bg-transparent text-right text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-300"
                        />
                      </label>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setStatusDrafts({ ...statusDrafts, [phone.id]: !isActive })}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/phone-models/${phone.id}/checklist`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition"
                          title={`Configure inspection checklist for ${phone.model}`}
                        >
                          <Sliders className="w-3 h-3" />
                          Checklist
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget({ id: phone.id, name: `${phone.model} ${phone.storage}` });
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                          title="Delete device"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-sm text-gray-500">
                    No devices match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination and Save Changes */}
        <footer className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              {hasChanges ? 'You have unsaved price or availability changes.' : 'All phone model values are saved.'}
            </p>
            {sortedRows.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sortedRows.length)} of{' '}
                  {sortedRows.length}
                </span>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <button
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className="inline-flex items-center gap-2 self-end rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto hover:bg-gray-800 transition shadow-sm"
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </footer>
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete phone model?"
        subtitle={
          deleteTarget ? (
            <p>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteTarget.name}</span>? Customers will no longer be able to select or trade in this phone configuration on the storefront.
            </p>
          ) : null
        }
        type="danger"
        confirmText="Delete"
        isLoading={deleting}
        error={deleteError}
      />
    </div>
  );
}
