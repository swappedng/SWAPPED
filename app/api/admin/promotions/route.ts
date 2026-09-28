import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const boosts = await prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(boosts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, baseModel, condition, priceAdjustment, isPercentage, isActive } = body;

    if (!name || priceAdjustment === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const boost = await prisma.pricingRule.create({
      data: {
        name,
        description,
        baseModel: baseModel || 'ALL',
        condition,
        priceAdjustment,
        isPercentage: isPercentage !== undefined ? isPercentage : false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(boost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}

