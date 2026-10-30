import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendAdminRejectionNotification } from '@/app/lib/email';

// GET /api/offer-response?token=... — retrieve offer details for customer preview
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    const offer = await prisma.swapOffer.findUnique({
      where: { responseToken: token },
      include: {
        swap: {
          include: {
            tradeInModel: true,
            upgradeCategory: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Invalid or expired offer link' }, { status: 404 });
    }

    const isExpired = !!offer.responseTokenExpiresAt && offer.responseTokenExpiresAt < new Date();

    return NextResponse.json({
      offer: {
        id: offer.id,
        status: offer.status,
        tradeInValue: Number(offer.tradeInValue),
        upgradePrice: Number(offer.upgradePrice),
        amountToPay: Number(offer.amountToPay),
        reason: offer.reason,
        expiresAt: offer.responseTokenExpiresAt,
        isExpired,
      },
      swap: {
        id: offer.swap.id,
        status: offer.swap.status,
        tradeInPhone: `${offer.swap.tradeInModel.model} ${offer.swap.tradeInModel.storage}`,
        originalTradeInValue: Number(offer.swap.tradeInValue),
        upgradePhone: `${offer.swap.upgradeModel} ${offer.swap.upgradeStorage}`,
        category: offer.swap.upgradeCategory.label,
        contactName: offer.swap.contactName,
      },
    });
  } catch (error) {
    console.error('Error fetching offer response details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/offer-response — customer accepts or rejects an offer via secure token
// Body: { token: string; action: 'accept' | 'reject' }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 400 });
    }
    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be "accept" or "reject"' }, { status: 400 });
    }

    const offer = await prisma.swapOffer.findUnique({
      where: { responseToken: token },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }
    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This offer has already been responded to or is no longer active' },
        { status: 422 }
      );
    }
    if (offer.responseTokenExpiresAt && offer.responseTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }

    const now = new Date();
    const newOfferStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    const newSwapStatus = action === 'accept' ? 'APPROVED' : 'REJECTED';

    await prisma.$transaction(async (tx) => {
      // Update the offer
      await tx.swapOffer.update({
        where: { id: offer.id },
        data: {
          status: newOfferStatus,
          respondedAt: now,
          // Invalidate token after use
          responseToken: null,
          responseTokenExpiresAt: null,
        },
      });

      // Update the swap status
      await tx.swap.update({
        where: { id: offer.swapId },
        data: { status: newSwapStatus },
      });

      // Audit entry
      await tx.swapAuditLog.create({
        data: {
          swapId: offer.swapId,
          adminId: null, // customer action
          action: action === 'accept' ? 'CUSTOMER_ACCEPTED_OFFER' : 'CUSTOMER_REJECTED_OFFER',
          field: 'status',
          oldValue: 'AWAITING_CUSTOMER_APPROVAL',
          newValue: newSwapStatus,
        },
      });
    });

    // If rejected, notify admin — failure must not break the response
    if (action === 'reject') {
      try {
        const swap = await prisma.swap.findUnique({
          where: { id: offer.swapId },
          include: { tradeInModel: true },
        });
        if (swap) {
          await sendAdminRejectionNotification({ swap, offer: {
            ...offer,
            tradeInValue: Number(offer.tradeInValue),
            upgradePrice: Number(offer.upgradePrice),
            amountToPay: Number(offer.amountToPay),
          }});
        }
      } catch (notifyErr) {
        console.error('Failed to notify admin of customer rejection:', notifyErr);
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      message:
        action === 'accept'
          ? 'Your offer has been accepted. We will be in touch to arrange fulfilment.'
          : 'Your decision has been recorded. An administrator will contact you regarding your device.',
    });
  } catch (error) {
    console.error('Error processing offer response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
