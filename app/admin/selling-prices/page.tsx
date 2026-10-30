'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Package, Pencil, Plus, Save, Search, X } from 'lucide-react';

type Price = { id: string; model: string; storage: string; price: number };
type Category = { id: string; key: string; label: string; description?: string; imagePath?: string; prices: Price[] };
type Row = { model: string; storage: string; prices: Record<string, Price | undefined> };
const emptyDevice = { model: '', storage: '' };
const PAGE_SIZE = 15;

const iphoneRank = (model: string) => {
  const normalized = model.toLowerCase();
  const generation = Number(normalized.match(/iphone\s+(\d+)/)?.[1] || 0);
  const legacy = normalized.includes('xs max') ? 43 : normalized.includes('xs') ? 42 : normalized.includes('xr') ? 41 : normalized.match(/iphone\s+x\b/) ? 40 : 0;
  const tier = normalized.includes('pro max') ? 3 : normalized.includes(' pro') ? 2 : normalized.includes('plus') ? 1 : normalized.includes('mini') ? -1 : 0;
  return generation ? generation * 10 + tier : legacy;
};
const storageRank = (storage: string) => Number(storage.match(/\d+/)?.[0] || 0);

export default function SellingPricesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newDevice, setNewDevice] = useState(emptyDevice);
  const [showAdd, setShowAdd] = useState(false);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const load = async () => {
    const response = await fetch('/api/admin/sales-catalog?admin=1');
    const data: Category[] = await response.json();
    if (!response.ok || !Array.isArray(data)) throw new Error('Could not load phones for sale');
    setCategories(data);
    setDrafts(Object.fromEntries(data.flatMap(category => category.prices.map(price => [`${category.id}:${price.model}:${price.storage}`, String(price.price)]))));
  };
  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const result = new Map<string, Row>();
    categories.forEach(category => category.prices.forEach(price => {
      const key = `${price.model}:${price.storage}`;
      const row = result.get(key) || { model: price.model, storage: price.storage, prices: {} };
      row.prices[category.id] = price;
      result.set(key, row);
    }));
    return [...result.values()].filter(row => `${row.model} ${row.storage}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => iphoneRank(a.model) - iphoneRank(b.model) || a.model.localeCompare(b.model) || storageRank(a.storage) - storageRank(b.storage));
  }, [categories, search]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const cellKey = (categoryId: string, row: Row) => `${categoryId}:${row.model}:${row.storage}`;
  const hasChanges = useMemo(() => rows.some(row => categories.some(category => {
      const rawPrice = row.prices[category.id]; const price = rawPrice?.id.startsWith('new-') ? undefined : rawPrice; const value = drafts[cellKey(category.id, row)];
    return value !== undefined && value !== '' && Number(value) !== (price?.price ?? NaN);
  })), [rows, categories, drafts]);

  const saveChanges = async () => {
    setSaving(true);
    const requests: Promise<Response>[] = [];
    rows.forEach(row => categories.forEach(category => {
      const key = cellKey(category.id, row); const value = drafts[key]; const rawPrice = row.prices[category.id]; const existing = rawPrice?.id.startsWith('new-') ? undefined : rawPrice;
      if (value === undefined || value === '' || Number(value) === existing?.price) return;
      requests.push(existing
        ? fetch(`/api/admin/sales-catalog/${existing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: Number(value) }) })
        : fetch('/api/admin/sales-catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoryId: category.id, model: row.model, storage: row.storage, price: Number(value) }) }));
    }));
    await Promise.all(requests); await load(); setSaving(false);
  };
  const addDevice = () => {
    if (!newDevice.model || !newDevice.storage) return;
    setCategories(items => items.map(category => ({ ...category, prices: [...category.prices, { id: `new-${category.id}-${newDevice.model}-${newDevice.storage}`, model: newDevice.model, storage: newDevice.storage, price: 0 }] })));
    setNewDevice(emptyDevice); setShowAdd(false);
  };
  const saveDefinitions = async () => {
    setSaving(true);
    await Promise.all(categories.map(category => fetch(`/api/admin/sale-categories/${category.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: category.label, description: category.description, imagePath: category.imagePath }) })));
    await load(); setShowDefinitions(false); setSaving(false);
  };

  return <div className="max-w-7xl mx-auto space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold tracking-wide text-violet-600">Trade-in setup</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Phones for sale</h1><p className="mt-2 text-gray-600">Set the phones customers can upgrade to and what each one costs.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => setShowDefinitions(!showDefinitions)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Pencil size={16} /> Edit categories <ChevronDown size={15} className={showDefinitions ? 'rotate-180 transition-transform' : 'transition-transform'} /></button><button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"><Plus size={17} /> Add phone</button></div></header>
    {showDefinitions && <section className="rounded-xl border border-violet-100 bg-violet-50/50 p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-gray-950">Category labels and descriptions</h2><p className="text-sm text-gray-600">This text appears in the customer trade-in journey.</p></div><button onClick={saveDefinitions} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> Save</button></div><div className="grid gap-4 lg:grid-cols-3">{categories.map((category, index) => <div className="rounded-lg border border-violet-100 bg-white p-4" key={category.id}><input className="w-full border-0 p-0 text-base font-semibold text-gray-950 focus:ring-0" value={category.label} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} /><textarea className="mt-3 min-h-20 w-full resize-none rounded-md border border-gray-200 p-2 text-sm text-gray-600" value={category.description || ''} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} /><input className="mt-3 w-full rounded-md border border-gray-200 p-2 text-sm text-gray-600" placeholder="Image path (e.g., /condition/Sealed.png)" value={category.imagePath || ''} onChange={e => setCategories(items => items.map((item, i) => i === index ? { ...item, imagePath: e.target.value } : item))} /></div>)}</div></section>}
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Package size={19} /></div><div><h2 className="font-semibold text-gray-950">Price comparison</h2><p className="text-sm text-gray-500">One row per device and storage option</p></div></div><div className="relative w-full sm:w-72"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search devices" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></div></div>
      {showAdd && <div className="flex flex-col gap-3 border-b border-violet-100 bg-violet-50 p-5 sm:flex-row"><input autoFocus value={newDevice.model} onChange={e => setNewDevice({ ...newDevice, model: e.target.value })} placeholder="Model, e.g. iPhone 16 Pro" className="flex-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm" /><input value={newDevice.storage} onChange={e => setNewDevice({ ...newDevice, storage: e.target.value })} placeholder="Storage, e.g. 256GB" className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm" /><div className="flex gap-2"><button onClick={addDevice} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Add row</button><button onClick={() => { setShowAdd(false); setNewDevice(emptyDevice); }} className="rounded-lg px-2 text-gray-500 hover:bg-violet-100"><X size={18} /></button></div></div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[940px]"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-6 py-3 text-left font-semibold">Device</th><th className="px-6 py-3 text-left font-semibold">Storage</th>{categories.map(category => <th key={category.id} className="px-5 py-3 text-right font-semibold">{category.label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{paginatedRows.map(row => <tr key={`${row.model}-${row.storage}`} className="hover:bg-gray-50/70"><td className="px-6 py-4 text-sm font-medium text-gray-900">{row.model}</td><td className="px-6 py-4 text-sm text-gray-600">{row.storage}</td>{categories.map(category => { const key = cellKey(category.id, row); const rawPrice = row.prices[category.id]; const existing = rawPrice?.id.startsWith('new-') ? undefined : rawPrice; const value = drafts[key] ?? (existing ? String(existing.price) : ''); return <td key={category.id} className="px-5 py-3 text-right"><label className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100"><span className="mr-1 text-sm text-gray-400">₦</span><input type="number" value={value} onChange={e => setDrafts({ ...drafts, [key]: e.target.value })} placeholder="—" className="w-24 bg-transparent text-right text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-300" /></label></td>; })}</tr>)}{rows.length === 0 && <tr><td colSpan={categories.length + 2} className="px-6 py-14 text-center text-sm text-gray-500">No devices match this search.</td></tr>}</tbody></table></div>
      <footer className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><p className="text-sm text-gray-500">{hasChanges ? 'You have unsaved price changes.' : 'All prices are saved.'}</p>{rows.length > 0 && <div className="flex items-center gap-2 text-sm text-gray-500"><span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, rows.length)} of {rows.length}</span><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40">Previous</button><span>Page {currentPage} of {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded border border-gray-300 bg-white px-2.5 py-1 disabled:opacity-40">Next</button></div>}</div><button onClick={saveChanges} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 self-end rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"><Save size={15} /> {saving ? 'Saving…' : 'Save changes'}</button></footer>
    </section>
  </div>;
}
