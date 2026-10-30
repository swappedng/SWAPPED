import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendRevisedOfferEmail } from '@/app/lib/email';

// POST /api/swaps/[id]/offers/[offerId]/resend — retry sending the offer email
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const { id: swapId, offerId } = await params;

  try {
    const offer = await prisma.swapOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.swapId !== swapId) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only PENDING offers can be resent' },
        { status: 422 }
      );
    }

    const swap = await prisma.swap.findUnique({ where: { id: swapId } });
    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    const emailResult = await sendRevisedOfferEmail({
      swap,
      offer: {
        ...offer,
        tradeInValue: Number(offer.tradeInValue),
        upgradePrice: Number(offer.upgradePrice),
        amountToPay: Number(offer.amountToPay),
      },
      originalTradeInValue: Number(swap.tradeInValue),
      reason: offer.reason ?? '',
    });

    if (emailResult.success) {
      await prisma.swapOffer.update({
        where: { id: offerId },
        data: { sentAt: new Date() },
      });

      await prisma.swapAuditLog.create({
        data: {
          swapId,
          action: 'OFFER_EMAIL_RESENT',
          field: 'sentAt',
          newValue: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ ok: emailResult.success, error: emailResult.error ?? null });
  } catch (error) {
    console.error('Error resending offer email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
