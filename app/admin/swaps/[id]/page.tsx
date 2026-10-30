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
    key.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/^./, (l) => l.toUpperCase());

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
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Request #{shortId(swap.id)}
            </p>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Submitted {dateTime(swap.createdAt)}</span>
          </div>
          <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-950">
            {contact}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide ${statusBadgeClass(
              swap.status
            )}`}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-80" />
            {statusLabel(swap.status)}
          </span>

          {swap.appointment && (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              Appointment: {day(swap.appointment.date)}
            </span>
          )}
        </div>
      </header>

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

      {/* Lifecycle Action Bar */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Lifecycle Actions</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Move this swap through physical inspection, customer approval, and fulfilment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Revised Offer button is relevant during inspection or customer approval */}
            {(swap.status === SwapStatus.UNDER_INSPECTION ||
              swap.status === SwapStatus.INSPECTION_SCHEDULED ||
              swap.status === SwapStatus.AWAITING_CUSTOMER_APPROVAL) && (
              <button
                type="button"
                onClick={() => {
                  setShowOfferForm(!showOfferForm);
                  setOfferError("");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition"
              >
                <BadgeAlert className="h-3.5 w-3.5" />
                {showOfferForm ? "Cancel Revised Offer" : "Create Revised Offer"}
              </button>
            )}

            {/* Allowed status transition buttons */}
            {allowedTransitions.map((targetStatus) => {
              const isDestructive =
                targetStatus === SwapStatus.CANCELLED || targetStatus === SwapStatus.REJECTED;
              return (
                <button
                  key={targetStatus}
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => {
                    setSelectedNextStatus(targetStatus);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    isDestructive
                      ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <ArrowRight className="h-3 w-3" />
                  Mark as {SWAP_STATUS_LABELS[targetStatus]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Confirmation Modal / Note box */}
        {selectedNextStatus && (
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Confirm Status Transition to: {SWAP_STATUS_LABELS[selectedNextStatus]}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              You can optionally record an internal reason or technician note for this transition.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Reason or note (optional)…"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(selectedNextStatus)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {updatingStatus ? "Saving…" : "Confirm Change"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNextStatus(null);
                    setStatusReason("");
                  }}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revised Offer Form Drawer */}
        {showOfferForm && (
          <form onSubmit={handleCreateOffer} className="mt-5 border-t border-stone-100 pt-5 space-y-4">
            <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
              <strong>Creating a Revised Offer:</strong> This supersedes any previous pending offer and sets
              the swap status to <em>Awaiting Customer Approval</em>. A secure link will be emailed to the
              customer (<strong>{swap.contactEmail || "customer"}</strong>) to review and accept or decline.
            </div>

            {offerError && <p className="text-xs text-rose-600 font-medium">{offerError}</p>}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Revised Trade-In Value (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={revisedTradeInValue}
                  onChange={(e) => setRevisedTradeInValue(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Original: {money(swap.tradeInValue)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Upgrade Phone Price (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={revisedUpgradePrice}
                  onChange={(e) => setRevisedUpgradePrice(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-slate-400">
                  Model: {swap.upgradeModel} ({swap.upgradeStorage})
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Calculated Amount To Pay
                </label>
                <div className="flex h-[38px] items-center rounded-lg bg-stone-100 px-3 text-sm font-bold text-slate-900 tabular-nums">
                  {money(calculatedOfferAmountToPay)}
                </div>
                <span className="mt-1 block text-[11px] text-slate-400">
                  Upgrade Price − Revised Valuation
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Reason for Adjustment (Shown to customer in email & offer portal)
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Physical battery health is at 74% and screen has noticeable deep scratches."
                value={offerReason}
                onChange={(e) => setOfferReason(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOfferForm(false)}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOffer}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {submittingOffer ? "Submitting & Sending Email…" : "Send Revised Offer to Customer"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Main Grid: Left Column Details & Offers, Right Column Breakdown & Contacts */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          {/* Swap Overview */}
          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
              <h2 className="text-base font-semibold text-slate-950">Swap overview</h2>
              <p className="mt-1 text-xs text-slate-500">The devices the customer selected</p>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Trading in</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {swap.tradeInModel?.model || "Not specified"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {swap.tradeInModel?.storage || "Storage not specified"}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Snapshot buying price: {money(swap.snapshotBuyingPrice || swap.tradeInValue)}
                </p>
              </div>
              <div className="rounded-xl bg-stone-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Upgrading to</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {swap.upgradeModel || "Not specified"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {swap.upgradeStorage || "Storage not specified"} · {swap.upgradeCategory?.label}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Selling catalog price: {money(swap.upgradePrice)}
                </p>
              </div>
            </div>
          </section>

          {/* Customer Assessment Answers */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-950">Customer assessment</h2>
            <p className="mt-1 text-xs text-slate-500">Answers provided during the trade-in questionnaire</p>
            {swap.conditions?.length ? (
              <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {swap.conditions.map(({ groupKey, value }) => (
                  <div key={groupKey} className="border-t border-stone-100 pt-3">
                    <dt className="text-xs text-slate-500">{answerLabel(groupKey)}</dt>
                    <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
                      {String(value).replace(/[-_]/g, " ")}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-5 text-sm text-slate-500">No condition answers were saved with this request.</p>
            )}
          </section>

          {/* Offers History Table */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" /> Offers History
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Immutable record of original estimate and revised valuation proposals
                </p>
              </div>
            </div>

            {swap.offers && swap.offers.length > 0 ? (
              <div className="mt-4 divide-y divide-stone-100">
                {swap.offers.map((offer) => (
                  <div key={offer.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${offerStatusBadge(
                            offer.status
                          )}`}
                        >
                          {offer.status}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{dateTime(offer.createdAt)}</span>
                      </div>

                      {offer.status === SwapOfferStatus.PENDING && (
                        <button
                          type="button"
                          disabled={resendingOfferId === offer.id}
                          onClick={() => handleResendEmail(offer.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-stone-50 transition"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${resendingOfferId === offer.id ? "animate-spin" : ""}`}
                          />
                          {resendingOfferId === offer.id ? "Sending…" : "Resend Email"}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-stone-50 p-3 text-xs">
                      <div>
                        <span className="text-slate-500">Trade-In Value:</span>
                        <p className="font-semibold text-slate-900 tabular-nums">
                          {money(offer.tradeInValue)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Upgrade Price:</span>
                        <p className="font-semibold text-slate-900 tabular-nums">
                          {money(offer.upgradePrice)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Amount To Pay:</span>
                        <p className="font-bold text-slate-950 tabular-nums">{money(offer.amountToPay)}</p>
                      </div>
                    </div>

                    {offer.reason && (
                      <p className="text-xs text-slate-600 bg-amber-50/50 rounded-lg p-2.5 border border-amber-100">
                        <strong className="text-amber-800">Adjustment Note:</strong> {offer.reason}
                      </p>
                    )}

                    <div className="flex gap-4 text-[11px] text-slate-400">
                      {offer.sentAt && <span>Email sent: {dateTime(offer.sentAt)}</span>}
                      {offer.respondedAt && <span>Customer responded: {dateTime(offer.respondedAt)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">No offer records available.</p>
            )}
          </section>

          {/* Append-Only Audit Trail */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
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
          </section>
        </div>

        {/* Right Column: Quotes, Contact, Appointment */}
        <div className="space-y-6">
          {/* Quote Breakdown */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Financial breakdown</h2>
            <p className="mt-1 text-xs text-slate-500">Current active values vs. original estimate</p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Upgrade device price</dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  {money(swap.currentUpgradePrice ?? swap.upgradePrice)}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">
                  Trade-in valuation
                  {swap.currentTradeInValue !== undefined &&
                    swap.currentTradeInValue !== swap.tradeInValue && (
                      <span className="ml-1 text-[11px] text-amber-700">(Revised)</span>
                    )}
                </dt>
                <dd className="font-medium tabular-nums text-slate-900">
                  − {money(swap.currentTradeInValue ?? swap.tradeInValue)}
                </dd>
              </div>

              {swap.currentTradeInValue !== undefined &&
                swap.currentTradeInValue !== swap.tradeInValue && (
                  <div className="flex justify-between gap-3 text-xs text-slate-400">
                    <dt>Original estimate</dt>
                    <dd className="line-through tabular-nums">{money(swap.tradeInValue)}</dd>
                  </div>
                )}

              <div className="flex justify-between gap-3 border-t border-stone-200 pt-4">
                <dt className="font-semibold text-slate-950">Current amount to pay</dt>
                <dd className="text-lg font-bold tabular-nums text-slate-950">
                  {money(swap.amountToPay)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-slate-500 capitalize">
              Method: {String(swap.swapMethod).replace(/_/g, " ").toLowerCase()}
            </p>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">Customer contact</h2>
            <div className="mt-4 space-y-3 text-sm">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 break-all text-slate-700 hover:text-slate-950"
                >
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  {email}
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-slate-400" />
                </a>
              ) : (
                <p className="text-slate-500">No email provided</p>
              )}
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 text-slate-700 hover:text-slate-950"
                >
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  {phone}
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-slate-400" />
                </a>
              ) : (
                <p className="text-slate-500">No phone provided</p>
              )}
            </div>
          </section>

          {/* Appointment Section */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-950">Appointment</h2>
            </div>
            {swap.appointment ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-950">
                  {day(swap.appointment.date)} at {swap.appointment.time}
                </p>
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {swap.appointment.swapMethod.replace(/[-_]/g, " ")}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                The customer has not booked an appointment yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
