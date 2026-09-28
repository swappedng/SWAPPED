import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, label, value, priceModifier, order, isActive } = body;

    if (!groupId || !label || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const option = await prisma.conditionAttributeOption.create({
      data: {
        groupId,
        label,
        value,
        priceModifier: priceModifier ?? 1.0,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
  }
}

