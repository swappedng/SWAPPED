import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const blocks = await prisma.availabilityBlock.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(blocks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, isUnavailable, unavailableStartHour, unavailableEndHour } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const block = await prisma.availabilityBlock.create({
      data: {
        date,
        isUnavailable: isUnavailable ?? false,
        unavailableStartHour,
        unavailableEndHour,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create availability block' }, { status: 500 });
  }
}
