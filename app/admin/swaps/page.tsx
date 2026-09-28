"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, Search, Smartphone, Users } from "lucide-react";

type Swap = {
  id: string;
  tradeInPhone?: { model?: string; storage?: string; contactEmail?: string; contactPhone?: string };
  newPhone?: { model?: string; storage?: string };
  contactEmail?: string;
  contactPhone?: string;
  tradeInValue: number;
  newPhonePrice: number;
  amountToPay: number;
  createdAt: string;
  appointment?: { date: string; time: string; appointmentType?: string } | null;
};

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadSwaps = async () => {
      try {
        const response = await fetch("/api/swaps");
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || "Could not load customer requests");
        setSwaps(data);
      } catch (loadError) {
        console.error("Error fetching swaps:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load customer requests");
      } finally { setLoading(false); }
    };
    loadSwaps();
  }, []);

  const filteredSwaps = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return swaps;
    return swaps.filter((swap) => [
      swap.contactEmail, swap.tradeInPhone?.contactEmail,
      swap.contactPhone, swap.tradeInPhone?.contactPhone,
      swap.tradeInPhone?.model, swap.newPhone?.model,
    ].some((value) => value?.toLowerCase().includes(term)));
  }, [search, swaps]);

  const getEmail = (swap: Swap) => swap.contactEmail || swap.tradeInPhone?.contactEmail || "No email";
  const getPhone = (swap: Swap) => swap.contactPhone || swap.tradeInPhone?.contactPhone || "No phone";

  return <div className="mx-auto max-w-5xl space-y-8">
    <header className="flex flex-col gap-2 pb-4 border-b border-slate-100">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer requests</h1>
      <p className="text-sm text-slate-500">Every trade-in request submitted through the website appears here.</p>
    </header>

    <section className="grid gap-6 sm:grid-cols-3">
      <div className="flex flex-col gap-1 p-2"><p className="text-sm font-medium text-slate-500">All requests</p><p className="text-3xl font-semibold text-slate-900">{loading ? "—" : swaps.length}</p></div>
      <div className="flex flex-col gap-1 p-2"><p className="text-sm font-medium text-slate-500">Booked</p><p className="text-3xl font-semibold text-slate-900">{loading ? "—" : swaps.filter((swap) => swap.appointment).length}</p></div>
      <div className="flex flex-col gap-1 p-2"><p className="text-sm font-medium text-slate-500">Awaiting booking</p><p className="text-3xl font-semibold text-slate-900">{loading ? "—" : swaps.filter((swap) => !swap.appointment).length}</p></div>
    </section>

    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80"><Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests..." className="w-full rounded-md bg-black/5 py-1.5 pl-8 pr-3 text-sm outline-none transition focus:bg-black/10 placeholder:text-slate-500" /></div>
      </div>

      {error && <div className="rounded-md bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}
      {loading && <div className="py-12 text-center text-sm text-slate-500">Loading requests…</div>}
      {!loading && !error && filteredSwaps.length === 0 && <div className="py-12 text-center"><p className="text-sm font-medium text-slate-800">{search ? "No matching requests" : "No customer requests yet"}</p></div>}

      {!loading && filteredSwaps.length > 0 && <div className="flex flex-col gap-2 -mx-3">
        {filteredSwaps.map((swap) => <article key={swap.id} className="p-3 rounded-md transition hover:bg-black/5 group cursor-default">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 w-full sm:w-1/3">
              <div className="h-8 w-8 shrink-0 rounded flex items-center justify-center bg-black/5 text-slate-500 mt-0.5"><Smartphone className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-900 truncate ">{swap.tradeInPhone?.model || "Unknown trade-in"}{swap.tradeInPhone?.storage ? ` · ${swap.tradeInPhone.storage}` : ""}</h3></div>
                <p className="text-xs text-slate-500 truncate">Upgrading to {swap.newPhone?.model || "unspecified"}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(swap.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full sm:w-2/3 text-sm">
              <div className="min-w-0">
                <a href={`mailto:${getEmail(swap)}`} className="truncate block font-medium text-slate-700 hover:text-slate-900">{getEmail(swap)}</a>
                <a href={`tel:${getPhone(swap)}`} className="text-xs text-slate-500 hover:text-slate-900 block truncate mt-0.5">{getPhone(swap)}</a>
              </div>
              <div>
                <p className="font-semibold text-slate-900">₦{Number(swap.amountToPay || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Trade-in: ₦{Number(swap.tradeInValue || 0).toLocaleString()}</p>
              </div>
              <div>
                {swap.appointment ? <div><p className="font-medium text-slate-900">{new Date(swap.appointment.date).toLocaleDateString()}</p><p className="text-xs text-slate-500">{swap.appointment.time}</p></div> : <p className="text-sm text-amber-600">Awaiting booking</p>}
              </div>
            </div>
          </div>
        </article>)}
      </div>}
    </section>
  </div>;
}
