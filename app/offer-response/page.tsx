"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck, Clock } from "lucide-react";

interface OfferDetails {
  offer: {
    id: string;
    status: string;
    tradeInValue: number;
    upgradePrice: number;
    amountToPay: number;
    reason?: string | null;
    expiresAt?: string | null;
    isExpired: boolean;
  };
  swap: {
    id: string;
    status: string;
    tradeInPhone: string;
    originalTradeInValue: number;
    upgradePhone: string;
    category: string;
    contactName?: string | null;
  };
}

function OfferResponseContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialAction = searchParams.get("action");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OfferDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<"accept" | "reject" | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No offer token provided. Please use the link sent to your email.");
      setLoading(false);
      return;
    }

    fetch(`/api/offer-response?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Unable to find this offer");
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load offer");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDecision = async (action: "accept" | "reject") => {
    if (!token || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/offer-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit your response");
      }
      setSubmittedAction(action);
      setResultMessage(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (num: number) => `₦${Number(num || 0).toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading your offer details…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Offer unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{error || "This offer link is invalid or has expired."}</p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to SWAPPED
          </a>
        </div>
      </div>
    );
  }

  const { offer, swap } = data;

  if (submittedAction) {
    const isAccepted = submittedAction === "accept";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isAccepted ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-slate-700"
          }`}
        >
          {isAccepted ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
        </div>
        <h1 className="text-2xl font-bold text-slate-950">
          {isAccepted ? "Offer Accepted!" : "Offer Declined"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {resultMessage ||
            (isAccepted
              ? "Thank you! We've updated your swap status to Approved and our team is preparing fulfilment."
              : "Your response has been recorded. Our team will contact you to coordinate the return of your device.")}
        </p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-left text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Swap Reference: #{swap.id.slice(-8).toUpperCase()}</p>
          <p>Trading in: {swap.tradeInPhone}</p>
          <p>Upgrading to: {swap.upgradePhone} ({swap.category})</p>
          {isAccepted && <p className="font-medium text-slate-900">Amount to pay: {fmt(offer.amountToPay)}</p>}
        </div>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline"
          >
            Return to Homepage <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  const isPending = offer.status === "PENDING" && !offer.isExpired;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> SWAPPED Device Valuation
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Revised Swap Offer</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hello {swap.contactName || "there"}, our technicians have completed the physical inspection of your device.
        </p>
      </div>

      {offer.reason && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Inspection Note & Reason</p>
          <p className="mt-2 text-sm text-amber-950 font-medium leading-relaxed">{offer.reason}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm mb-6">
        <div className="border-b border-stone-100 bg-stone-50/70 px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Offer comparison</h2>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
            <span className="text-slate-500">Your Trade-In Device</span>
            <span className="font-semibold text-slate-900">{swap.tradeInPhone}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
            <span className="text-slate-500">Original Estimate</span>
            <span className="text-slate-400 line-through tabular-nums">{fmt(swap.originalTradeInValue)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
            <span className="text-slate-700 font-medium">Revised Trade-In Value</span>
            <span className="font-bold text-slate-950 tabular-nums text-base">{fmt(offer.tradeInValue)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
            <span className="text-slate-500">Upgrade Phone</span>
            <span className="font-semibold text-slate-900">{swap.upgradePhone} ({swap.category})</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
            <span className="text-slate-500">Upgrade Price</span>
            <span className="tabular-nums text-slate-900">{fmt(offer.upgradePrice)}</span>
          </div>

          <div className="mt-4 rounded-xl bg-stone-900 p-5 text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-stone-400">Revised amount to pay</p>
              <p className="text-2xl font-bold tracking-tight tabular-nums mt-0.5">{fmt(offer.amountToPay)}</p>
            </div>
            <span className="text-xs text-stone-400">Net top-up balance</span>
          </div>
        </div>
      </div>

      {!isPending ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
          <Clock className="h-6 w-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">
            {offer.isExpired
              ? "This offer link has expired"
              : `This offer is currently ${offer.status.toLowerCase()}`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Please reach out to SWAPPED support at swapped.ng@gmail.com if you need assistance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-center">
            <h3 className="text-base font-semibold text-slate-950">How would you like to proceed?</h3>
            <p className="text-xs text-slate-500 mt-1">
              {initialAction === "accept"
                ? "You selected Accept from your email. Please confirm below to proceed."
                : initialAction === "reject"
                ? "You selected Decline from your email. Please confirm below."
                : "Please choose whether to accept the revised valuation or decline the swap."}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleDecision("accept")}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? "Processing…" : "Accept Revised Offer"}
              </button>

              <button
                onClick={() => handleDecision("reject")}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 disabled:opacity-50 transition"
              >
                <XCircle className="h-4 w-4" />
                {submitting ? "Processing…" : "Decline & Return Device"}
              </button>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              By accepting, you authorize SWAPPED to proceed with the swap at the revised values.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfferResponsePage() {
  return (
    <main className="min-h-screen bg-stone-100/60">
      <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading offer…</div>}>
        <OfferResponseContent />
      </Suspense>
    </main>
  );
}
