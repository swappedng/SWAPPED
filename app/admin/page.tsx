"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, CircleAlert, ExternalLink, SlidersHorizontal, Smartphone, Tag, RefreshCcw } from "lucide-react";
import { AdminSwap, day, money, requestContact, shortId } from "./adminData";
import { revalidateTradeIn } from "./actions";

type SaleCategory = { prices?: unknown[] };

export default function AdminDashboard() {
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [counts, setCounts] = useState({ models: 0, questions: 0, prices: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const paths = ["/api/swaps", "/api/admin/phone-models", "/api/admin/condition-attributes/groups", "/api/admin/sales-catalog"];
        const responses = await Promise.all(paths.map((path) => fetch(path)));
        const data: unknown[] = await Promise.all(responses.map((response) => response.json()));
        if (responses.some((response) => !response.ok) || data.some((item) => !Array.isArray(item))) throw new Error("Dashboard data unavailable");
        const [requests, models, questions, categories] = data as [AdminSwap[], unknown[], unknown[], SaleCategory[]];
        setSwaps(requests);
        setCounts({ models: models.length, questions: questions.length, prices: categories.reduce((total, category) => total + (category.prices?.length || 0), 0) });
      } catch { setError(true); } finally { setLoading(false); }
    };
    load();
  }, []);

  const pending = swaps.filter((swap) => !swap.appointment);
  const booked = swaps.filter((swap) => swap.appointment);
  const upcoming = booked.filter((swap) => new Date(swap.appointment!.date).getTime() >= new Date().setHours(0, 0, 0, 0)).sort((a, b) => new Date(a.appointment!.date).getTime() - new Date(b.appointment!.date).getTime());
  const setup = [
    { label: "Trade-in values", detail: `${counts.models} devices configured`, href: "/admin/phone-models", ready: counts.models > 0, icon: Smartphone },
    { label: "Condition questions", detail: `${counts.questions} question groups`, href: "/admin/condition-attributes", ready: counts.questions > 0, icon: SlidersHorizontal },
    { label: "Phones for sale", detail: `${counts.prices} prices configured`, href: "/admin/selling-prices", ready: counts.prices > 0, icon: Tag },
  ];

  return <div className="space-y-8">
    <header className="flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace / Overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">Good to have you here.</h1><p className="mt-2 text-sm text-slate-500">A clear view of requests, bookings, and quote setup.</p></div>
      <button 
        onClick={async () => {
          setIsRefreshing(true);
          await revalidateTradeIn();
          setTimeout(() => setIsRefreshing(false), 800);
        }}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 self-start rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 disabled:opacity-50"
      >
        {isRefreshing ? "Syncing..." : "Sync frontend"} <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </header>
    {error && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><CircleAlert className="h-4 w-4 shrink-0" /> Dashboard data could not be loaded. Try refreshing.</div>}
    <section aria-label="Overview metrics" className="grid gap-3 sm:grid-cols-3">
      <Metric href="/admin/swaps?status=awaiting" label="Needs booking" value={loading ? "—" : pending.length.toString()} note="Requests without an appointment" prominent />
      <Metric href="/admin/appointments" label="Upcoming appointments" value={loading ? "—" : upcoming.length.toString()} note="Booked for today or later" />
      <Metric href="/admin/swaps" label="All requests" value={loading ? "—" : swaps.length.toString()} note="Every submitted quote" />
    </section>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,1fr)]">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-semibold text-slate-950">Recent requests</h2><p className="mt-1 text-xs text-slate-500">Latest customer quotes</p></div><Link href="/admin/swaps" className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">View all <ArrowRight className="h-4 w-4" /></Link></div>
        {loading ? <p className="px-6 py-12 text-sm text-slate-500">Loading requests…</p> : swaps.length === 0 ? <p className="px-6 py-12 text-sm text-slate-500">Requests will appear here when customers submit a quote.</p> : <div className="divide-y divide-stone-100">{swaps.slice(0, 5).map((swap) => <Link key={swap.id} href={`/admin/swaps/${swap.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{requestContact(swap)}</p><p className="mt-1 text-xs text-slate-500">{swap.tradeInModel?.model || "Unknown phone"} · #{shortId(swap.id)} · {day(swap.createdAt)}</p></div><div className="flex items-center justify-between gap-5 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${swap.appointment ? "bg-stone-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>{swap.appointment ? "Booked" : "Awaiting booking"}</span><span className="min-w-[100px] text-right text-sm font-semibold tabular-nums text-slate-950">{money(swap.amountToPay)}</span><ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" /></div></Link>)}</div>}
      </section>
      <div className="space-y-6"><section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-950">Quote setup</h2><p className="mt-1 text-xs text-slate-500">The three essentials</p></div><span className="text-xl font-semibold tabular-nums text-slate-950">{loading ? "—" : setup.filter((item) => item.ready).length}/3</span></div><div className="mt-5 divide-y divide-stone-100">{setup.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="flex items-center gap-3 py-3.5 hover:text-slate-950"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-slate-600"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{item.label}</span><span className="block text-xs text-slate-500">{loading ? "Loading…" : item.detail}</span></span><span className={`h-2 w-2 rounded-full ${item.ready ? "bg-emerald-500" : "bg-stone-300"}`} aria-label={item.ready ? "Configured" : "Needs setup"} /><ChevronRight className="h-4 w-4 text-slate-400" /></Link>; })}</div></section><section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-500" /><h2 className="text-base font-semibold text-slate-950">Next appointment</h2></div>{loading ? <p className="mt-5 text-sm text-slate-500">Loading…</p> : upcoming[0] ? <Link href={`/admin/swaps/${upcoming[0].id}`} className="mt-5 block rounded-xl bg-stone-50 p-4 hover:bg-stone-100"><p className="text-sm font-semibold text-slate-950">{requestContact(upcoming[0])}</p><p className="mt-1 text-xs text-slate-500">{day(upcoming[0].appointment!.date)} at {upcoming[0].appointment!.time} · {upcoming[0].appointment!.appointmentType}</p></Link> : <p className="mt-5 text-sm text-slate-500">No upcoming appointments booked.</p>}</section></div>
    </div>
  </div>;
}

function Metric({ href, label, value, note, prominent = false }: { href: string; label: string; value: string; note: string; prominent?: boolean }) {
  return <Link href={href} className={`rounded-2xl border p-5 transition hover:shadow-sm sm:p-6 ${prominent ? "border-slate-800 bg-slate-950 text-white" : "border-stone-200 bg-white text-slate-950"}`}><p className={`text-xs font-medium ${prominent ? "text-slate-300" : "text-slate-500"}`}>{label}</p><p className="mt-3 text-[34px] font-semibold leading-none tabular-nums">{value}</p><p className={`mt-3 text-xs ${prominent ? "text-slate-400" : "text-slate-500"}`}>{note}</p></Link>;
}
