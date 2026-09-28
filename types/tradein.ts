export interface ConditionOption {
  value: string;
  label: string;
  description?: string;
  priceModifier: number;
}

export interface ConditionGroup {
  key: string;
  label: string;
  description?: string;
  options: ConditionOption[];
}

export interface PhoneModel {
  value: string;
  label: string;
  model: string;
  storage: string;
  basePrice: number;
}

export interface SaleCategory {
  id: string;
  label: string;
  description?: string;
  prices: PhoneSellingPrice[];
}

export interface PhoneSellingPrice {
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
