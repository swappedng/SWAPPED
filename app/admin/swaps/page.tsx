"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { AdminSwap, day, money, requestContact, requestEmail, requestPhone, shortId } from "../adminData";

type Filter = "all" | "awaiting" | "booked";
const filters: { key: Filter; label: string }[] = [{ key: "all", label: "All requests" }, { key: "awaiting", label: "Awaiting booking" }, { key: "booked", label: "Booked" }];

function SwapsPageContent() {
  const params = useSearchParams();
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>(params.get("status") === "awaiting" ? "awaiting" : params.get("status") === "booked" ? "booked" : "all");

  useEffect(() => {
    fetch("/api/swaps").then(async (response) => { const data: unknown = await response.json(); if (!response.ok || !Array.isArray(data)) throw new Error("Could not load customer requests"); setSwaps(data as AdminSwap[]); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load customer requests")).finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => swaps.filter((swap) => {
    if (filter === "awaiting" && swap.appointment) return false;
    if (filter === "booked" && !swap.appointment) return false;
    const term = search.trim().toLowerCase();
    return !term || [requestContact(swap), requestEmail(swap), requestPhone(swap), swap.tradeInModel?.model, swap.upgradeModel, swap.id].some((value) => value?.toLowerCase().includes(term));
  }), [filter, search, swaps]);

  return <div className="space-y-7">
    <header className="border-b border-stone-200 pb-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operations / Requests</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Customer requests</h1><p className="mt-2 text-sm text-slate-500">Review estimates, customer details, and booking information.</p></header>
    <section className="grid gap-3 sm:grid-cols-3"><Summary label="All requests" count={swaps.length} loading={loading} /><Summary label="Awaiting booking" count={swaps.filter((swap) => !swap.appointment).length} loading={loading} /><Summary label="Booked" count={swaps.filter((swap) => swap.appointment).length} loading={loading} /></section>
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex flex-col gap-4 border-b border-stone-200 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between"><div role="tablist" aria-label="Request status" className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1">{filters.map((item) => <button key={item.key} role="tab" aria-selected={filter === item.key} onClick={() => setFilter(item.key)} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${filter === item.key ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item.label}</button>)}</div><label className="relative block w-full xl:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search requests</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, device…" className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200" /></label></div>
      {error && <div className="p-8 text-sm text-rose-700">{error}</div>}{loading && <div className="p-8 text-sm text-slate-500">Loading requests…</div>}{!loading && !error && visible.length === 0 && <div className="p-10 text-center"><p className="text-sm font-semibold text-slate-900">No requests found</p><p className="mt-1 text-sm text-slate-500">Try another search or status.</p></div>}
      {!loading && visible.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5">Customer / request</th><th className="px-5 py-3.5">Trade-in → upgrade</th><th className="px-5 py-3.5">Amount to pay</th><th className="px-5 py-3.5">Booking</th><th className="px-5 py-3.5"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y divide-stone-100">{visible.map((swap) => <tr key={swap.id} className="hover:bg-stone-50"><td className="px-5 py-4"><Link href={`/admin/swaps/${swap.id}`} className="block font-semibold text-slate-900 hover:underline">{requestContact(swap)}</Link><p className="mt-1 text-xs text-slate-500">#{shortId(swap.id)} · {day(swap.createdAt)}</p></td><td className="px-5 py-4 text-sm text-slate-700"><p>{swap.tradeInModel?.model || "Unknown device"} {swap.tradeInModel?.storage || ""}</p><p className="mt-1 text-xs text-slate-500">To {swap.upgradeModel || "unspecified"} {swap.upgradeStorage || ""}</p></td><td className="px-5 py-4 text-sm font-semibold tabular-nums text-slate-950">{money(swap.amountToPay)}</td><td className="px-5 py-4">{swap.appointment ? <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-slate-700">{day(swap.appointment.date)}</span> : <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">Awaiting booking</span>}</td><td className="px-5 py-4"><Link href={`/admin/swaps/${swap.id}`} aria-label={`View request ${shortId(swap.id)}`} className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-slate-900"><ArrowUpRight className="h-4 w-4" /></Link></td></tr>)}</tbody></table></div>}
      {!loading && !error && <div className="border-t border-stone-100 px-5 py-3 text-xs text-slate-500">Showing {visible.length} of {swaps.length} requests</div>}
    </section>
  </div>;
}

function Summary({ label, count, loading }: { label: string; count: number; loading: boolean }) { return <div className="rounded-xl border border-stone-200 bg-white p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{loading ? "—" : count}</p></div>; }

export default function SwapsPage() {
  return (
    <Suspense fallback={<div className="space-y-7"><header className="border-b border-stone-200 pb-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operations / Requests</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Customer requests</h1></header><div className="p-8 text-sm text-slate-500">Loading requests…</div></div>}>
      <SwapsPageContent />
    </Suspense>
  );
}
