"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { AdminSwap, money } from "../adminData";

export default function ReportsPage() {
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { fetch("/api/swaps").then(async (response) => { const data: unknown = await response.json(); if (!response.ok || !Array.isArray(data)) throw new Error(); setSwaps(data as AdminSwap[]); }).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const booked = swaps.filter((swap) => swap.appointment).length;
  const totalQuote = swaps.reduce((sum, swap) => sum + Number(swap.amountToPay || 0), 0);
  const models = Array.from(swaps.reduce((map, swap) => map.set(swap.tradeInModel?.model || "Unknown model", (map.get(swap.tradeInModel?.model || "Unknown model") || 0) + 1), new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return <div className="space-y-7"><header className="border-b border-stone-200 pb-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Business / Reports</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Reports</h1><p className="mt-2 text-sm text-slate-500">A snapshot of submitted estimates and bookings.</p></header>{error && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><CircleAlert className="h-4 w-4" /> Report data could not be loaded.</div>}<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Tile label="Submitted requests" value={loading ? "—" : String(swaps.length)} /><Tile label="Bookings" value={loading ? "—" : String(booked)} /><Tile label="Booking rate" value={loading ? "—" : swaps.length ? `${Math.round(booked / swaps.length * 100)}%` : "0%"} /><Tile label="Estimated top-ups" value={loading ? "—" : money(totalQuote)} /></div><div className="grid gap-6 xl:grid-cols-2"><section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Popular trade-ins</h2><p className="mt-1 text-xs text-slate-500">By submitted request count</p>{models.length ? <div className="mt-5 divide-y divide-stone-100">{models.map(([model, count], index) => <div key={model} className="flex items-center justify-between py-3 text-sm"><span className="flex items-center gap-3"><span className="w-5 text-xs text-slate-400">{index + 1}.</span><span className="font-medium text-slate-900">{model}</span></span><span className="tabular-nums text-slate-500">{count}</span></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No requests yet.</p>}</section><section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">How to read this</h2><p className="mt-3 text-sm leading-6 text-slate-600">Estimated top-ups are the amounts customers were quoted. They are not completed sales or collected revenue. Booking rate shows the share of requests with an appointment.</p><Link href="/admin/swaps" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline">Explore requests <ArrowRight className="h-4 w-4" /></Link></section></div></div>;
}

function Tile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-stone-200 bg-white p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 break-words text-2xl font-semibold tabular-nums text-slate-950">{value}</p></div>; }
