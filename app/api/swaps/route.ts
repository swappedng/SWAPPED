import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendSwapConfirmationEmail } from '@/app/lib/email';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const swapId = searchParams.get('swapId');

  if (!swapId) {
    try {
      const swaps = await prisma.swap.findMany({
        include: { appointment: true },
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
      include: { appointment: true }
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
      tradeInPhone,
      newPhone,
      contactEmail,
      contactPhone,
      swapMethod,
      tradeInValue,
      newPhonePrice,
      amountToPay,
    } = data;

    if (!tradeInPhone || !newPhone || tradeInValue === undefined || newPhonePrice === undefined || amountToPay === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Keep legacy JSON fields for existing records, and persist contacts in
    // dedicated columns for admin reporting.
    const tradeInPhoneWithExtras = {
      ...tradeInPhone,
      contactEmail,
      contactPhone,
      swapMethod,
    };

    const swap = await prisma.swap.create({
      data: {
        tradeInPhone: tradeInPhoneWithExtras,
        newPhone,
        tradeInValue,
        newPhonePrice,
        amountToPay,
        contactEmail,
        contactPhone,
      },
    });

    // Send confirmation email
    if (contactEmail) {
      try {
        await sendSwapConfirmationEmail({
          to: contactEmail,
          swapDetails: {
            tradeInPhone,
            newPhone,
            tradeInValue,
            newPhonePrice,
            amountToPay,
            swapMethod: swapMethod || 'online',
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
