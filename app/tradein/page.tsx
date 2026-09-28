import { TradeInFlow } from '@/components/tradein/TradeInFlow';
import { getCachedTradeInCatalogue } from '@/lib/api/endpoints/tradein.server';

export const revalidate = 86_400;

export default async function TradeInPage() {
  const catalogue = await getCachedTradeInCatalogue();
  return <TradeInFlow catalogue={catalogue} />;
}
