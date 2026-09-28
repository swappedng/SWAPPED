import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const includeInactive = new URL(request.url).searchParams.get('admin') === '1';
    const models = await prisma.phoneModel.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch phone models' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, value, model, storage, basePrice } = body;

    if (!label || !value || !model || !storage || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneModel = await prisma.phoneModel.create({
      data: {
        label,
        value,
        model,
        storage,
        basePrice,
      },
    });

    return NextResponse.json(phoneModel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create phone model' }, { status: 500 });
  }
}
