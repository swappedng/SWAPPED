import { ConditionType, SwapMethod, SwapOfferStatus } from "./enums";

export interface CreateTradeInRequest {
  tradeInModelId: string;
  /** Calculated trade-in value sent from the client */
  tradeInValue: number;
  /** Snapshot buying price from the phone model at time of submission */
  snapshotBuyingPrice?: number;
  conditions: { groupKey: ConditionType; value: string }[];
  /** The PhoneSellingPrice record the customer selected */
  phoneSellingPriceId?: string;
  upgradeCategoryId: string;
  upgradeModel: string;
  upgradeStorage: string;
  upgradePrice: number;
  amountToPay: number;
  swapMethod: SwapMethod;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreatedTradeInRequest { id: string; }

export interface CreateTradeInAppointmentRequest {
  swapId: string;
  swapMethod: SwapMethod;
  date: string;
  time: string;
}

export interface TradeInAppointment {
  id: string;
  swapId: string;
  swapMethod: SwapMethod;
  date: string;
  time: string;
  createdAt: string;
}

// ─── Swap Offer ───────────────────────────────────────────────────────────────

export interface SwapOffer {
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
}

export interface CreateSwapOfferRequest {
  tradeInValue: number;
  upgradePrice: number;
  amountToPay: number;
  reason: string;
}

// ─── Swap Audit Log ───────────────────────────────────────────────────────────

export interface SwapAuditLogEntry {
  id: string;
  swapId: string;
  adminId?: string | null;
  action: string;
  field?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  createdAt: string;
}

