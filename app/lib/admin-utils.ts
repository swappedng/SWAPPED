import { prisma } from './prisma';

export async function getPhoneModels() {
  try {
    const models = await prisma.phoneModel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return models.map(model => ({
      id: model.id,
      label: model.label,
      buyingPrice: model.buyingPrice,
    }));
  } catch (error) {
    console.error('Failed to fetch phone models:', error);
    return [];
  }
}

// New: Fetch multi-factor condition attribute groups with options
export async function getConditionAttributeGroups() {
  try {
    const groups = await prisma.conditionAttributeGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    return groups.map(g => ({
      key: g.key,
      label: g.label,
      description: g.description ?? undefined,
      options: g.options.map(o => ({
        label: o.label,
        priceModifier: o.priceModifier,
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch condition attribute groups:', error);
    return [];
  }
}

export function calculateMultiFactorPrice(
  buyingPrice: number,
  attributeModifiers: number[] = []
): number {
  const combinedModifier = attributeModifiers.reduce((acc, m) => acc * (m ?? 1), 1);
  const finalPrice = buyingPrice * combinedModifier;
  return Math.round(finalPrice * 100) / 100;
}
