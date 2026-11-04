import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Get all unique model names that have at least one modifier configured
    const modifiers = await prisma.modelConditionModifier.findMany({
      select: {
        model: true,
      },
      distinct: ['model'],
    });

    const models = modifiers.map((m) => m.model);

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Failed to fetch modifiers summary:', error);
    return NextResponse.json({ error: 'Failed to fetch modifiers summary' }, { status: 500 });
  }
}
