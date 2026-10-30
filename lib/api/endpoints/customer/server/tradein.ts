import 'server-only';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { ConditionType, SwapMethod } from '@/lib/api/types/enums';
import type { ConditionGroup, PhoneModel, SaleCategory } from '@/types/tradein';

export const QUESTIONNAIRE_TAG = 'questionnaire';
export const QUESTIONNAIRE_REVALIDATE_SECONDS = 86_400;

async function queryTradeInCatalogue(): Promise<{ conditionGroups: ConditionGroup[]; phoneModels: PhoneModel[]; saleCategories: SaleCategory[] }> {
  const [groups, phoneModels, saleCategories] = await Promise.all([
    prisma.conditionAttributeGroup.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { options: { where: { isActive: true }, orderBy: { order: 'asc' } } } }),
    prisma.phoneModel.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.phoneSaleCategory.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { prices: { where: { isActive: true }, include: { phoneModel: true } } } }),
  ]);

  return {
    conditionGroups: groups.map((group) => ({
      key: group.key as ConditionType,
      label: group.label,
      description: group.description ?? undefined,
      options: group.options.map((option) => ({
        label: option.label,
        description: option.description ?? undefined,
        imagePath: option.imagePath ?? undefined,
        priceModifier: option.priceModifier,
      }))
    })),
    phoneModels: phoneModels.map((phoneModel) => ({ ...phoneModel })),
    saleCategories: saleCategories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description ?? undefined,
      imagePath: category.imagePath ?? undefined,
      prices: category.prices
        .filter((price) => price.phoneModel.isActive)
        .map((price) => ({ phoneModelId: price.phoneModelId, model: price.phoneModel.model, storage: price.phoneModel.storage, price: price.price })),
    })),
  };
}

export const getCachedTradeInCatalogue = unstable_cache(queryTradeInCatalogue, ['tradein-questionnaire'], {
  revalidate: QUESTIONNAIRE_REVALIDATE_SECONDS,
  tags: [QUESTIONNAIRE_TAG],
});

export async function getTradeInConfirmation(swapId: string) {
  const swap = await prisma.swap.findUnique({
    where: { id: swapId },
    select: {
      id: true,
      tradeInValue: true,
      upgradePrice: true,
      amountToPay: true,
      contactEmail: true,
      appointment: {
        select: {
          swapMethod: true,
          date: true,
          time: true,
        },
      },
    },
  });

  if (!swap) return null;

  return {
    ...swap,
    appointment: swap.appointment && {
      ...swap.appointment,
      swapMethod: swap.appointment.swapMethod as SwapMethod,
    },
  };
}
