"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Mail, Phone } from "lucide-react";
import { AdminSwap, dateTime, day, money, requestEmail, requestPhone, shortId } from "../../adminData";
import { getSwap } from "@/lib/api/endpoints/admin/swaps";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [swap, setSwap] = useState<AdminSwap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getSwap(id)
      .then((data) => {
        setSwap(data as AdminSwap);
        setLoading(false);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load this request"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-sm text-slate-500">Loading request…</div>;
  if (error || !swap) return <div className="space-y-4"><Link href="/admin/swaps" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Back to requests</Link><p className="text-sm text-rose-700">{error || "Request not found"}</p></div>;

  const email = requestEmail(swap);
  const phone = requestPhone(swap);
  const contact = swap.contactName || email || phone || "Customer";

  const answerLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (l) => l.toUpperCase());

  return <div className="space-y-7">
    <Link href="/admin/swaps" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Customer requests</Link>
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Request #{shortId(swap.id)}</p><h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">{contact}</h1><p className="mt-2 text-sm text-slate-500">Submitted {dateTime(swap.createdAt)}</p></div><span className={`self-start rounded-full px-3 py-1.5 text-xs font-semibold ${swap.appointment ? "bg-stone-200 text-slate-700" : "bg-amber-50 text-amber-800"}`}>{swap.appointment ? "Booked" : "Awaiting booking"}</span></header>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="border-b border-stone-100 px-5 py-5 sm:px-6"><h2 className="text-base font-semibold text-slate-950">Swap overview</h2><p className="mt-1 text-xs text-slate-500">The devices the customer selected</p></div><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><div className="rounded-xl bg-stone-50 p-5"><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Trading in</p><p className="mt-3 text-lg font-semibold text-slate-950">{swap.tradeInModel?.model || "Not specified"}</p><p className="mt-1 text-sm text-slate-500">{swap.tradeInModel?.storage || "Storage not specified"}</p></div><div className="rounded-xl bg-stone-50 p-5"><p className="text-xs font-medium uppercase tracking-wider text-slate-500">Upgrading to</p><p className="mt-3 text-lg font-semibold text-slate-950">{swap.upgradeModel || "Not specified"}</p><p className="mt-1 text-sm text-slate-500">{swap.upgradeStorage || "Storage not specified"} · {swap.upgradeCategory?.label}</p></div></div></section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Customer assessment</h2><p className="mt-1 text-xs text-slate-500">Answers provided during the trade-in flow</p>{swap.conditions?.length ? <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">{swap.conditions.map(({ groupKey, value }) => <div key={groupKey} className="border-t border-stone-100 pt-3"><dt className="text-xs text-slate-500">{answerLabel(groupKey)}</dt><dd className="mt-1 text-sm font-medium capitalize text-slate-900">{String(value).replace(/[-_]/g, " ")}</dd></div>)}</dl> : <p className="mt-5 text-sm text-slate-500">No condition answers were saved with this request.</p>}</section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Activity</h2><div className="mt-5 space-y-5 border-l border-stone-200 pl-5"><div className="relative"><span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-slate-950 ring-4 ring-white" /><p className="text-sm font-medium text-slate-900">Request submitted</p><p className="mt-1 text-xs text-slate-500">{dateTime(swap.createdAt)}</p></div>{swap.appointment && <div className="relative"><span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-slate-950 ring-4 ring-white" /><p className="text-sm font-medium text-slate-900">Appointment booked</p><p className="mt-1 text-xs text-slate-500">{dateTime(swap.appointment.createdAt)}</p></div>}</div></section>
      </div>
      <div className="space-y-6"><section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Quote breakdown</h2><p className="mt-1 text-xs text-slate-500">Estimate saved when the request was submitted</p><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Upgrade price</dt><dd className="font-medium tabular-nums text-slate-900">{money(swap.upgradePrice)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Trade-in estimate</dt><dd className="font-medium tabular-nums text-slate-900">− {money(swap.tradeInValue)}</dd></div><div className="flex justify-between gap-3 border-t border-stone-200 pt-4"><dt className="font-semibold text-slate-950">Amount to pay</dt><dd className="text-lg font-semibold tabular-nums text-slate-950">{money(swap.amountToPay)}</dd></div></dl><p className="mt-3 text-xs text-slate-500 capitalize">Method: {String(swap.swapMethod).replace(/_/g, " ").toLowerCase()}</p><p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs leading-5 text-slate-600">Final price is confirmed after device inspection.</p></section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Contact</h2><div className="mt-4 space-y-3 text-sm">{email ? <a href={`mailto:${email}`} className="flex items-center gap-3 break-all text-slate-700 hover:text-slate-950"><Mail className="h-4 w-4 shrink-0 text-slate-400" />{email}<ExternalLink className="ml-auto h-3 w-3 shrink-0 text-slate-400" /></a> : <p className="text-slate-500">No email provided</p>}{phone ? <a href={`tel:${phone}`} className="flex items-center gap-3 text-slate-700 hover:text-slate-950"><Phone className="h-4 w-4 shrink-0 text-slate-400" />{phone}<ExternalLink className="ml-auto h-3 w-3 shrink-0 text-slate-400" /></a> : <p className="text-slate-500">No phone provided</p>}</div></section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-500" /><h2 className="text-base font-semibold text-slate-950">Appointment</h2></div>{swap.appointment ? <div className="mt-4"><p className="text-sm font-semibold text-slate-950">{day(swap.appointment.date)} at {swap.appointment.time}</p><p className="mt-1 text-sm capitalize text-slate-500">{swap.appointment.swapMethod.replace(/[-_]/g, " ")}</p></div> : <p className="mt-4 text-sm text-slate-500">The customer has not booked an appointment yet.</p>}</section>
      </div>
    </div>
  </div>;
}
