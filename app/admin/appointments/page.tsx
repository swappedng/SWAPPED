"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Search } from "lucide-react";
import { AdminSwap, day, requestContact, requestPhone, shortId } from "../adminData";
import { getSwaps } from "@/lib/api/endpoints/admin/swaps";

type View = "upcoming" | "past" | "all";

export default function AppointmentsPage() {
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getSwaps().then((data) => {
      setSwaps(data as AdminSwap[]);
      setLoading(false);
    }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load appointments")).finally(() => setLoading(false));
  }, []);

  const appointments = useMemo(() => swaps.filter((swap) => swap.appointment).sort((a, b) => new Date(a.appointment!.date).getTime() - new Date(b.appointment!.date).getTime()), [swaps]);
  const today = new Date().setHours(0, 0, 0, 0);
  const visible = appointments.filter((swap) => {
    const isUpcoming = new Date(swap.appointment!.date).getTime() >= today;
    if (view === "upcoming" && !isUpcoming) return false;
    if (view === "past" && isUpcoming) return false;
    const term = search.trim().toLowerCase();
    return !term || [requestContact(swap), requestPhone(swap), swap.tradeInModel?.model, swap.id].some((value) => value?.toLowerCase().includes(term));
  });

  return <div className="space-y-7"><header className="border-b border-stone-200 pb-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operations / Appointments</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Appointments</h1><p className="mt-2 text-sm text-slate-500">See booked pickups and store visits alongside their customer requests.</p></header>
    <div className="grid gap-3 sm:grid-cols-3"><Stat label="Upcoming" value={appointments.filter((swap) => new Date(swap.appointment!.date).getTime() >= today).length} loading={loading} /><Stat label="Today" value={appointments.filter((swap) => new Date(swap.appointment!.date).toDateString() === new Date().toDateString()).length} loading={loading} /><Stat label="All bookings" value={appointments.length} loading={loading} /></div>
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex flex-col gap-4 border-b border-stone-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-1 rounded-lg bg-stone-100 p-1">{(["upcoming", "past", "all"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-md px-3 py-2 text-xs font-semibold capitalize ${view === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}</div><label className="relative block w-full lg:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search appointments</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search appointments…" className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200" /></label></div>
      {error && <p className="p-8 text-sm text-rose-700">{error}</p>}{loading && <p className="p-8 text-sm text-slate-500">Loading appointments…</p>}{!loading && !error && visible.length === 0 && <div className="p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-900">No {view === "all" ? "" : `${view} `}appointments</p><p className="mt-1 text-sm text-slate-500">Booked customer visits will appear here.</p></div>}
      {!loading && visible.length > 0 && <div className="divide-y divide-stone-100">{visible.map((swap) => <Link key={swap.id} href={`/admin/swaps/${swap.id}`} className="flex flex-col gap-3 px-5 py-4 hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-600"><CalendarDays className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-slate-950">{requestContact(swap)}</p><p className="mt-1 text-xs text-slate-500">{swap.tradeInModel?.model || "Unknown device"} · #{shortId(swap.id)}</p></div></div><div className="flex items-center justify-between gap-5 pl-[60px] sm:pl-0"><div className="sm:text-right"><p className="text-sm font-semibold text-slate-900">{day(swap.appointment!.date)} · {swap.appointment!.time}</p><p className="mt-1 text-xs capitalize text-slate-500">{swap.appointment!.swapMethod.replace(/[-_]/g, " ")}</p></div><ArrowUpRight className="h-4 w-4 text-slate-400" /></div></Link>)}</div>}
    </section>
  </div>;
}

function Stat({ label, value, loading }: { label: string; value: number; loading: boolean }) { return <div className="rounded-xl border border-stone-200 bg-white p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{loading ? "—" : value}</p></div>; }
