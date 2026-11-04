import 'server-only';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { ConditionType, SwapMethod } from '@/lib/api/types/enums';
import type { ConditionGroup, PhoneModel, SaleCategory } from '@/types/tradein';

export const QUESTIONNAIRE_TAG = 'questionnaire';
export const QUESTIONNAIRE_REVALIDATE_SECONDS = 86_400;

const CONDITION_KEY_MAP: Record<string, ConditionType> = {
  BATTERY: ConditionType.BATTERY,
  SCREEN: ConditionType.SCREEN,
  SIM: ConditionType.SIM,
  FACE_ID: ConditionType.FACE_ID,
  BACK_GLASS: ConditionType.BACK_GLASS,
  BODY: ConditionType.BODY,
  battery: ConditionType.BATTERY,
  screen: ConditionType.SCREEN,
  sim: ConditionType.SIM,
  faceid: ConditionType.FACE_ID,
  backglass: ConditionType.BACK_GLASS,
  body: ConditionType.BODY,
};

async function queryTradeInCatalogue(): Promise<{
  conditionGroups: ConditionGroup[];
  phoneModels: PhoneModel[];
  saleCategories: SaleCategory[];
  modelModifiers?: Record<string, Record<string, { priceModifier: number; modifierType: string }>>;
}> {
  const [groups, phoneModels, saleCategories, modelOverrides] = await Promise.all([
    prisma.conditionAttributeGroup.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { options: { where: { isActive: true }, orderBy: { order: 'asc' } } } }),
    prisma.phoneModel.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.phoneSaleCategory.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, include: { prices: { where: { isActive: true }, include: { phoneModel: true } } } }),
    prisma.modelConditionModifier.findMany({
      include: {
        option: {
          select: { label: true },
        },
      },
    }),
  ]);

  const modelModifiers: Record<string, Record<string, { priceModifier: number; modifierType: string }>> = {};
  for (const item of modelOverrides) {
    if (!item.option?.label) continue;
    if (!modelModifiers[item.model]) {
      modelModifiers[item.model] = {};
    }
    modelModifiers[item.model][item.option.label] = {
      priceModifier: item.priceModifier,
      modifierType: item.modifierType,
    };
  }

  return {
    conditionGroups: groups.map((group) => ({
      key: (CONDITION_KEY_MAP[group.key] || group.key.toLowerCase().replace(/_/g, '')) as ConditionType,
      label: group.label,
      description: group.description ?? undefined,
      options: group.options.map((option) => ({
        label: option.label,
        description: option.description ?? undefined,
        imagePath: option.imagePath ?? undefined,
      }))
    })),
    modelModifiers,
    phoneModels: phoneModels.map((phoneModel) => ({
      ...phoneModel,
      buyingPrice: Number(phoneModel.buyingPrice),
    })),
    saleCategories: saleCategories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description ?? undefined,
      imagePath: category.imagePath ?? undefined,
      prices: category.prices
        .filter((price) => price.phoneModel.isActive)
        .map((price) => ({
          id: price.id,
          phoneModelId: price.phoneModelId,
          model: price.phoneModel.model,
          storage: price.phoneModel.storage,
          price: Number(price.price),
        })),
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
    tradeInValue: Number(swap.tradeInValue),
    upgradePrice: Number(swap.upgradePrice),
    amountToPay: Number(swap.amountToPay),
    appointment: swap.appointment && {
      ...swap.appointment,
      swapMethod: swap.appointment.swapMethod as SwapMethod,
    },
  };
}
