import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const admin = new URL(request.url).searchParams.get('admin') === '1';
  try {
    const categories = await prisma.phoneSaleCategory.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        prices: {
          where: admin ? undefined : { isActive: true },
          include: { phoneModel: true },
        },
      },
    });
    return NextResponse.json(categories.map((category) => ({
      ...category,
      prices: category.prices.map(({ phoneModel, ...price }) => ({
        ...price,
        model: phoneModel.model,
        storage: phoneModel.storage,
      })),
    })));
  } catch (error) {
    console.error('Failed to fetch sales catalogue:', error);
    return NextResponse.json({ error: 'Failed to fetch sales catalogue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { categoryId, phoneModelId, price, isActive = true } = await request.json();
    if (!categoryId || !phoneModelId || !Number.isFinite(Number(price))) {
      return NextResponse.json(
        { error: 'Category, phoneModelId and price are required' },
        { status: 400 }
      );
    }
    const item = await prisma.phoneSellingPrice.upsert({
      where: { categoryId_phoneModelId: { categoryId, phoneModelId } },
      update: { price: Number(price), isActive },
      create: { categoryId, phoneModelId, price: Number(price), isActive },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to save selling price:', error);
    return NextResponse.json({ error: 'Failed to save selling price' }, { status: 500 });
  }
}
