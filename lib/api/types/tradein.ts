import { ConditionType, SwapMethod } from "./enums";

export interface CreateTradeInRequest {
  tradeInModelId: string;
  tradeInValue: number;
  conditions: { groupKey: ConditionType; value: string }[];
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
