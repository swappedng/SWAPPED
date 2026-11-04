"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, CircleAlert, ExternalLink, Smartphone, Tag, RefreshCcw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { AdminSwap, day, money, requestContact, shortId } from "./adminData";
import { revalidateTradeIn } from "./actions";

type SaleCategory = { prices?: unknown[] };
type PhoneModel = { id: string; label: string; model: string; storage: string; buyingPrice: number; isActive: boolean };
type ModelStatus = {
  model: PhoneModel;
  hasBuyingPrice: boolean;
  hasChecklistConfigured: boolean;
  isActive: boolean;
};

export default function AdminDashboard() {
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
  const [counts, setCounts] = useState({ models: 0, questions: 0, prices: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const paths = ["/api/swaps", "/api/admin/phone-models?admin=1", "/api/admin/condition-attributes/groups", "/api/admin/sales-catalog"];
        const responses = await Promise.all(paths.map((path) => fetch(path)));
        const data: unknown[] = await Promise.all(responses.map((response) => response.json()));
        if (responses.some((response) => !response.ok) || data.some((item) => !Array.isArray(item))) throw new Error("Dashboard data unavailable");
        const [requests, models, questions, categories] = data as [AdminSwap[], PhoneModel[], unknown[], SaleCategory[]];
        setSwaps(requests);
        setCounts({ models: models.length, questions: questions.length, prices: categories.reduce((total, category) => total + (category.prices?.length || 0), 0) });

        // Fetch model condition modifiers to check which models have checklist configured
        const modifiersRes = await fetch("/api/admin/phone-models/modifiers-summary");
        const modifiersData = await modifiersRes.json();
        const configuredModels = new Set(modifiersData.models || []);

        const statuses: ModelStatus[] = models.map((model) => ({
          model,
          hasBuyingPrice: model.buyingPrice > 0,
          hasChecklistConfigured: configuredModels.has(model.model),
          isActive: model.isActive,
        }));
        setModelStatuses(statuses);
      } catch { setError(true); } finally { setLoading(false); }
    };
    load();
  }, []);

  const pending = swaps.filter((swap) => !swap.appointment);
  const booked = swaps.filter((swap) => swap.appointment);
  const upcoming = booked.filter((swap) => new Date(swap.appointment!.date).getTime() >= new Date().setHours(0, 0, 0, 0)).sort((a, b) => new Date(a.appointment!.date).getTime() - new Date(b.appointment!.date).getTime());

  const inactiveModels = modelStatuses.filter((s) => !s.isActive);
  const noBuyingPrice = modelStatuses.filter((s) => s.isActive && !s.hasBuyingPrice);
  const noChecklist = modelStatuses.filter((s) => s.isActive && s.hasBuyingPrice && !s.hasChecklistConfigured);
  const readyModels = modelStatuses.filter((s) => s.isActive && s.hasBuyingPrice && s.hasChecklistConfigured);

  const setup = [
    { label: "Phone Models", detail: `${readyModels.length}/${modelStatuses.length} ready`, href: "/admin/phone-models", ready: readyModels.length > 0, icon: Smartphone },
    { label: "Selling Prices", detail: `${counts.prices} prices configured`, href: "/admin/selling-prices", ready: counts.prices > 0, icon: Tag },
  ];

  return <div className="space-y-8">
    <header className="flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">Good to have you here.</h1><p className="mt-2 text-sm text-slate-500">A clear view of requests, bookings, and catalogue status.</p></div>
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
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Recent requests</h2>
            <p className="mt-1 text-xs text-slate-500">Latest customer quotes</p>
          </div>
          <Link href="/admin/swaps" className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <p className="px-6 py-12 text-sm text-slate-500">Loading requests…</p>
        ) : swaps.length === 0 ? (
          <p className="px-6 py-12 text-sm text-slate-500">Requests will appear here when customers submit a quote.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {swaps.slice(0, 5).map((swap) => (
              <Link
                key={swap.id}
                href={`/admin/swaps/${swap.id}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{requestContact(swap)}</p>
                  <p className="mt-1 text-xs text-slate-500">{swap.tradeInModel?.model || "Unknown phone"} · #{shortId(swap.id)} · {day(swap.createdAt)}</p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${swap.appointment ? "bg-stone-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>
                    {swap.appointment ? "Booked" : "Awaiting booking"}
                  </span>
                  <span className="min-w-[100px] text-right text-sm font-semibold tabular-nums text-slate-950">{money(swap.amountToPay)}</span>
                  <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Phone catalogue status</h2>
              <p className="mt-1 text-xs text-slate-500">Configuration completeness</p>
            </div>
            <span className="text-xl font-semibold tabular-nums text-slate-950">{loading ? "—" : `${readyModels.length}/${modelStatuses.length}`}</span>
          </div>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <>
                {readyModels.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{readyModels.length} models fully configured</span>
                  </div>
                )}
                {noBuyingPrice.length > 0 && (
                  <Link href="/admin/phone-models" className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{noBuyingPrice.length} models missing buying price</span>
                  </Link>
                )}
                {noChecklist.length > 0 && (
                  <Link href="/admin/phone-models" className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{noChecklist.length} models missing inspection checklist</span>
                  </Link>
                )}
                {inactiveModels.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <XCircle className="h-4 w-4" />
                    <span>{inactiveModels.length} models deactivated</span>
                  </div>
                )}
                {readyModels.length === modelStatuses.length && modelStatuses.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>All models configured and ready</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-950">Next appointment</h2>
          </div>
          {loading ? (
            <p className="mt-5 text-sm text-slate-500">Loading…</p>
          ) : upcoming[0] ? (
            <Link href={`/admin/swaps/${upcoming[0].id}`} className="mt-5 block rounded-xl bg-stone-50 p-4 hover:bg-stone-100">
              <p className="text-sm font-semibold text-slate-950">{requestContact(upcoming[0])}</p>
              <p className="mt-1 text-xs text-slate-500">{day(upcoming[0].appointment!.date)} at {upcoming[0].appointment!.time} · {upcoming[0].appointment!.swapMethod}</p>
            </Link>
          ) : (
            <p className="mt-5 text-sm text-slate-500">No upcoming appointments scheduled</p>
          )}
        </section>
      </div>
    </div>
  </div>;
}

function Metric({ href, label, value, note, prominent = false }: { href: string; label: string; value: string; note: string; prominent?: boolean }) {
  return <Link href={href} className={`rounded-2xl border p-5 transition hover:shadow-sm sm:p-6 ${prominent ? "border-slate-800 bg-slate-950 text-white" : "border-stone-200 bg-white text-slate-950"}`}><p className={`text-xs font-medium ${prominent ? "text-slate-300" : "text-slate-500"}`}>{label}</p><p className="mt-3 text-[34px] font-semibold leading-none tabular-nums">{value}</p><p className={`mt-3 text-xs ${prominent ? "text-slate-400" : "text-slate-500"}`}>{note}</p></Link>;
}
