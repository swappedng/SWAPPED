import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stepId, label, impactType, impactValue, order, isActive } = body;

    if (!stepId || !label || !impactType || impactValue === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const option = await prisma.assessmentOption.create({
      data: {
        stepId,
        label,
        impactType,
        impactValue,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
  }
}
