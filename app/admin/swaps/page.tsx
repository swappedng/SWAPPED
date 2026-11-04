"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { AdminSwap, day, money, requestContact, requestEmail, requestPhone, shortId, statusLabel, statusBadgeClass } from "../adminData";
import { SwapStatus } from "@/lib/api/types/enums";

type TabFilter = "all" | "active" | "awaiting_approval" | "completed";

function SwapsPageContent() {
  const params = useSearchParams();
  const [swaps, setSwaps] = useState<AdminSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const paramStatus = params.get("status") as SwapStatus | null;
  const [tab, setTab] = useState<TabFilter>(() => {
    if (paramStatus === SwapStatus.AWAITING_CUSTOMER_APPROVAL) return "awaiting_approval";
    if (paramStatus === SwapStatus.COMPLETED) return "completed";
    return "all";
  });
  const [statusFilter, setStatusFilter] = useState<SwapStatus | "all">(() => {
    if (paramStatus && Object.values(SwapStatus).includes(paramStatus)) {
      if (paramStatus !== SwapStatus.AWAITING_CUSTOMER_APPROVAL && paramStatus !== SwapStatus.COMPLETED) {
        return paramStatus;
      }
    }
    return "all";
  });

  useEffect(() => {
    import('@/lib/api/endpoints/admin/swaps').then(({ getSwaps }) => {
      getSwaps().then((data) => {
        setSwaps(data as AdminSwap[]);
        setLoading(false);
      }).catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load customer requests"));
    });
  }, []);

  const activeCount = (status: SwapStatus) => swaps.filter(s => s.status === status).length;
  const pendingApproval = activeCount(SwapStatus.AWAITING_CUSTOMER_APPROVAL);
  const activeSwapsCount = swaps.filter((s) => ![SwapStatus.COMPLETED, SwapStatus.REJECTED, SwapStatus.CANCELLED].includes(s.status)).length;
  const completedCount = activeCount(SwapStatus.COMPLETED);

  const visible = useMemo(() => swaps.filter((swap) => {
    // 1. If specific status filter is active
    if (statusFilter !== "all") {
      if (swap.status !== statusFilter) return false;
    } else {
      // 2. High-level tab filtering
      if (tab === "active") {
        if ([SwapStatus.COMPLETED, SwapStatus.REJECTED, SwapStatus.CANCELLED].includes(swap.status)) return false;
      } else if (tab === "awaiting_approval") {
        if (swap.status !== SwapStatus.AWAITING_CUSTOMER_APPROVAL) return false;
      } else if (tab === "completed") {
        if (swap.status !== SwapStatus.COMPLETED) return false;
      }
    }

    // 3. Search query
    const term = search.trim().toLowerCase();
    return !term || [
      requestContact(swap),
      requestEmail(swap),
      requestPhone(swap),
      swap.tradeInModel?.model,
      swap.upgradeModel,
      swap.id,
    ].some((value) => value?.toLowerCase().includes(term));
  }), [tab, statusFilter, search, swaps]);

  const tabs: { key: TabFilter; label: string; count: number; badge?: string }[] = [
    { key: "all", label: "All requests", count: swaps.length },
    { key: "active", label: "Active", count: activeSwapsCount },
    {
      key: "awaiting_approval",
      label: "Awaiting approval",
      count: pendingApproval,
      badge: pendingApproval > 0 ? "bg-amber-100 text-amber-800" : undefined,
    },
    { key: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <div className="space-y-7">
      <header className="border-b border-stone-200 pb-7">
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Customer requests</h1>
        <p className="mt-2 text-sm text-slate-500">Review estimates, customer details, and swap lifecycle.</p>
        {pendingApproval > 0 && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200">
            ⚠ {pendingApproval} swap{pendingApproval > 1 ? 's' : ''} awaiting customer approval
          </p>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Summary label="All requests" count={swaps.length} loading={loading} />
        <Summary label="Active" count={activeSwapsCount} loading={loading} />
        <Summary label="Awaiting approval" count={pendingApproval} loading={loading} highlight />
        <Summary label="Completed" count={completedCount} loading={loading} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {/* Toolbar: 4 Clean Tabs on left + Status Dropdown & Search on right */}
        <div className="flex flex-col gap-4 border-b border-stone-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Request categories" className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            {tabs.map((item) => {
              const selected = statusFilter === "all" && tab === item.key;
              return (
                <button
                  key={item.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setTab(item.key);
                    setStatusFilter("all");
                  }}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition ${
                    selected ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>{item.label}</span>
                  {!loading && item.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        item.badge || (selected ? "bg-stone-100 text-slate-700" : "bg-stone-200/70 text-slate-500")
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Granular status dropdown */}
            <div className="relative">
              <select
                aria-label="Filter by specific status"
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value as SwapStatus | "all";
                  setStatusFilter(val);
                }}
                className={`appearance-none rounded-lg border py-2 pl-3 pr-8 text-xs font-medium outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200 ${
                  statusFilter !== "all"
                    ? "border-violet-300 bg-violet-50/50 text-violet-900 font-semibold"
                    : "border-stone-300 bg-white text-slate-600 hover:bg-stone-50"
                }`}
              >
                <option value="all">All specific statuses</option>
                <option value={SwapStatus.SUBMITTED}>Submitted</option>
                <option value={SwapStatus.INSPECTION_SCHEDULED}>Inspection Scheduled</option>
                <option value={SwapStatus.UNDER_INSPECTION}>Under Inspection</option>
                <option value={SwapStatus.AWAITING_CUSTOMER_APPROVAL}>Awaiting Approval</option>
                <option value={SwapStatus.APPROVED}>Approved</option>
                <option value={SwapStatus.FULFILMENT_IN_PROGRESS}>Fulfilment In Progress</option>
                <option value={SwapStatus.COMPLETED}>Completed</option>
                <option value={SwapStatus.REJECTED}>Rejected</option>
                <option value={SwapStatus.CANCELLED}>Cancelled</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Search input */}
            <label className="relative block w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Search requests</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, device…"
                className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>
        </div>

        {error && <div className="p-8 text-sm text-rose-700">{error}</div>}
        {loading && <div className="p-8 text-sm text-slate-500">Loading requests…</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">No requests found</p>
            <p className="mt-1 text-sm text-slate-500">Try another search or status filter.</p>
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer / request</th>
                  <th className="px-5 py-3.5">Trade-in → upgrade</th>
                  <th className="px-5 py-3.5">Amount to pay</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((swap) => (
                  <tr key={swap.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4">
                      <Link href={`/admin/swaps/${swap.id}`} className="block font-semibold text-slate-900 hover:underline">
                        {requestContact(swap)}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">#{shortId(swap.id)} · {day(swap.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <p>{swap.tradeInModel?.model || "Unknown device"} {swap.tradeInModel?.storage || ""}</p>
                      <p className="mt-1 text-xs text-slate-500">To {swap.upgradeModel || "unspecified"} {swap.upgradeStorage || ""}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold tabular-nums text-slate-950">
                      {money(swap.amountToPay)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(swap.status)}`}>
                        {statusLabel(swap.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/swaps/${swap.id}`}
                        aria-label={`View request ${shortId(swap.id)}`}
                        className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-slate-900"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="border-t border-stone-100 px-5 py-3 text-xs text-slate-500">
            Showing {visible.length} of {swaps.length} requests
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ label, count, loading, highlight }: { label: string; count: number; loading: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight && count > 0 ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-white'}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{loading ? "—" : count}</p>
    </div>
  );
}

export default function SwapsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-7">
          <header className="border-b border-stone-200 pb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operations / Requests</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Customer requests</h1>
          </header>
          <div className="p-8 text-sm text-slate-500">Loading requests…</div>
        </div>
      }
    >
      <SwapsPageContent />
    </Suspense>
  );
}
