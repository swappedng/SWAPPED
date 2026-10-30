import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { SwapStatus, VALID_STATUS_TRANSITIONS } from '@/lib/api/types/enums';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: swapId } = await params;

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: swapId } = await params;

  try {
    // adminId is null since no admin session system is active in this project
    const adminId: string | null = null;

    const body = await req.json();
    const { status: newStatus, reason } = body;

    if (!newStatus || !Object.values(SwapStatus).includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    const swap = await prisma.swap.findUnique({ where: { id: swapId } });
    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    const currentStatus = swap.status as SwapStatus;
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus as SwapStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition swap from ${currentStatus} to ${newStatus}`,
          allowedTransitions: allowed,
        },
        { status: 422 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.swap.update({
        where: { id: swapId },
        data: { status: newStatus as SwapStatus },
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

      await tx.swapAuditLog.create({
        data: {
          swapId,
          adminId,
          action: 'STATUS_CHANGED',
          field: 'status',
          oldValue: currentStatus,
          newValue: newStatus,
          reason: reason ?? null,
        },
      });

      return result;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating swap status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}