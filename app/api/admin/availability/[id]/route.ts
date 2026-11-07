import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isUnavailable, unavailableStartHour, unavailableEndHour } = body;

    const block = await prisma.availabilityBlock.update({
      where: { id },
      data: {
        ...(isUnavailable !== undefined && { isUnavailable }),
        ...(unavailableStartHour !== undefined && { unavailableStartHour }),
        ...(unavailableEndHour !== undefined && { unavailableEndHour }),
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update availability block' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.availabilityBlock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete availability block' }, { status: 500 });
  }
}
