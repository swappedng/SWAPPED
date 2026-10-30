import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { PriceModifierType } from '@/app/generated/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Resolve base model name either by PhoneModel ID or directly from model name
    let phoneModel = await prisma.phoneModel.findUnique({ where: { id } });
    const baseModel = phoneModel ? phoneModel.model : decodeURIComponent(id);

    // Fetch all active groups with options
    const [groups, overrides, variants] = await Promise.all([
      prisma.conditionAttributeGroup.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          options: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.modelConditionModifier.findMany({
        where: { model: baseModel },
      }),
      prisma.phoneModel.findMany({
        where: { model: baseModel },
        orderBy: { order: 'asc' },
      }),
    ]);

    const overrideMap = new Map(overrides.map((o) => [o.optionId, o]));

    const checklistGroups = groups.map((group) => ({
      id: group.id,
      key: group.key,
      label: group.label,
      description: group.description,
      order: group.order,
      options: group.options.map((option) => {
        const override = overrideMap.get(option.id);
        return {
          id: option.id,
          groupId: option.groupId,
          label: option.label,
          description: option.description,
          defaultPriceModifier: option.priceModifier,
          defaultModifierType: option.modifierType,
          priceModifier: override ? override.priceModifier : option.priceModifier,
          modifierType: override ? override.modifierType : option.modifierType,
          isOverridden: !!override,
          order: option.order,
        };
      }),
    }));

    return NextResponse.json({
      model: baseModel,
      variants: variants.map((v) => ({
        id: v.id,
        label: v.label,
        storage: v.storage,
        buyingPrice: Number(v.buyingPrice),
        isActive: v.isActive,
      })),
      groups: checklistGroups,
    });
  } catch (error) {
    console.error('Failed to fetch model checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch model checklist' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { modifiers = [], resetOptionIds = [] } = body;

    let phoneModel = await prisma.phoneModel.findUnique({ where: { id } });
    const baseModel = phoneModel ? phoneModel.model : decodeURIComponent(id);

    await prisma.$transaction(async (tx) => {
      // If any options are requested to reset back to global defaults, remove their overrides
      if (Array.isArray(resetOptionIds) && resetOptionIds.length > 0) {
        await tx.modelConditionModifier.deleteMany({
          where: {
            model: baseModel,
            optionId: { in: resetOptionIds },
          },
        });
      }

      // Upsert custom overrides
      for (const item of modifiers) {
        if (!item.optionId) continue;
        const priceModifier = Number(item.priceModifier) || 0;
        const modifierType = item.modifierType === 'PERCENTAGE' ? PriceModifierType.PERCENTAGE : PriceModifierType.AMOUNT;

        await tx.modelConditionModifier.upsert({
          where: {
            model_optionId: {
              model: baseModel,
              optionId: item.optionId,
            },
          },
          update: {
            priceModifier,
            modifierType,
          },
          create: {
            model: baseModel,
            optionId: item.optionId,
            priceModifier,
            modifierType,
          },
        });
      }
    });

    return NextResponse.json({ success: true, model: baseModel });
  } catch (error) {
    console.error('Failed to update model checklist:', error);
    return NextResponse.json({ error: 'Failed to update model checklist' }, { status: 500 });
  }
}
