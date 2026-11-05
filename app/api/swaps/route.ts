import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendSwapConfirmationEmail } from '@/app/lib/email';
import { SwapMethod } from '@/lib/api/types/enums';
import { ConditionType } from '@/app/generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const swapId = searchParams.get('swapId');

  if (!swapId) {
    try {
      const swaps = await prisma.swap.findMany({
        include: {
          tradeInModel: true,
          upgradeCategory: true,
          phoneSellingPrice: true,
          conditions: true,
          appointment: true,
          offers: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(swaps);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  try {
    const swap = await prisma.swap.findUnique({
      where: { id: swapId },
      include: {
        tradeInModel: true,
        upgradeCategory: true,
        phoneSellingPrice: true,
        conditions: true,
        appointment: true,
        offers: { orderBy: { createdAt: 'desc' } },
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    return NextResponse.json(swap);
  } catch (error) {
    console.error('Error fetching swap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      tradeInModelId,
      tradeInValue,
      snapshotBuyingPrice,
      conditions, // { groupKey: string; value: string }[]
      phoneSellingPriceId,
      upgradeCategoryId,
      upgradeModel,
      upgradeStorage,
      upgradePrice,
      amountToPay,
      swapMethod,
      contactName,
      contactEmail,
      contactPhone,
    } = data;

    // Resolve snapshotBuyingPrice from phone model if omitted
    let sbp = snapshotBuyingPrice !== undefined ? Number(snapshotBuyingPrice) : NaN;
    if (!Number.isFinite(sbp) && tradeInModelId) {
      const pm = await prisma.phoneModel.findUnique({ where: { id: tradeInModelId } });
      if (pm) sbp = Number(pm.buyingPrice);
    }

    // Resolve phoneSellingPriceId from catalogue if omitted
    let resolvedSellingPriceId = phoneSellingPriceId;
    if (!resolvedSellingPriceId && upgradeCategoryId && upgradeModel && upgradeStorage) {
      const psp = await prisma.phoneSellingPrice.findFirst({
        where: {
          categoryId: upgradeCategoryId,
          phoneModel: { model: upgradeModel, storage: upgradeStorage },
        },
      });
      if (psp) resolvedSellingPriceId = psp.id;
    }

    // Validate required fields
    if (
      !tradeInModelId ||
      !resolvedSellingPriceId ||
      !upgradeCategoryId ||
      !upgradeModel ||
      !upgradeStorage ||
      !swapMethod ||
      tradeInValue === undefined ||
      !Number.isFinite(sbp) ||
      upgradePrice === undefined ||
      amountToPay === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numeric financials
    const tv = Number(tradeInValue);
    const up = Number(upgradePrice);
    const atp = Number(amountToPay);
    if (!Number.isFinite(tv) || !Number.isFinite(sbp) || !Number.isFinite(up) || !Number.isFinite(atp)) {
      return NextResponse.json({ error: 'Invalid financial values' }, { status: 400 });
    }
    if (tv < 0 || sbp < 0 || up < 0 || atp < 0) {
      return NextResponse.json({ error: 'Financial values must be non-negative' }, { status: 400 });
    }

    // Run creation in a transaction: swap + original offer + audit log entry
    const swap = await prisma.$transaction(async (tx) => {
      const created = await tx.swap.create({
        data: {
          tradeInModelId,
          snapshotBuyingPrice: new Decimal(sbp),
          tradeInValue: new Decimal(tv),
          phoneSellingPriceId: resolvedSellingPriceId,
          upgradeCategoryId,
          upgradeModel,
          upgradeStorage,
          upgradePrice: new Decimal(up),
          currentTradeInValue: new Decimal(tv),
          currentUpgradePrice: new Decimal(up),
          amountToPay: new Decimal(atp),
          swapMethod,
          contactName,
          contactEmail,
          contactPhone,
          status: 'SUBMITTED',
          conditions: {
            create: Array.isArray(conditions)
              ? conditions.map(({ groupKey, value }: { groupKey: string; value: string }) => {
                  // Map lowercase groupKey to ConditionType enum
                  const keyMap: Record<string, ConditionType> = {
                    battery: ConditionType.BATTERY,
                    screen: ConditionType.SCREEN,
                    faceid: ConditionType.FACE_ID,
                    backglass: ConditionType.BACK_GLASS,
                    body: ConditionType.BODY,
                    sim: ConditionType.SIM,
                  };
                  return {
                    groupKey: keyMap[groupKey.toLowerCase()] || ConditionType.BODY,
                    value,
                  };
                })
              : [],
          },
        },
        include: {
          tradeInModel: true,
          upgradeCategory: true,
          phoneSellingPrice: true,
          conditions: true,
        },
      });

      // Seed the original offer record
      await tx.swapOffer.create({
        data: {
          swapId: created.id,
          tradeInValue: new Decimal(tv),
          upgradePrice: new Decimal(up),
          amountToPay: new Decimal(atp),
          status: 'ORIGINAL',
        },
      });

      // Write the initial audit entry
      await tx.swapAuditLog.create({
        data: {
          swapId: created.id,
          action: 'SWAP_SUBMITTED',
          newValue: 'SUBMITTED',
        },
      });

      return created;
    });

    // Send confirmation email — failure must not block the response
    if (contactEmail) {
      try {
        await sendSwapConfirmationEmail({
          to: contactEmail,
          swapDetails: {
            tradeInPhone: { model: swap.tradeInModel.model, storage: swap.tradeInModel.storage },
            newPhone: { model: swap.upgradeModel, storage: swap.upgradeStorage },
            tradeInValue: Number(swap.tradeInValue),
            newPhonePrice: Number(swap.upgradePrice),
            amountToPay: Number(swap.amountToPay),
            swapMethod: swap.swapMethod as SwapMethod,
          },
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json(swap, { status: 201 });
  } catch (error) {
    console.error('Error creating swap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { swapId, swapMethod } = data;

    if (!swapId || !swapMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedSwap = await prisma.swap.update({
      where: { id: swapId },
      data: { swapMethod },
    });

    return NextResponse.json(updatedSwap, { status: 200 });
  } catch (error) {
    console.error('Error updating swap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

