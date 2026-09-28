import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const steps = await prisma.conditionAttributeGroup.findMany({
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return NextResponse.json(steps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assessment groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, key, description, order, isActive } = body;

    if (!label || !key) {
      return NextResponse.json({ error: 'Label and key are required' }, { status: 400 });
    }

    const group = await prisma.conditionAttributeGroup.create({
      data: {
        label,
        key,
        description,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create assessment group' }, { status: 500 });
  }
}

