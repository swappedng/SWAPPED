import { httpClient } from '../../httpClient';
import { SwapMethod, SwapStatus, SwapOfferStatus, SWAP_STATUS_LABELS } from '../../types/enums';
import type { CreateSwapOfferRequest, SwapOffer, SwapAuditLogEntry } from '../../types/tradein';

export type { SwapOffer, SwapAuditLogEntry };
export { SwapStatus, SwapOfferStatus, SWAP_STATUS_LABELS };

export interface Swap {
  id: string;
  status: SwapStatus;
  tradeInModelId: string;
  tradeInModel: {
    id: string;
    label: string;
    model: string;
    storage: string;
    buyingPrice: number;
  };
  /** Buying price snapshot from PhoneModel at time of submission (immutable) */
  snapshotBuyingPrice: number;
  /** Original trade-in value calculated at submission (immutable) */
  tradeInValue: number;
  phoneSellingPriceId: string;
  phoneSellingPrice?: {
    id: string;
    price: number;
    isActive: boolean;
    phoneModelId: string;
    categoryId: string;
  };
  upgradeCategoryId: string;
  upgradeCategory: {
    id: string;
    key: string;
    label: string;
    description?: string;
  };
  /** Upgrade device model snapshot (immutable) */
  upgradeModel: string;
  /** Upgrade device storage snapshot (immutable) */
  upgradeStorage: string;
  /** Upgrade price snapshot at time of submission (immutable) */
  upgradePrice: number;
  /** Current trade-in value (may differ from tradeInValue after a revised offer) */
  currentTradeInValue: number;
  /** Current upgrade price (may differ from upgradePrice after a revised offer) */
  currentUpgradePrice: number;
  /** Current amount the customer owes */
  amountToPay: number;
  swapMethod: SwapMethod;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
  conditions?: SwapCondition[];
  appointment?: Appointment;
  offers?: SwapOffer[];
  auditLogs?: SwapAuditLogEntry[];
}

export interface SwapCondition {
  id: string;
  swapId: string;
  groupKey: string;
  value: string;
}

export interface Appointment {
  id: string;
  swapId: string;
  swapMethod: SwapMethod;
  date: string;
  time: string;
  createdAt: string;
}

export async function getSwaps(swapId?: string) {
  const query = swapId ? `?swapId=${swapId}` : '';
  return httpClient.get<Swap[]>(`/api/swaps${query}`);
}

export async function getSwap(id: string) {
  return httpClient.get<Swap>(`/api/swaps/${id}`);
}

export async function updateSwapStatus(id: string, status: SwapStatus, reason?: string) {
  return httpClient.patch<Swap, { status: SwapStatus; reason?: string }>(
    `/api/swaps/${id}`,
    { status, ...(reason ? { reason } : {}) }
  );
}

export async function createSwapOffer(swapId: string, payload: CreateSwapOfferRequest) {
  return httpClient.post<SwapOffer, CreateSwapOfferRequest>(
    `/api/swaps/${swapId}/offers`,
    payload
  );
}

export async function retryOfferEmail(swapId: string, offerId: string) {
  return httpClient.post<{ ok: boolean }, Record<string, never>>(
    `/api/swaps/${swapId}/offers/${offerId}/resend`,
    {}
  );
}

