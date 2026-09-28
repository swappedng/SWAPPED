import { httpClient } from '../httpClient';
import type { ConditionGroup, PhoneModel, SaleCategory, TradeInDetails, UpgradeSelection } from '@/types/tradein';

export interface CreateTradeInRequest {
  tradeInPhone: TradeInDetails;
  newPhone: UpgradeSelection;
  contactEmail: string;
  contactPhone: string;
  swapMethod: string;
  tradeInValue: number;
  newPhonePrice: number;
  amountToPay: number;
}

export interface CreatedTradeInRequest { id: string; }

export async function getTradeInCatalogue() {
  const [conditionGroups, phoneModels, saleCategories] = await Promise.all([
    httpClient.get<ConditionGroup[]>('/api/admin/condition-attributes/groups'),
    httpClient.get<PhoneModel[]>('/api/admin/phone-models'),
    httpClient.get<SaleCategory[]>('/api/admin/sales-catalog'),
  ]);
  return { conditionGroups, phoneModels, saleCategories };
}

export function createTradeInRequest(payload: CreateTradeInRequest) {
  return httpClient.post<CreatedTradeInRequest, CreateTradeInRequest>('/api/swaps', payload);
}
