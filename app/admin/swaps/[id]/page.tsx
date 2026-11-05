"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Mail,
  Phone,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  History,
  FileText,
  BadgeAlert,
  ArrowRight
} from "lucide-react";
import {
  AdminSwap,
  AdminSwapOffer,
  AdminAuditEntry,
  dateTime,
  day,
  money,
  requestEmail,
  requestPhone,
  shortId,
  statusBadgeClass,
  statusLabel
} from "../../adminData";
import {
  getSwap,
  updateSwapStatus,
  createSwapOffer,
  retryOfferEmail
} from "@/lib/api/endpoints/admin/swaps";
import {
  SwapStatus,
  SwapOfferStatus,
  VALID_STATUS_TRANSITIONS,
  SWAP_STATUS_LABELS
} from "@/lib/api/types/enums";

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [swap, setSwap] = useState<AdminSwap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status transition state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [selectedNextStatus, setSelectedNextStatus] = useState<SwapStatus | null>(null);

  // Revised offer form state
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [revisedTradeInValue, setRevisedTradeInValue] = useState<string>("");
  const [revisedUpgradePrice, setRevisedUpgradePrice] = useState<string>("");
  const [offerReason, setOfferReason] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");

  // Resend email state
  const [resendingOfferId, setResendingOfferId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSwap = () => {
    if (!id) return;
    getSwap(id)
      .then((data) => {
        const adminSwap = data as unknown as AdminSwap;
        setSwap(adminSwap);
        setRevisedTradeInValue(String(adminSwap.currentTradeInValue ?? adminSwap.tradeInValue));
        setRevisedUpgradePrice(String(adminSwap.currentUpgradePrice ?? adminSwap.upgradePrice));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load this request"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSwap();
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading swap details…</div>;
  if (error || !swap) {
    return (
      <div className="space-y-4 p-4">
        <Link href="/admin/swaps" className="text-sm font-medium text-slate-600 hover:text-slate-950">
          ← Back to requests
        </Link>
        <p className="text-sm text-rose-700">{error || "Request not found"}</p>
      </div>
    );
  }

  const email = requestEmail(swap);
  const phone = requestPhone(swap);
  const contact = swap.contactName || email || phone || "Customer";

  const answerLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (l) => l.toLowerCase());

  // Allowed transitions
  const allowedTransitions = VALID_STATUS_TRANSITIONS[swap.status] || [];

  const handleStatusChange = async (nextStatus: SwapStatus) => {
    setUpdatingStatus(true);
    setActionSuccess(null);
    try {
      await updateSwapStatus(swap.id, nextStatus, statusReason.trim() || undefined);
      setStatusReason("");
      setSelectedNextStatus(null);
      setActionSuccess(`Status transitioned to ${SWAP_STATUS_LABELS[nextStatus]}`);
      fetchSwap();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const calculatedOfferAmountToPay =
    Math.max(0, (Number(revisedUpgradePrice) || 0) - (Number(revisedTradeInValue) || 0));

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError("");
    const tv = Number(revisedTradeInValue);
    const up = Number(revisedUpgradePrice);

    if (isNaN(tv) || tv < 0) {
      setOfferError("Please enter a valid non-negative trade-in valuation.");
      return;
    }
    if (isNaN(up) || up < 0) {
      setOfferError("Please enter a valid non-negative upgrade price.");
      return;
    }
    if (!offerReason.trim()) {
      setOfferError("Please provide an inspection reason for this valuation change.");
      return;
    }

    setSubmittingOffer(true);
    try {
      await createSwapOffer(swap.id, {
        tradeInValue: tv,
        upgradePrice: up,
        amountToPay: calculatedOfferAmountToPay,
        reason: offerReason.trim(),
      });
      setShowOfferForm(false);
      setOfferReason("");
      setActionSuccess("Revised offer sent to customer successfully.");
      fetchSwap();
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : "Failed to create revised offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleResendEmail = async (offerId: string) => {
    setResendingOfferId(offerId);
    setActionSuccess(null);
    try {
      await retryOfferEmail(swap.id, offerId);
      setActionSuccess("Revised offer email resent to customer.");
      fetchSwap();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resend email");
    } finally {
      setResendingOfferId(null);
    }
  };

  const offerStatusBadge = (st: SwapOfferStatus) => {
    switch (st) {
      case SwapOfferStatus.ORIGINAL:
        return "bg-stone-100 text-stone-700 border border-stone-200";
      case SwapOfferStatus.PENDING:
        return "bg-amber-50 text-amber-800 border border-amber-200";
      case SwapOfferStatus.ACCEPTED:
        return "bg-emerald-50 text-emerald-800 border border-emerald-200";
      case SwapOfferStatus.REJECTED:
        return "bg-rose-50 text-rose-800 border border-rose-200";
      case SwapOfferStatus.SUPERSEDED:
        return "bg-gray-100 text-gray-500 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-7 pb-12">
      <Link
        href="/admin/swaps"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" /> Customer requests
      </Link>

      {/* Header with Title and Current Status */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      
      </header>
         <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-6 py-4 sm:px-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Swap overview</h2>
                <p className="mt-0.5 text-sm text-slate-500">The devices the customer selected</p>
              </div>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const action = e.target.value;
                      if (action === "offer") {
                        setShowOfferForm(!showOfferForm);
                        setOfferError("");
                      } else {
                        setSelectedNextStatus(action as SwapStatus);
                      }
                      e.target.value = "";
                    }
                  }}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 focus:border-slate-500 focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Actions
                  </option>
                  {(swap.status === SwapStatus.UNDER_INSPECTION ||
                    swap.status === SwapStatus.INSPECTION_SCHEDULED ||
                    swap.status === SwapStatus.AWAITING_CUSTOMER_APPROVAL) && (
                    <option value="offer">Create Revised Offer</option>
                  )}
                  {allowedTransitions.map((targetStatus) => (
                    <option key={targetStatus} value={targetStatus}>
                      Mark as {SWAP_STATUS_LABELS[targetStatus]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className=" px-6 pt-6 sm:px-6 ">
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-slate-500 ">Submitted:</span>
                  <span className="ml-1.5 font-medium text-slate-900">{dateTime(swap.createdAt)}</span>
                </div>
                {email && (
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <a href={`mailto:${email}`} className="ml-1.5 font-medium text-slate-900 hover:text-slate-700">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <a href={`tel:${phone}`} className="ml-1.5 font-medium text-slate-900 hover:text-slate-700">
                      {phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Method:</span>
                  <span className="ml-1.5 font-medium text-slate-900 capitalize">
                    {String(swap.swapMethod).replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
                {swap.appointment && (
                  <div>
                    <span className="text-slate-500">Appointment:</span>
                    <span className="ml-1.5 font-medium text-slate-900">
                      {day(swap.appointment.date)} at {swap.appointment.time}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Amount to pay:</span>
                  <span className="ml-1.5 font-semibold text-slate-900">{money(swap.amountToPay)}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Trading in</p>
                <p className="mt-3 text-lg font-semibold flex items-center gap-2 text-slate-950">
                  {swap.tradeInModel?.model || "Not specified"}
                    <span className="mt-0.5 text-sm font-normal text-slate-500">
                  {swap.tradeInModel?.storage || "Storage not specified"}
                </span>
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Estimated buying price: <strong className="text-slate-900"> {money(swap.snapshotBuyingPrice || swap.tradeInValue)} </strong>
                </p>
                {swap.conditions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-200/60">
                    <p className="text-xs font-medium text-slate-500 mb-3">Customer assessment</p>
                    <div className="grid grid-cols-3 gap-3">
                      {swap.conditions.map(({ groupKey, value }) => (
                        <div key={groupKey}>
                          <dt className="text-xs text-slate-500 font-medium">{answerLabel(groupKey)}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-slate-900">
                            {String(value).replace(/[-_]/g, " ")}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Upgrading to</p>
                  <p className="mt-3 text-lg font-semibold flex items-center gap-2 text-slate-950">
                  {swap.upgradeModel || "Not specified"}
                    <span className="mt-0.5 text-sm font-normal text-slate-500">
                  {swap.upgradeStorage || "Storage not specified"} · {swap.upgradeCategory?.label}
                </span>
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Selling catalog price: <strong className="text-slate-900"> {money(swap.upgradePrice)} </strong>
                </p>
              </div>
            </div>
          </section>

      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Column Details & Offers, Right Column Breakdown & Contacts */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <div className="space-y-6">

          {/* Append-Only Audit Trail */}
          {/* <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-500" /> Audit Log & Activity
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Append-only immutable record of all lifecycle events
                </p>
              </div>
            </div>

            {swap.auditLogs && swap.auditLogs.length > 0 ? (
              <div className="mt-5 space-y-4 border-l border-stone-200 pl-5">
                {swap.auditLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-slate-900 ring-4 ring-white" />
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <span className="text-[11px] text-slate-400">{dateTime(log.createdAt)}</span>
                    </div>

                    {log.field && (
                      <p className="mt-0.5 text-xs text-slate-600">
                        Field <code className="bg-stone-100 px-1 py-0.5 rounded">{log.field}</code>:{" "}
                        {log.oldValue && <span className="line-through text-slate-400">{log.oldValue} → </span>}
                        <span className="font-semibold text-slate-900">{log.newValue}</span>
                      </p>
                    )}

                    {log.reason && (
                      <p className="mt-1 text-xs text-slate-600 italic">
                        Note: &ldquo;{log.reason}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">No audit log entries recorded yet.</p>
            )}
          </section> */}
        </div>

     
      </div>
    </div>
  );
}
