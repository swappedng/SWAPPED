import { SwapStatus, SwapOfferStatus, SWAP_STATUS_LABELS } from '@/lib/api/types/enums';

export type AdminSwapOffer = {
  id: string;
  swapId: string;
  tradeInValue: number;
  upgradePrice: number;
  amountToPay: number;
  reason?: string | null;
  status: SwapOfferStatus;
  sentAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

export type AdminAuditEntry = {
  id: string;
  swapId: string;
  adminId?: string | null;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  createdAt: string;
};

export type AdminSwap = {
  id: string;
  status: SwapStatus;
  tradeInModelId: string;
  tradeInModel: { model: string; storage: string; label: string };
  /** Buying price snapshot at submission (immutable) */
  snapshotBuyingPrice: number;
  /** Original trade-in value at submission (immutable) */
  tradeInValue: number;
  phoneSellingPriceId: string;
  upgradeCategoryId: string;
  upgradeCategory: { label: string };
  /** Upgrade device snapshot (immutable) */
  upgradeModel: string;
  upgradeStorage: string;
  /** Upgrade price snapshot (immutable) */
  upgradePrice: number;
  /** Current trade-in value (may differ after revised offer) */
  currentTradeInValue: number;
  /** Current upgrade price (may differ after revised offer) */
  currentUpgradePrice: number;
  amountToPay: number;
  swapMethod: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
  conditions: { groupKey: string; value: string }[];
  appointment?: {
    id: string;
    swapMethod: string;
    date: string;
    time: string;
    createdAt: string;
  } | null;
  offers?: AdminSwapOffer[];
  auditLogs?: AdminAuditEntry[];
};

export const money = (value: number) => `₦${Number(value || 0).toLocaleString()}`;
export const requestContact = (swap: AdminSwap) =>
  swap.contactName || swap.contactEmail || swap.contactPhone || 'Contact not provided';
export const requestEmail = (swap: AdminSwap) => swap.contactEmail || '';
export const requestPhone = (swap: AdminSwap) => swap.contactPhone || '';
export const shortId = (id: string) => id.slice(-8).toUpperCase();
export const day = (date: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
export const dateTime = (date: string) =>
  new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));

export const statusLabel = (status: SwapStatus) => SWAP_STATUS_LABELS[status] ?? status;

/** Returns a Tailwind-compatible CSS classes pair for badge display */
export const statusBadgeClass = (status: SwapStatus): string => {
  switch (status) {
    case SwapStatus.SUBMITTED:              return 'bg-blue-50 text-blue-700 border border-blue-200';
    case SwapStatus.INSPECTION_SCHEDULED:   return 'bg-violet-50 text-violet-700 border border-violet-200';
    case SwapStatus.UNDER_INSPECTION:       return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    case SwapStatus.AWAITING_CUSTOMER_APPROVAL: return 'bg-amber-50 text-amber-800 border border-amber-200';
    case SwapStatus.APPROVED:               return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case SwapStatus.REJECTED:               return 'bg-rose-50 text-rose-700 border border-rose-200';
    case SwapStatus.FULFILMENT_IN_PROGRESS: return 'bg-sky-50 text-sky-700 border border-sky-200';
    case SwapStatus.COMPLETED:              return 'bg-stone-100 text-slate-700';
    case SwapStatus.CANCELLED:              return 'bg-gray-100 text-gray-500';
    default:                                return 'bg-gray-100 text-gray-600';
  }
};

