import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { sendRevisedOfferEmail, sendAdminRejectionNotification } from '@/app/lib/email';

// POST /api/swaps/[id]/offers — admin creates a revised offer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: swapId } = await params;

  try {
    const body = await req.json();
    const { tradeInValue, upgradePrice, amountToPay, reason } = body;

    // Validate financials
    const tv = Number(tradeInValue);
    const up = Number(upgradePrice);
    const atp = Number(amountToPay);
    if (
      !Number.isFinite(tv) ||
      !Number.isFinite(up) ||
      !Number.isFinite(atp)
    ) {
      return NextResponse.json({ error: 'Invalid financial values' }, { status: 400 });
    }
    if (tv < 0 || up < 0 || atp < 0) {
      return NextResponse.json({ error: 'Financial values must be non-negative' }, { status: 400 });
    }
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'A reason is required for a revised offer' }, { status: 400 });
    }

    const swap = await prisma.swap.findUnique({
      where: { id: swapId },
      include: { offers: true },
    });
    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    const offer = await prisma.$transaction(async (tx) => {
      // Supersede any currently PENDING offer
      await tx.swapOffer.updateMany({
        where: { swapId, status: 'PENDING' },
        data: { status: 'SUPERSEDED' },
      });

      // Generate a secure, unique token with a 72-hour expiry
      const responseToken = randomUUID();
      const responseTokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

      // Create the new revised offer
      const newOffer = await tx.swapOffer.create({
        data: {
          swapId,
          tradeInValue: new Decimal(tv),
          upgradePrice: new Decimal(up),
          amountToPay: new Decimal(atp),
          reason: reason.trim(),
          status: 'PENDING',
          responseToken,
          responseTokenExpiresAt,
        },
      });

      // Update current financial values on the swap
      await tx.swap.update({
        where: { id: swapId },
        data: {
          currentTradeInValue: new Decimal(tv),
          currentUpgradePrice: new Decimal(up),
          amountToPay: new Decimal(atp),
          status: 'AWAITING_CUSTOMER_APPROVAL',
        },
      });

      // Write audit entry
      await tx.swapAuditLog.create({
        data: {
          swapId,
          adminId: null,
          action: 'REVISED_OFFER_CREATED',
          reason: reason.trim(),
          newValue: JSON.stringify({ tradeInValue: tv, upgradePrice: up, amountToPay: atp }),
        },
      });

      return newOffer;
    });

    // Send customer email — failure must NOT invalidate the offer
    const emailResult = await sendRevisedOfferEmail({
      swap,
      offer: {
        ...offer,
        tradeInValue: Number(offer.tradeInValue),
        upgradePrice: Number(offer.upgradePrice),
        amountToPay: Number(offer.amountToPay),
      },
      originalTradeInValue: Number(swap.tradeInValue),
      reason: reason.trim(),
    });

    // Record whether the email was sent
    if (emailResult.success && offer.id) {
      await prisma.swapOffer.update({
        where: { id: offer.id },
        data: { sentAt: new Date() },
      });
    }

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error('Error creating swap offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/swaps/[id]/offers — list all offers for a swap
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: swapId } = await params;

  try {
    const offers = await prisma.swapOffer.findMany({
      where: { swapId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error fetching swap offers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
