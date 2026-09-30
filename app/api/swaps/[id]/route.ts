import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const swapId = params.id;

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