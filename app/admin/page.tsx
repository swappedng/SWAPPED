"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleAlert, Clock3, ExternalLink, PackageCheck, SlidersHorizontal, Smartphone, Tag, Users } from "lucide-react";

type Swap = {
  id: string;
  tradeInPhone?: { model?: string; contactEmail?: string; contactPhone?: string };
  contactEmail?: string;
  contactPhone?: string;
  amountToPay?: number;
  createdAt: string;
  appointment?: { date: string; time: string } | null;
};

export default function AdminDashboard() {
  const [phoneModels, setPhoneModels] = useState<any[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<any[]>([]);
  const [saleCategories, setSaleCategories] = useState<any[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/admin/phone-models"),
          fetch("/api/admin/condition-attributes/groups"),
          fetch("/api/admin/sales-catalog"),
          fetch("/api/swaps"),
        ]);
        const data = await Promise.all(responses.map((response) => response.json()));
        if (!responses.every((response, index) => response.ok && Array.isArray(data[index]))) throw new Error("One or more dashboard services failed");
        setPhoneModels(data[0]); setAttributeGroups(data[1]); setSaleCategories(data[2]); setSwaps(data[3]);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
        setLoadError(true);
      } finally { setLoading(false); }
    };
    loadDashboard();
  }, []);

  const setupSteps = [
    { number: 1, title: "Set trade-in values", description: "Enter the highest amount you will offer for every iPhone and storage size.", href: "/admin/phone-models", action: phoneModels.length ? "Review values" : "Add values", ready: phoneModels.length > 0, detail: `${phoneModels.length} model${phoneModels.length === 1 ? "" : "s"} configured`, icon: Smartphone, colors: "bg-violet-100 text-violet-700" },
    { number: 2, title: "Set condition questions", description: "Decide how screen, battery, body and other conditions affect a quote.", href: "/admin/condition-attributes", action: attributeGroups.length ? "Review questions" : "Add questions", ready: attributeGroups.length > 0, detail: `${attributeGroups.length} question group${attributeGroups.length === 1 ? "" : "s"}`, icon: SlidersHorizontal, colors: "bg-blue-100 text-blue-700" },
    { number: 3, title: "Set phones for sale", description: "Add the phones customers can upgrade to and enter their selling prices.", href: "/admin/selling-prices", action: saleCategories.length ? "Review prices" : "Add selling prices", ready: saleCategories.some((category) => category.prices?.length), detail: `${saleCategories.reduce((total, category) => total + (category.prices?.length || 0), 0)} prices configured`, icon: Tag, colors: "bg-emerald-100 text-emerald-700" },
  ];
  const configuredSteps = setupSteps.filter((step) => step.ready).length;

  return <div className="mx-auto max-w-4xl space-y-12">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-4 border-b border-slate-100">
      <div><h1 className="text-3xl font-bold tracking-tight text-slate-900">Workspace</h1><p className="mt-1 text-sm text-slate-500">Manage your prices and handle customer requests.</p></div>
      <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">View website <ExternalLink className="h-4 w-4" /></Link>
    </header>

    {loadError && <div className="flex items-center gap-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900"><CircleAlert className="h-4 w-4 shrink-0" /> Some dashboard information could not be loaded.</div>}

    <section className="grid gap-6 sm:grid-cols-3">
      <Link href="/admin/swaps" className="group flex flex-col gap-1.5 p-3 rounded-md hover:bg-black/5 transition -mx-3">
        <p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Users className="h-4 w-4" /> Requests</p>
        <p className="text-3xl font-semibold text-slate-900">{loading ? "—" : swaps.length}</p>
      </Link>
      <div className="flex flex-col gap-1.5 p-3"><p className="text-sm font-medium text-slate-500 flex items-center gap-2"><PackageCheck className="h-4 w-4" /> Setup complete</p><p className="text-3xl font-semibold text-slate-900">{loading ? "—" : `${configuredSteps}/3`}</p></div>
      <div className="flex flex-col gap-1.5 p-3"><p className="text-sm font-medium text-slate-500 flex items-center gap-2"><Clock3 className="h-4 w-4" /> Awaiting booking</p><p className="text-3xl font-semibold text-slate-900">{loading ? "—" : swaps.filter((swap) => !swap.appointment).length}</p></div>
    </section>

    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-3">Set up customer quotes</h2>
      <div className="flex flex-col gap-1 -mx-3">{setupSteps.map((step) => { const Icon = step.icon; return <Link key={step.number} href={step.href} className="group flex items-center justify-between p-3 rounded-md hover:bg-black/5 transition">
        <div className="flex items-center gap-4">
          <Icon className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          <div>
            <p className="text-sm font-medium text-slate-900">{step.title}</p>
            <p className="text-xs text-slate-500">{step.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {step.ready ? <span className="text-slate-400 text-xs flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Ready</span> : <span className="text-amber-600 text-xs">Needs setup</span>}
          <span className="text-slate-300 group-hover:text-slate-900 transition-colors"><ChevronRight className="h-4 w-4" /></span>
        </div>
      </Link>; })}</div>
    </section>

    <section>
      <div className="flex items-center justify-between mb-3"><h2 className="text-base font-semibold text-slate-900">Recent requests</h2><Link href="/admin/swaps" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">View all</Link></div>
      <div className="flex flex-col gap-1 -mx-3">{!loading && swaps.slice(0, 5).map((swap) => { const email = swap.contactEmail || swap.tradeInPhone?.contactEmail || "No email provided"; const model = swap.tradeInPhone?.model || "Phone not specified"; return <Link href="/admin/swaps" key={swap.id} className="group flex items-center justify-between p-3 rounded-md hover:bg-black/5 transition">
        <div className="flex items-center gap-3"><div className="h-8 w-8 rounded flex items-center justify-center bg-black/5 text-xs font-medium text-slate-600">{email.charAt(0).toUpperCase()}</div><div><p className="text-sm font-medium text-slate-900">{email}</p><p className="text-xs text-slate-500">{model}</p></div></div>
        <div className="text-right"><p className="text-sm font-medium text-slate-900">₦{Number(swap.amountToPay || 0).toLocaleString()}</p><p className={`text-xs ${swap.appointment ? "text-slate-400" : "text-amber-600"}`}>{swap.appointment ? "Booked" : "Awaiting booking"}</p></div>
      </Link>; })}{loading && <div className="p-3 text-sm text-slate-500">Loading requests…</div>}{!loading && swaps.length === 0 && <div className="p-3 text-sm text-slate-500">No requests yet.</div>}</div>
    </section>
  </div>;
}
