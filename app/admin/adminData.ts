export type AdminSwap = {
  id: string;
  tradeInModelId: string;
  tradeInModel: { model: string; storage: string; label: string };
  tradeInValue: number;
  upgradeCategoryId: string;
  upgradeCategory: { label: string };
  upgradeModel: string;
  upgradeStorage: string;
  upgradePrice: number;
  amountToPay: number;
  swapMethod: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  conditions: { groupKey: string; value: string }[];
  appointment?: {
    id: string;
    appointmentType: string;
    date: string;
    time: string;
    createdAt: string;
  } | null;
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
