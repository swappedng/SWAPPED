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
    const { label, model, storage, buyingPrice } = body;

    if (!label || !model || !storage || buyingPrice === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const phoneModel = await prisma.phoneModel.create({
      data: {
        label,
        model,
        storage,
        buyingPrice,
      },
    });

    return NextResponse.json(phoneModel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create phone model' }, { status: 500 });
  }
}
