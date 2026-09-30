import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendSwapConfirmationEmail } from '@/app/lib/email';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const swapId = searchParams.get('swapId');

  if (!swapId) {
    try {
      const swaps = await prisma.swap.findMany({
        include: {
          tradeInModel: true,
          upgradeCategory: true,
          conditions: true,
          appointment: true,
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
        conditions: true,
        appointment: true,
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
      conditions, // { groupKey: string; value: string }[]
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

    if (
      !tradeInModelId ||
      !upgradeCategoryId ||
      !upgradeModel ||
      !upgradeStorage ||
      !swapMethod ||
      tradeInValue === undefined ||
      upgradePrice === undefined ||
      amountToPay === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const swap = await prisma.swap.create({
      data: {
        tradeInModelId,
        tradeInValue,
        upgradeCategoryId,
        upgradeModel,
        upgradeStorage,
        upgradePrice,
        amountToPay,
        swapMethod,
        contactName,
        contactEmail,
        contactPhone,
        conditions: {
          create: Array.isArray(conditions)
            ? conditions.map(({ groupKey, value }: { groupKey: string; value: string }) => ({ groupKey, value }))
            : [],
        },
      },
      include: {
        tradeInModel: true,
        upgradeCategory: true,
        conditions: true,
      },
    });

    if (contactEmail) {
      try {
        await sendSwapConfirmationEmail({
          to: contactEmail,
          swapDetails: {
            tradeInPhone: { model: swap.tradeInModel.model, storage: swap.tradeInModel.storage },
            newPhone: { model: swap.upgradeModel, storage: swap.upgradeStorage },
            tradeInValue: swap.tradeInValue,
            newPhonePrice: swap.upgradePrice,
            amountToPay: swap.amountToPay,
            swapMethod: swap.swapMethod,
          },
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(swap, { status: 201 });
  } catch (error) {
    console.error('Error creating swap:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
