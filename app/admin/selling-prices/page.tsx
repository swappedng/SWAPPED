'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Info, MoreHorizontal, Package, Pencil, Save, Search } from 'lucide-react';
import { getSalesCatalog, createSalesCatalogItem, updateSalesCatalogItem, updateSaleCategory, type PhoneSaleCategory } from '@/lib/api/endpoints/admin/sales-catalog';
import { getPhoneModels, type PhoneModel } from '@/lib/api/endpoints/admin/phone-models';

type Price = { id: string; phoneModelId: string; model: string; storage: string; price: number; isActive: boolean };
type Category = { id: string; key: string; label: string; description?: string; imagePath?: string; prices: Price[] };
type Row = { phoneModelId: string; model: string; storage: string; prices: Record<string, Price | undefined> };
const PAGE_SIZE = 15;

const iphoneRank = (model: string) => {
  const normalized = model.toLowerCase();
  const generation = Number(normalized.match(/iphone\s+(\d+)/)?.[1] || 0);
  const legacy = normalized.includes('xs max') ? 43 : normalized.includes('xs') ? 42 : normalized.includes('xr') ? 41 : normalized.match(/iphone\s+x\b/) ? 40 : 0;
  const tier = normalized.includes('pro max') ? 3 : normalized.includes(' pro') ? 2 : normalized.includes('plus') ? 1 : normalized.includes('mini') ? -1 : 0;
  return generation ? generation * 10 + tier : legacy;
};
const storageRank = (storage: string) => Number(storage.match(/\d+/)?.[0] || 0);

