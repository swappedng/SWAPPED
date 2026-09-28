import { unstable_cache } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import type { ConditionGroup, PhoneModel, SaleCategory } from '@/types/tradein';

export const QUESTIONNAIRE_TAG = 'questionnaire';
export const QUESTIONNAIRE_REVALIDATE_SECONDS = 86_400;

async function queryTradeInCatalogue(): Promise<{ conditionGroups: ConditionGroup[]; phoneModels: PhoneModel[]; saleCategories: SaleCategory[] }> {
  const [groups, phoneModels, saleCategories] = await Promise.all([
    prisma.conditionAttributeGroup.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { options: { where: { isActive: true }, orderBy: { order: 'asc' } } } }),
    prisma.phoneModel.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.phoneSaleCategory.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { prices: { where: { isActive: true }, orderBy: [{ model: 'asc' }, { storage: 'asc' }] } } }),
  ]);

  return {
    conditionGroups: groups.map((group) => ({ key: group.key, label: group.label, description: group.description ?? undefined, options: group.options.map((option) => ({ value: option.value, label: option.label, description: option.description ?? undefined, priceModifier: option.priceModifier })) })),
    phoneModels,
    saleCategories: saleCategories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description ?? undefined,
      prices: category.prices.map((price) => ({ model: price.model, storage: price.storage, price: price.price })),
    })),
  };
}

export const getCachedTradeInCatalogue = unstable_cache(queryTradeInCatalogue, ['tradein-questionnaire'], {
  revalidate: QUESTIONNAIRE_REVALIDATE_SECONDS,
  tags: [QUESTIONNAIRE_TAG],
});
