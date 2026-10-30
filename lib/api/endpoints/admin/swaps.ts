import { httpClient } from '../../httpClient';
import { SwapMethod } from '../../types/enums';

export interface Swap {
  id: string;
  tradeInModelId: string;
  tradeInModel: {
    id: string;
    label: string;
    model: string;
    storage: string;
    buyingPrice: number;
  };
  tradeInValue: number;
  upgradeCategoryId: string;
  upgradeCategory: {
    id: string;
    key: string;
    label: string;
    description?: string;
  };
  upgradeModel: string;
  upgradeStorage: string;
  upgradePrice: number;
  amountToPay: number;
  swapMethod: SwapMethod;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  conditions?: SwapCondition[];
  appointment?: Appointment;
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
