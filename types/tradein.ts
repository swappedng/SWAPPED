import { ConditionType, SwapMethod } from '@/lib/api/types/enums';

export interface ConditionOption {
  label: string;
  description?: string;
  priceModifier: number;
  imagePath?: string;
}

export interface ConditionGroup {
  key: ConditionType;
  label: string;
  description?: string;
  options: ConditionOption[];
}

export interface PhoneModel {
  id: string;
  label: string;
  model: string;
  storage: string;
  buyingPrice: number;
}

export interface SaleCategory {
  id: string;
  label: string;
  description?: string;
  imagePath?: string;
  prices: PhoneSellingPrice[];
}

export interface PhoneSellingPrice {
  id: string;
  phoneModelId: string;
  model: string;
  storage: string;
  price: number;
}

export interface TradeInDetails {
  model: string;
  storage: string;
  battery: string;
  batteryReplaced: 'yes' | 'no' | '';
  faceid: string;
  backglass: string;
  screen: string;
  screenReplaced: 'yes' | 'no' | '';
  body: string;
  sim: string;
}

export interface UpgradeSelection {
  category: string;
  model: string;
  storage: string;
}

export const emptyTradeInDetails: TradeInDetails = {
  model: '', storage: '', battery: '', batteryReplaced: '', faceid: '', backglass: '', screen: '', screenReplaced: '', body: '', sim: 'physical',
};

// Re-export enums for convenience
export { ConditionType, SwapMethod };