function ActivenessDropdown({ rowKey, categories, activeDrafts, setActiveDrafts }: {
  rowKey: (categoryId: string) => string;
  categories: Category[];
  activeDrafts: Record<string, boolean>;
  setActiveDrafts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const anyInactive = categories.some(cat => activeDrafts[rowKey(cat.id)] === false);

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`rounded-md p-1.5 transition-colors hover:bg-gray-100 ${anyInactive ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500'}`}
        title="Availability options"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5">
          <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Availability</p>
          {categories.map(cat => {
            const key = rowKey(cat.id);
            const isActive = activeDrafts[key] ?? true;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveDrafts(prev => ({ ...prev, [key]: !isActive }))}
                className="flex w-full items-center justify-between gap-4 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className={isActive ? 'text-gray-700' : 'text-gray-400'}>{cat.label}</span>
                <span className={`inline-flex h-4 w-7 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${isActive ? 'bg-green-400' : 'bg-gray-200'}`}>
                  <span className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-3' : 'translate-x-0'}`} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategoryPriceCell({
  categoryLabel,
  priceValue,
  isActive,
  rowIndex,
  onChange,
}: {
  categoryLabel: string;
  priceValue: string;
  isActive: boolean;
  rowIndex: number;
  onChange: (val: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const openDownwards = rowIndex < 2;

  return (
    <td className="px-5 py-3 text-right">
      <div
        className="relative inline-flex items-center justify-end gap-1.5"
        onMouseEnter={() => { if (!isActive) setShowTooltip(true); }}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {!isActive && (
          <span className="inline-flex text-amber-500 hover:text-amber-600 transition-colors cursor-pointer">
            <Info size={14} />
          </span>
        )}

        {!isActive && showTooltip && (
          <div
            role="tooltip"
            className={`pointer-events-none absolute z-50 w-60 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs font-normal shadow-xl ${
              openDownwards ? 'top-full right-0 mt-2' : 'bottom-full right-0 mb-2'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-amber-500">
              <Info size={13} className="shrink-0" />
              <span>{categoryLabel} is disabled</span>
            </div>
            <p className="mt-1 text-[12px] text-gray-700">
              It won&apos;t be available for customers to pick on the storefront.
            </p>
            <div
              className={`absolute right-4 h-2 w-2 rotate-45 border-gray-200 bg-white ${
                openDownwards ? '-top-1 border-l border-t' : '-bottom-1 border-r border-b'
              }`}
            />
          </div>
        )}

        <label
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 transition-all ${
            isActive
              ? 'border-gray-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 cursor-text'
              : 'border-gray-200 bg-gray-100 text-gray-400 opacity-60 hover:opacity-90 focus-within:opacity-100 focus-within:bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 cursor-text'
          }`}
        >
          <span className="mr-1 text-sm text-gray-400">₦</span>
          <input
            type="number"
            value={priceValue}
            onChange={e => onChange(e.target.value)}
            placeholder="—"
            className={`w-24 bg-transparent text-right text-sm font-semibold outline-none placeholder:text-gray-300 ${
              isActive ? 'text-gray-900' : 'text-gray-500'
            }`}
          />
        </label>
      </div>
    </td>
  );
}

export default function SellingPricesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [activeDrafts, setActiveDrafts] = useState<Record<string, boolean>>({});
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    const [data, models] = await Promise.all([getSalesCatalog(true), getPhoneModels(true)]);
    setCategories(data);
    setPhoneModels(models);
    setDrafts(Object.fromEntries(data.flatMap(category => category.prices.map(price => [`${category.id}:${price.model}:${price.storage}`, String(price.price)]))));
    setActiveDrafts(Object.fromEntries(data.flatMap(category => category.prices.map(price => [`${category.id}:${price.model}:${price.storage}`, price.isActive]))));
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const result = new Map<string, Row>(phoneModels.map((phone) => [phone.id, { phoneModelId: phone.id, model: phone.model, storage: phone.storage, prices: {} }]));
    categories.forEach(category => category.prices.forEach(price => {
      const key = price.phoneModelId;
      const row = result.get(key) || { phoneModelId: price.phoneModelId, model: price.model, storage: price.storage, prices: {} };
      row.prices[category.id] = price;
      result.set(key, row);
    }));
    return [...result.values()].filter(row => `${row.model} ${row.storage}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => iphoneRank(b.model) - iphoneRank(a.model) || a.model.localeCompare(b.model) || storageRank(a.storage) - storageRank(b.storage));
  }, [categories, phoneModels, search]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const cellKey = (categoryId: string, row: Row) => `${categoryId}:${row.model}:${row.storage}`;

  const hasChanges = useMemo(() => rows.some(row => categories.some(category => {
    const rawPrice = row.prices[category.id];
    const existing = rawPrice?.id.startsWith('new-') ? undefined : rawPrice;
    const key = cellKey(category.id, row);
    const priceChanged = drafts[key] !== undefined && drafts[key] !== '' && Number(drafts[key]) !== (existing?.price ?? NaN);
    const activeChanged = activeDrafts[key] !== undefined && activeDrafts[key] !== (existing?.isActive ?? true);
    return priceChanged || activeChanged;
  })), [rows, categories, drafts, activeDrafts]);

  const saveChanges = async () => {
    setSaving(true);
    const requests: Promise<any>[] = [];
    rows.forEach(row => categories.forEach(category => {
      const key = cellKey(category.id, row);
      const priceValue = drafts[key];
      const activeValue = activeDrafts[key];
      const rawPrice = row.prices[category.id];
      const existing = rawPrice?.id.startsWith('new-') ? undefined : rawPrice;
      const priceChanged = priceValue !== undefined && priceValue !== '' && Number(priceValue) !== (existing?.price ?? NaN);
      const activeChanged = activeValue !== undefined && activeValue !== (existing?.isActive ?? true);
      if (!priceChanged && !activeChanged) return;
      if (existing) {
        const update: { price?: number; isActive?: boolean } = {};
        if (priceChanged) update.price = Number(priceValue);
        if (activeChanged) update.isActive = activeValue;
        requests.push(updateSalesCatalogItem(existing.id, update));
      } else if (priceChanged) {
        requests.push(createSalesCatalogItem({ categoryId: category.id, phoneModelId: row.phoneModelId, price: Number(priceValue), isActive: activeValue ?? true }));
      }
    }));
    await Promise.all(requests);
    await load();
    setSaving(false);
  };

  const saveDefinitions = async () => {
    setSaving(true);
    await Promise.all(categories.map(category => updateSaleCategory(category.id, { label: category.label, description: category.description, imagePath: category.imagePath })));
    await load(); setShowDefinitions(false); setSaving(false);
  };

  return <div className="max-w-7xl mx-auto space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold tracking-wide text-violet-600">Catalogue & pricing</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Selling prices</h1><p className="mt-2 text-gray-600">Set category-specific prices for the phone variants in your catalogue.</p></div><button onClick={() => setShowDefinitions(!showDefinitions)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Pencil size={16} /> Edit categories <ChevronDown size={15} className={showDefinitions ? 'rotate-180 transition-transform' : 'transition-transform'} /></button></header>
    {showDefinitions && <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-gray-950">Category labels and descriptions</h2><p className="text-sm text-gray-600">This text appears in the customer trade-in journey.</p></div><button onClick={saveDefinitions} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> Save</button></div><div className="grid gap-4 lg:grid-cols-3">{categories.map((category, index) => <div className="rounded-lg border border-violet-100 bg-white p-4" key={category.id}><input className="w-full border-0 p-0 text-base font-semibold text-gray-950 focus:ring-0" value={category.label} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} /><textarea className="mt-3 min-h-20 w-full resize-none rounded-md border border-gray-200 p-2 text-sm text-gray-600" value={category.description || ''} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} /><input className="mt-3 w-full rounded-md border border-gray-200 p-2 text-sm text-gray-600" placeholder="Image path (e.g., /condition/Sealed.png)" value={category.imagePath || ''} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, imagePath: e.target.value } : item))} /></div>)}</div></section>}
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Package size={19} /></div><div><h2 className="font-semibold text-gray-950">Price comparison</h2><p className="text-sm text-gray-500">One row per device and storage option</p></div></div><div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search devices" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[940px]"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-6 py-3 text-left font-semibold">Device</th><th className="px-6 py-3 text-left font-semibold">Storage</th>{categories.map(category => <th key={category.id} className="px-5 py-3 text-right font-semibold">{category.label}</th>)}<th className="w-10 px-3 py-3" /></tr></thead><tbody className="divide-y divide-gray-100">{paginatedRows.map((row, rowIndex) => <tr key={`${row.model}-${row.storage}`} className="hover:bg-gray-50/70"><td className="px-6 py-4 text-sm font-medium text-gray-900">{row.model}</td><td className="px-6 py-4 text-sm text-gray-600">{row.storage}</td>{categories.map(category => {
        const key = cellKey(category.id, row);
        const rawPrice = row.prices[category.id];
        const existing = rawPrice?.id.startsWith('new-') ? undefined : rawPrice;
        const priceValue = drafts[key] ?? (existing ? String(existing.price) : '');
        const isActive = activeDrafts[key] ?? existing?.isActive ?? true;

        return <CategoryPriceCell
          key={category.id}
          categoryLabel={category.label}
          priceValue={priceValue}
          isActive={isActive}
          rowIndex={rowIndex}
          onChange={(val) => setDrafts(prev => ({ ...prev, [key]: val }))}
        />;
      })}<td className="px-3 py-3">
        <ActivenessDropdown
          rowKey={(categoryId) => cellKey(categoryId, row)}
          categories={categories}
          activeDrafts={activeDrafts}
          setActiveDrafts={setActiveDrafts}
        />
      </td></tr>)}{rows.length === 0 && <tr><td colSpan={categories.length + 3} className="px-6 py-14 text-center text-sm text-gray-500">No devices match this search.</td></tr>}</tbody></table></div>
      <footer className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><p className="text-sm text-gray-500">{hasChanges ? 'You have unsaved changes.' : 'All prices are saved.'}</p>{rows.length > 0 && <div className="flex items-center gap-2 text-sm text-gray-500"><span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}</span><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40">Previous</button><span>Page {currentPage} of {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40">Next</button></div>}</div><button onClick={saveChanges} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 self-end rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"><Save size={15} /> {saving ? 'Saving…' : 'Save changes'}</button></footer>
    </section>
  </div>;
}
